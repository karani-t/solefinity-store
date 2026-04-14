import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { emailService } from "../../../lib/email";
import crypto from "crypto";
import {
  validationErrorResponse,
  internalErrorResponse,
  successResponse,
} from "../../../lib/validation";
import { passwordResetRateLimiter } from "../../../lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // Apply rate limiting
    if (!passwordResetRateLimiter(clientIp)) {
      return NextResponse.json(
        {
          error: "Too many password reset attempts. Please try again in 1 hour.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validate input
    const errors: Array<{ field: string; message: string }> = [];

    if (!email || (typeof email === "string" && email.trim().length === 0)) {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      // Return success to prevent email enumeration
      return successResponse({
        message: "If an account exists with this email, a password reset link will be sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

      await emailService.sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name || "User"},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetLink}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>Best regards,<br/>Sole Finity Support Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Clear the token if email sending fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return internalErrorResponse(
        "Failed to send password reset email. Please try again later."
      );
    }

    return successResponse({
      message: "If an account exists with this email, a password reset link will be sent.",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return internalErrorResponse("Failed to process password reset request", error);
  }
}
