import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import DistributorManagementClient from "./client";

export default async function DistributorManagement() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
    redirect("/");
  }

  return <DistributorManagementClient />;
}
