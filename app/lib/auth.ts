/**
 * NextAuth Configuration
 * 
 * Security Features:
 * - Bcrypt password hashing (10 rounds)
 * - JWT session strategy  
 * - Login attempt tracking
 * - Activity logging
 * - Last login timestamp tracking
 * - Role-based access control
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { trackLoginAttempt, logActivity } from "./security";

declare module "next-auth" {
  interface User {
    role: string;
    phone?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      phone?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    phone?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Authorize function - Validates credentials and performs security checks
       * Tracks both successful and failed login attempts
       */
      async authorize(credentials, req) {
        // Validate input exists
        if (!credentials?.email || !credentials?.password) {
          await trackLoginAttempt(
            credentials?.email || "unknown",
            "FAILED",
            { reason: "MISSING_CREDENTIALS" }
          );
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user) {
            // Track failed attempt
            await trackLoginAttempt(credentials.email, "FAILED", {
              reason: "USER_NOT_FOUND",
            });
            return null;
          }

          // Check if user account is active
          if (!user.isActive) {
            await trackLoginAttempt(credentials.email, "FAILED", {
              reason: "USER_INACTIVE",
            });
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            // Track failed attempt
            await trackLoginAttempt(credentials.email, "FAILED", {
              reason: "INVALID_PASSWORD",
            });
            return null;
          }

          // Update last login timestamp
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          // Track successful login
          await trackLoginAttempt(credentials.email, "SUCCESS");

          // Log successful authentication
          await logActivity(
            user.id,
            "LOGIN",
            `User logged in successfully (${user.role})`
          );

          // Return user for JWT token
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone || undefined,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          await trackLoginAttempt(
            credentials.email,
            "FAILED",
            { reason: "SYSTEM_ERROR" }
          );
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    /**
     * JWT Callback - Add user data to JWT token
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },

    /**
     * Session Callback - Add data from token to session
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string | undefined;
      }
      return session;
    },

    /**
     * Redirect Callback - Handle post-login redirects
     * Sign-in page handles role-based redirects
     */
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};