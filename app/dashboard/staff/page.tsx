import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import StaffDashboardClient from "./client";

export default async function StaffDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "STAFF") {
    redirect("/dashboard/customer");
  }

  return <StaffDashboardClient />;
}
