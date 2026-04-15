"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { UnifiedDashboardLayout } from "../components/UnifiedSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      redirect("/auth/signin");
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-base-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <UnifiedDashboardLayout title="Admin Panel">
      {children}
    </UnifiedDashboardLayout>
  );
}