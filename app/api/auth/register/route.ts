/**
 * POST /api/auth/register
 * 
 * Registers a new customer account with:
 * - Input validation & sanitization
 * - Password strength verification
 * - Email verification
 * - Phone validation
 * - Brute force protection
 * 
 * Returns: User object (without password)
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import {
  sanitizeInput,
  isValidEmail,
  validatePasswordStrength,
  isValidPhone,
  checkRateLimit,
  logActivity,
  getClientIp,
  getUserAgent,
} from "@/app/lib/security";

export async function POST(request: NextRequest) {
  try {
    // Get client IP and user agent for security tracking
    const clientIp = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Rate limiting - max 5 registration attempts per IP per 15 minutes
    const ipKey = `register:${clientIp}`;
    if (!checkRateLimit(ipKey, 5, 15 * 60 * 1000)) {
      console.warn(`🚨 RATE LIMIT: Registration attempt blocked from IP ${clientIp}`);
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const { name, email, password, phone } = body;

    // ============ INPUT VALIDATION ============

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required and must be non-empty" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Validate phone (optional but if provided, must be valid)
    if (phone) {
      if (typeof phone !== "string" || !isValidPhone(phone)) {
        return NextResponse.json(
          { error: "Please provide a valid Kenyan phone number" },
          { status: 400 }
        );
      }
    }

    // ============ DATABASE CHECKS ============

    // Check if email already exists
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEmailUser) {
      return NextResponse.json(
        { error: "Email already registered. Please sign in or use a different email." },
        { status: 400 }
      );
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhoneUser = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhoneUser) {
        return NextResponse.json(
          { error: "Phone number already associated with an account" },
          { status: 400 }
        );
      }
    }

    // ============ USER CREATION ============

    // Hash password with bcrypt (10 salt rounds for security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user account
    const user = await prisma.user.create({
      data: {
        name: sanitizeInput(name),
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || undefined,
        role: "CUSTOMER", // Default role for new registrations
        isActive: true,
      },
    });

    // ============ SECURITY LOGGING ============

    // Log successful registration
    await logActivity(
      user.id,
      "REGISTRATION",
      `New customer account created`,
      {
        ipAddress: clientIp,
        userAgent: userAgent,
        metadata: { email: user.email },
      }
    );

    // ============ RESPONSE ============

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please sign in.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Registration failed. Please try again later." },
      { status: 500 }
    );
  }
}