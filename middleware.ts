import { withAuth } from "next-auth/middleware";

export default withAuth((req) => {
  // Middleware can be used for additional checks if needed
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/staff"],
};
