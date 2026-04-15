/**
 * Security Utilities Library
 * Central hub for all security-related operations
 * 
 * Includes:
 * - Input sanitization & validation
 * - XSS prevention
 * - SQL Injection prevention via Prisma
 * - Rate limiting helpers
 * - Activity logging
 * - Login attempt tracking
 */

import { prisma } from "./prisma";

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes potentially dangerous HTML/JavaScript
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  
  return input
    .trim()
    .replace(/[<>"{};]/g, "") // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * @param password - Password to validate
 * @returns object with isValid flag and error message if invalid
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain number" };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { isValid: false, error: "Password must contain special character (!@#$%^&*)" };
  }
  return { isValid: true };
}

/**
 * Validates phone number (Kenya format)
 * Accepts: +254..., 0254..., 0..., etc.
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+?254|0)[1-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Log user activity for audit trail
 * @param userId - User ID who performed the action
 * @param action - Type of action (LOGIN, LOGOUT, CREATE_ORDER, etc.)
 * @param resource - Resource affected (optional)
 * @param description - Detailed description
 * @param status - SUCCESS or FAILED
 * @param ipAddress - User IP address (optional)
 * @param userAgent - Browser/client info (optional)
 */
export async function logActivity(
  userId: string,
  action: string,
  description: string,
  options?: {
    resource?: string;
    status?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        description,
        resource: options?.resource,
        status: options?.status || "SUCCESS",
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        metadata: options?.metadata
          ? JSON.stringify(options.metadata)
          : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Dont throw - logging failures shouldn't break the app
  }
}

/**
 * Track login attempt for security monitoring
 * @param email - Email attempting to log in
 * @param status - SUCCESS or FAILED
 * @param reason - Why it failed (optional)
 * @param ipAddress - User IP address (optional)
 * @param userAgent - Browser/client info (optional)
 */
export async function trackLoginAttempt(
  email: string,
  status: "SUCCESS" | "FAILED",
  options?: {
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  try {
    await prisma.loginAttempt.create({
      data: {
        email,
        status,
        reason: options?.reason,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
      },
    });

    // Check for brute force (5+ failed attempts in last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentFailures = await prisma.loginAttempt.count({
      where: {
        email,
        status: "FAILED",
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (recentFailures >= 5) {
      console.warn(`⚠️  BRUTE FORCE ALERT: ${email} has ${recentFailures} failed login attempts`);
      // Could trigger additional actions like temp account lock
    }
  } catch (error) {
    console.error("Failed to track login attempt:", error);
  }
}

/**
 * Get user IP address from request headers
 * @param req - Next.js Request object or headers
 * @returns IP address string
 */
export function getClientIp(req: any): string | undefined {
  const forwarded = req?.headers?.get?.("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req?.headers?.get?.("x-real-ip") || req?.ip || undefined;
}

/**
 * Get user agent from request headers
 * @param req - Next.js Request object or headers
 * @returns User Agent string
 */
export function getUserAgent(req: any): string | undefined {
  return req?.headers?.get?.("user-agent") || undefined;
}

/**
 * Rate limiting check (simple in-memory)
 * For production, use Redis or similar
 * @param key - Unique key (e.g., email, IP)
 * @param limit - Max attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if within limit, false if exceeded
 */
const attemptMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const attempt = attemptMap.get(key);

  if (!attempt || now > attempt.resetTime) {
    // New window or expired
    attemptMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (attempt.count >= limit) {
    return false; // Rate limit exceeded
  }

  attempt.count++;
  return true; // Within limit
}

/**
 * Reset rate limit for a key
 * @param key - Unique key to reset
 */
export function resetRateLimit(key: string): void {
  attemptMap.delete(key);
}

/**
 * Check if user has required role
 * @param userRole - User's current role
 * @param requiredRole - Role(s) needed
 * @returns true if authorized
 */
export function hasRole(
  userRole: string,
  requiredRole: string | string[]
): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
}

/**
 * Check if user can access resource based on ID
 * Prevents users from accessing other user's data
 * @param currentUserId - Authenticated user ID
 * @param resourceOwnerId - Owner of resource
 * @returns true if authorized
 */
export function canAccessResource(
  currentUserId: string,
  resourceOwnerId: string
): boolean {
  return currentUserId === resourceOwnerId;
}

export default {
  sanitizeInput,
  isValidEmail,
  validatePasswordStrength,
  isValidPhone,
  logActivity,
  trackLoginAttempt,
  getClientIp,
  getUserAgent,
  checkRateLimit,
  resetRateLimit,
  hasRole,
  canAccessResource,
};
