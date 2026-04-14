import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log login activity via audit trail instead
    // This is a placeholder for real login tracking via audit logs
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating last login:", error);
    return NextResponse.json({ error: "Failed to update last login" }, { status: 500 });
  }
}
