/**
 * API Error Handling Utilities
 * 
 * Provides consistent, secure error responses
 * - Non-sensitive error messages to clients
 * - Detailed logging for developers
 * - Proper HTTP status codes
 * - Standardized response format
 */

import { NextResponse } from "next/server";

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Standard error response formats
 */
export const ApiErrors = {
  /**
   * 400 Bad Request - Invalid input
   */
  badRequest: (message: string = "Invalid request") => ({
    error: message,
    code: "BAD_REQUEST",
    status: 400,
  }),

  /**
   * 401 Unauthorized - Authentication required
   */
  unauthorized: (message: string = "Authentication required") => ({
    error: message,
    code: "UNAUTHORIZED",
    status: 401,
  }),

  /**
   * 403 Forbidden - User lacks permission
   */
  forbidden: (message: string = "Access denied") => ({
    error: message,
    code: "FORBIDDEN",
    status: 403,
  }),

  /**
   * 404 Not Found
   */
  notFound: (resource: string = "Resource") => ({
    error: `${resource} not found`,
    code: "NOT_FOUND",
    status: 404,
  }),

  /**
   * 409 Conflict - Resource already exists
   */
  conflict: (message: string = "Resource already exists") => ({
    error: message,
    code: "CONFLICT",
    status: 409,
  }),

  /**
   * 429 Too Many Requests - Rate limited
   */
  rateLimited: () => ({
    error: "Too many requests. Please try again later.",
    code: "RATE_LIMITED",
    status: 429,
  }),

  /**
   * 500 Internal Server Error
   */
  internal: (message: string = "An unexpected error occurred") => ({
    error: message,
    code: "INTERNAL_ERROR",
    status: 500,
  }),
};

/**
 * Create standardized error response
 * @param error - Error object from ApiErrors
 * @param details - Additional details (dev only - not sent to client)
 */
export function createErrorResponse(
  error: ReturnType<typeof ApiErrors.badRequest>,
  details?: Record<string, any>
) {
  // Log detailed error for debugging
  if (details) {
    console.error(`[${error.code}]`, details);
  }

  // Return only safe information to client
  const response: ApiErrorResponse = {
    error: error.error,
    code: error.code,
  };

  return NextResponse.json(response, { status: error.status });
}

/**
 * Validate required fields in request body
 * @param data - Request body object
 * @param required - Array of required field names
 * @returns Error response if validation fails, null if valid
 */
export function validateRequired(
  data: Record<string, any>,
  required: string[]
): ReturnType<typeof ApiErrors.badRequest> | null {
  const missing = required.filter(
    (field) => !data[field] || (typeof data[field] === "string" && !data[field].trim())
  );

  if (missing.length > 0) {
    return ApiErrors.badRequest(
      `Missing required fields: ${missing.join(", ")}`
    );
  }

  return null;
}

/**
 * Validate email format
 */
export function validateEmail(
  email: string
): ReturnType<typeof ApiErrors.badRequest> | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return ApiErrors.badRequest("Invalid email format");
  }
  return null;
}

/**
 * Validate number is within range
 */
export function validateNumberRange(
  value: any,
  min: number,
  max: number,
  fieldName: string
): ReturnType<typeof ApiErrors.badRequest> | null {
  const num = Number(value);
  if (isNaN(num) || num < min || num > max) {
    return ApiErrors.badRequest(
      `${fieldName} must be between ${min} and ${max}`
    );
  }
  return null;
}

/**
 * Sanitize and validate string input
 */
export function validateString(
  value: any,
  options?: {
    minLength?: number;
    maxLength?: number;
    fieldName?: string;
  }
): ReturnType<typeof ApiErrors.badRequest> | null {
  const fieldName = options?.fieldName || "Field";

  if (typeof value !== "string") {
    return ApiErrors.badRequest(`${fieldName} must be a string`);
  }

  if (options?.minLength && value.trim().length < options.minLength) {
    return ApiErrors.badRequest(
      `${fieldName} must be at least ${options.minLength} characters`
    );
  }

  if (options?.maxLength && value.length > options.maxLength) {
    return ApiErrors.badRequest(
      `${fieldName} must be at most ${options.maxLength} characters`
    );
  }

  return null;
}

export default {
  ApiErrors,
  createErrorResponse,
  validateRequired,
  validateEmail,
  validateNumberRange,
  validateString,
};
