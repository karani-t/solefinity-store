import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";

export default async function DistributorsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role === "DISTRIBUTOR") {
    redirect("/dashboard/distributor");
  }

  if (session.user.role === "ADMIN" || session.user.role === "MANAGER") {
    redirect("/admin/distributors");
  }

  // Fallback to homepage for any other role
  redirect("/");
}
