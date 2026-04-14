import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import {
  ValidationRuleBuilder,
  validators,
  validationErrorResponse,
  notFoundResponse,
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
    const { token, password, confirmPassword } = body;

    // Validate input
    const validation = new ValidationRuleBuilder()
      .addRule("token", validators.required("Reset token"))
      .addRule("password", validators.required("Password"))
      .addRule("password", validators.minLength(8, "Password"))
      .addRule("confirmPassword", validators.required("Password confirmation"));

    const errors = validation.validate(body);

    if (password !== confirmPassword) {
      errors.push({
        field: "confirmPassword",
        message: "Passwords do not match",
      });
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return notFoundResponse("Invalid or expired password reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return successResponse({
      message: "Password reset successful. You can now log in with your new password.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
    });
  } catch (error) {
    console.error("Error in reset password:", error);
    return internalErrorResponse("Failed to reset password", error);
  }
}
