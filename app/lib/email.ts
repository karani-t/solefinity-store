import nodemailer from "nodemailer";

// Real email service with Nodemailer SMTP
export class EmailService {
  public transporter: any;

  constructor() {
    // Configure with environment variables
    // For development/testing, you can use:
    // - Gmail: Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    // - Mailgun: Use SMTP credentials from Mailgun
    // - Any SMTP server
    
    const smtpHost = process.env.SMTP_HOST || "localhost";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";
    const smtpFrom = process.env.SMTP_FROM || "noreply@solefinity.com";

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: smtpUser && smtpPass ? {
        user: smtpUser,
        pass: smtpPass,
      } : undefined,
    });

    // Verify connection on init
    this.transporter.verify((error: any, success: boolean) => {
      if (error) {
        console.warn("⚠️  Email service connection failed. Using fallback logging.");
        console.warn("Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS environment variables.");
        console.warn("Error:", error.message);
      } else {
        console.log("✅ Email service connected and ready");
      }
    });
  }

  async sendOrderConfirmation(orderData: {
    orderId: string;
    customerEmail: string;
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    shippingAddress: any;
  }) {
    const { orderId, customerEmail, customerName, items, total, shippingAddress } = orderData;

    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KES ${((item.price ?? 0) as number).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Order Confirmation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase!</p>
        </div>

        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Order Details</h2>
          <p><strong>Order ID:</strong> #${orderId.slice(-8)}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>

          <h3 style="color: #333; margin: 30px 0 15px 0;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">KES ${((total ?? 0) as number).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <h3 style="color: #333; margin: 30px 0 15px 0;">Shipping Address</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <p style="margin: 0;">${shippingAddress.name}</p>
            <p style="margin: 5px 0;">${shippingAddress.address}</p>
            <p style="margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.zipCode}</p>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #e8f5e8; border-radius: 5px;">
            <h4 style="color: #2e7d32; margin: 0 0 10px 0;">What's Next?</h4>
            <ul style="color: #2e7d32; margin: 0; padding-left: 20px;">
              <li>Your order is being processed</li>
              <li>You'll receive shipping updates via email</li>
              <li>Estimated delivery: 3-5 business days</li>
            </ul>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
          <p style="margin: 0;">© 2026 SoleFinity Store. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Questions? Contact our support team.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: '"SoleFinity Store" <noreply@solefinity.com>',
        to: customerEmail,
        subject: `Order Confirmation - #${orderId.slice(-8)}`,
        html,
      });
      return { success: true };
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      return { success: false, error };
    }
  }

  async sendOrderStatusUpdate(orderData: {
    orderId: string;
    customerEmail: string;
    customerName: string;
    status: string;
    trackingNumber?: string;
  }) {
    const { orderId, customerEmail, customerName, status, trackingNumber } = orderData;

    const statusMessages = {
      CONFIRMED: "Your order has been confirmed and is being prepared for shipment.",
      SHIPPED: `Your order has been shipped! ${trackingNumber ? `Tracking number: ${trackingNumber}` : ""}`,
      DELIVERED: "Your order has been delivered successfully!",
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Order Update</h1>
        </div>

        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${customerName},</h2>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Order #${orderId.slice(-8)}</h3>
            <p style="margin: 0; font-size: 16px; color: #2e7d32; font-weight: bold;">
              Status: ${status}
            </p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            ${statusMessages[status as keyof typeof statusMessages] || `Your order status has been updated to: ${status}`}
          </p>

          ${trackingNumber ? `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #1565c0;">
                <strong>Tracking Number:</strong> ${trackingNumber}
              </p>
            </div>
          ` : ""}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL || "https://solefinity.onrender.com"}/orders"
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order Details
            </a>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
          <p style="margin: 0;">© 2026 SoleFinity Store. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: '"SoleFinity Store" <noreply@solefinity.com>',
        to: customerEmail,
        subject: `Order Update - #${orderId.slice(-8)}`,
        html,
      });
      return { success: true };
    } catch (error) {
      console.error("Error sending order status update email:", error);
      return { success: false, error };
    }
  }

  async sendReviewNotification(reviewData: {
    reviewId: string;
    customerName: string;
    customerEmail: string;
    productName: string;
    rating: number;
    comment?: string;
    adminEmails: string[];
  }) {
    const { reviewId, customerName, customerEmail, productName, rating, comment, adminEmails } = reviewData;

    const stars = "⭐".repeat(rating);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Customer Review</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">A customer has left a review</p>
        </div>

        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Review Details</h2>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 10px 0;">${productName}</h3>
            <p style="margin: 5px 0; font-size: 18px; color: #ffd700;">${stars} (${rating}/5)</p>
            <p style="margin: 10px 0;"><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
            <p style="margin: 10px 0;"><strong>Review ID:</strong> ${reviewId.slice(-8)}</p>
          </div>

          ${comment ? `
            <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404; margin: 0 0 10px 0;">Customer Comment:</h4>
              <p style="color: #856404; margin: 0; font-style: italic;">"${comment}"</p>
            </div>
          ` : `
            <div style="background: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #0c5460; margin: 0;">This review only contains a star rating.</p>
            </div>
          `}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || "https://solefinity.onrender.com"}/admin/reviews"
               style="background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              View All Reviews
            </a>
          </div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #2e7d32; margin: 0 0 10px 0;">Action Required:</h4>
            <ul style="color: #2e7d32; margin: 0; padding-left: 20px;">
              <li>Review the customer feedback</li>
              <li>Approve or respond to the review</li>
              <li>Take any necessary follow-up actions</li>
            </ul>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
          <p style="margin: 0;">© 2026 SoleFinity Store. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated notification for new reviews.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: '"SoleFinity Store" <noreply@solefinity.com>',
        to: adminEmails.join(", "),
        subject: `New Review: ${rating} Stars for ${productName}`,
        html,
      });
      return { success: true };
    } catch (error) {
      console.error("Error sending review notification email:", error);
      return { success: false, error };
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }) {
    const { to, subject, html } = options;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@solefinity.com",
        to,
        subject,
        html,
      });
      return { success: true };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }
  }
}

