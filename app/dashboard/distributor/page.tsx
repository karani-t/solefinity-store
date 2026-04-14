import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import DistributorDashboard from "./client";

export default async function DistributorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "DISTRIBUTOR") {
    redirect("/auth/signin");
  }

  return <DistributorDashboard />;
}
