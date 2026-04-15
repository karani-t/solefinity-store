"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UnifiedDashboardLayout } from "../components/UnifiedSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/auth/signin");
    }

    // Redirect admin users to admin dashboard
    if (session.user.role === "ADMIN" || session.user.role === "MANAGER") {
      router.push("/admin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-base-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <UnifiedDashboardLayout>
      {children}
    </UnifiedDashboardLayout>
  );
}
