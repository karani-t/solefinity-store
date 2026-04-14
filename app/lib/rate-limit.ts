// Simple in-memory rate limiter
// Note: For production, consider using Redis or similar for distributed rate limiting

interface RateLimit {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimit>();

export function createRateLimiter(
  maxRequests: number,
  windowMs: number // in milliseconds
) {
  return (identifier: string): boolean => {
    const now = Date.now();
    const key = `${identifier}`;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    const limit = rateLimitStore.get(key)!;

    // Reset if window has passed
    if (now > limit.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    // Check if limit exceeded
    if (limit.count >= maxRequests) {
      return false;
    }

    // Increment counter
    limit.count++;
    return true;
  };
}

// Common rate limiters
export const loginRateLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = createRateLimiter(100, 60 * 1000); // 100 requests per minute
export const authRateLimiter = createRateLimiter(3, 60 * 1000); // 3 requests per minute
export const passwordResetRateLimiter = createRateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour

export function getRateLimitHeaders(limit: number, remaining: number, resetTime: number) {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": new Date(resetTime).toISOString(),
  };
}
