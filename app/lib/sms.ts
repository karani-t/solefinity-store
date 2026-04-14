/**
 * SMS Notification Service for Kenya
 * Supports multiple providers (Africastalking, Twilio, etc.)
 * For production, integrate with real SMS provider
 */

export interface SMSOptions {
  phoneNumber: string;
  message: string;
  type: "order_status" | "stock_alert" | "payment_confirmation" | "otp" | "delivery";
}

export class SMSService {
  private isDev = process.env.NODE_ENV === "development";
  private provider = process.env.SMS_PROVIDER || "console"; // console, africastalking, twilio

  /**
   * Send SMS notification
   */
  async sendSMS(options: SMSOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    const { phoneNumber, message, type } = options;

    // Normalize phone number
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    try {
      if (this.isDev) {
        return this.logSmsDevMode(normalizedPhone, message, type);
      }

      // Send via configured provider
      switch (this.provider) {
        case "africastalking":
          return await this.sendViaAfricasTalking(normalizedPhone, message);
        case "twilio":
          return await this.sendViaTwilio(normalizedPhone, message);
        default:
          return this.logSmsDevMode(normalizedPhone, message, type);
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send SMS",
      };
    }
  }

  /**
   * Send order status notification
   */
  async notifyOrderStatus(
    phoneNumber: string,
    orderId: string,
    status: string
  ): Promise<{ success: boolean; error?: string }> {
    const statusMessages: Record<string, string> = {
      PENDING: `Your order #${orderId} has been received. Payment pending.`,
      CONFIRMED: `Payment confirmed! Order #${orderId} being prepared for shipment.`,
      SHIPPED: `Your order #${orderId} has been shipped. Track at https://sole.ke/track/${orderId}`,
      DELIVERED: `Order #${orderId} delivered! Thank you for shopping with Groomers Cave.`,
      CANCELLED: `Order #${orderId} has been cancelled.`,
    };

    const message = statusMessages[status] || `Order #${orderId} status update: ${status}`;

    return this.sendSMS({
      phoneNumber,
      message,
      type: "order_status",
    });
  }

  /**
   * Send low stock alert to staff
   */
  async notifyLowStock(
    phoneNumber: string,
    productName: string,
    quantity: number
  ): Promise<{ success: boolean; error?: string }> {
    const message = `⚠️ Stock Alert: ${productName} is low (${quantity} units). Please restock.`;

    return this.sendSMS({
      phoneNumber,
      message,
      type: "stock_alert",
    });
  }

  /**
   * Send payment confirmation
   */
  async notifyPaymentConfirmation(
    phoneNumber: string,
    orderId: string,
    amountKES: number
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Payment of KES ${amountKES} confirmed for order #${orderId}. Thank you!`;

    return this.sendSMS({
      phoneNumber,
      message,
      type: "payment_confirmation",
    });
  }

  /**
   * Send credentials to new staff/distributor
   */
  async sendCredentials(
    phoneNumber: string,
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Welcome to Groomers Cave, ${name}! 🎉\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\n\nRole: ${role}\n\nVisit: groomerscave.com/signin to log in.`;

    return this.sendSMS({
      phoneNumber,
      message,
      type: "otp",
    });
  }

  /**
   * Send OTP for 2FA
   */
  async sendOTP(phoneNumber: string, code: string): Promise<{ success: boolean; error?: string }> {
    const message = `Your Groomers Cave verification code is: ${code}. Valid for 10 minutes.`;

    return this.sendSMS({
      phoneNumber,
      message,
      type: "otp",
    });
  }

  /**
   * Normalize phone number to 254xxxxxxxxx format
   */
  private normalizePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.substring(1);
    } else if (!cleaned.startsWith("254")) {
      cleaned = "254" + cleaned;
    }

    return cleaned;
  }

  /**
   * Log SMS in development mode
   */
  private logSmsDevMode(
    phoneNumber: string,
    message: string,
    type: string
  ): { success: boolean; messageId: string } {
    console.log(`📱 [SMS] ${type.toUpperCase()}`);
    console.log(`   To: ${phoneNumber}`);
    console.log(`   Message: ${message}`);
    console.log("");

    return {
      success: true,
      messageId: `DEV-SMS-${Date.now()}`,
    };
  }

  /**
   * Send via Africa's Talking (requires API key)
   */
  private async sendViaAfricasTalking(
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const apiKey = process.env.AFRICASTALKING_API_KEY;
    const username = process.env.AFRICASTALKING_USERNAME || "sandbox";

    if (!apiKey) {
      return { success: false, error: "Africa's Talking API key not configured" };
    }

    try {
      const response = await fetch("https://api.sandbox.africastalking.com/version1/messaging", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "X-API-Key": apiKey,
        },
        body: new URLSearchParams({
          username,
          to: phoneNumber,
          message,
        }).toString(),
      });

      const data: any = await response.json();

      if (data.SMSMessageData?.Recipients?.[0]?.statusCode === "101") {
        return {
          success: true,
          messageId: data.SMSMessageData.Recipients[0].messageId,
        };
      }

      return {
        success: false,
        error: data.SMSMessageData?.Recipients?.[0]?.statusMessage || "Failed to send SMS",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send SMS",
      };
    }
  }

  /**
   * Send via Twilio (requires Account SID and Auth Token)
   */
  private async sendViaTwilio(
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: "Twilio credentials not configured" };
    }

    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
          },
          body: new URLSearchParams({
            To: phoneNumber,
            From: fromNumber,
            Body: message,
          }).toString(),
        }
      );

      const data: any = await response.json();

      if (response.ok && data.sid) {
        return { success: true, messageId: data.sid };
      }

      return { success: false, error: data.message || "Failed to send SMS" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send SMS",
      };
    }
  }
}

export const smsService = new SMSService();