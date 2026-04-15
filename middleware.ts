/**
 * NextAuth Middleware - RBAC Protection
 * Enforces role-based access control for protected routes
 * 
 * Protected Patterns:
 * - /admin/* -> ADMIN only
 * - /dashboard/staff -> STAFF only
 * - /dashboard/distributor -> DISTRIBUTOR only
 * - /dashboard/customer -> CUSTOMER only
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";

// Define role-based route protection
const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/dashboard/staff": ["STAFF"],
  "/dashboard/distributor": ["DISTRIBUTOR"],
  "/dashboard/customer": ["CUSTOMER"],
  "/staff": ["STAFF"],
  "/distributors": ["DISTRIBUTOR"],
};

export default withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if current path requires specific role
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (path.startsWith(route)) {
        // User's role must be in allowed roles
        if (!token?.role || !allowedRoles.includes(token.role as string)) {
          console.warn(
            `🚨 UNAUTHORIZED ACCESS: User ${token?.email} (${token?.role}) attempted to access ${path}`
          );

          // Redirect to appropriate page based on actual role
          const roleRedirects: Record<string, string> = {
            ADMIN: "/admin",
            STAFF: "/dashboard/staff",
            DISTRIBUTOR: "/dashboard/distributor",
            CUSTOMER: "/dashboard/customer",
          };

          const redirectUrl = roleRedirects[token?.role as string] || "/auth/signin";
          return NextResponse.redirect(new URL(redirectUrl, req.url));
        }

        // User is authorized for this route
        return NextResponse.next();
      }
    }

    // Allow requests to routes not requiring specific roles
    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * Only allow authenticated users to access protected routes
       */
      authorized: ({ token }) => {
        return !!token;
      },
    },
  }
);

// Apply middleware to protected routes
export const config = {
  matcher: [
    // Admin routes
    "/admin/:path*",
    // Dashboard routes
    "/dashboard/:path*",
    // Staff routes
    "/staff",
    // Distributor routes
    "/distributors",
  ],
};