export const emailService = new EmailService();

export async function sendCredentialsEmail(email: string, name: string, password: string, role: string, accessUrl: string) {
  const roleDescriptions: Record<string, string> = {
    STAFF: "As a staff member, you can make sales, manage customer orders, confirm payments, and generate sales reports.",
    DISTRIBUTOR: "As a distributor, you can place orders, manage your credit limit, view pricing tiers, and track your orders.",
    MANAGER: "As a manager, you have staff and inventory management capabilities.",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to SoleFinity!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account is ready</p>
      </div>

      <div style="padding: 30px; background: white;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Your account has been created as a <strong>${role}</strong> user in the SoleFinity system.
        </p>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2e7d32; margin: 0 0 15px 0;">Your Access Details</h3>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #f5f5f5; padding: 5px 10px; border-radius: 3px;">${password}</code></p>
          <p style="margin: 10px 0; color: #1565c0;"><strong>⚠️ Change this password on first login for security.</strong></p>
        </div>

        <h3 style="color: #333; margin: 20px 0 10px 0;">Your Role & Responsibilities</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #555;">
          ${roleDescriptions[role] || "Your role provides access to relevant business features."}
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${accessUrl}" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
            Sign In to Your Account
          </a>
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0;">First Steps:</h4>
          <ol style="margin: 0; padding-left: 20px;">
            <li>Sign in with your email and temporary password</li>
            <li>Update your password to something secure</li>
            <li>Complete your profile information</li>
            <li>Start using your dashboard</li>
          </ol>
        </div>

        <p style="font-size: 14px; color: #888; margin-top: 20px;">
          If you did not request this account, please contact our support team immediately.
        </p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">© 2026 SoleFinity Store. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">Questions? Contact our support team at support@solefinity.com</p>
      </div>
    </div>
  `;

  try {
    await emailService.transporter.sendMail({
      from: '"SoleFinity Admin" <noreply@solefinity.com>',
      to: email,
      subject: `[SoleFinity] Welcome ${name}! Your Account is Ready`,
      html,
    });
    console.log(`📧 [EMAIL] Credentials sent to ${email} (${role})`);
    return { success: true };
  } catch (error) {
    console.error("Error sending credentials email:", error);
    console.log(`📧 [EMAIL DEV MODE] Credentials for ${email}:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    return { success: false, error };
  }
}
