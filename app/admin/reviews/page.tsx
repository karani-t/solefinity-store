import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import ReviewsPage from "./client";

export default async function AdminReviews() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    redirect("/auth/signin");
  }

  return <ReviewsPage />;
}