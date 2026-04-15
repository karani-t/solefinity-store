import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update last login timestamp
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { lastLogin: new Date() },
      select: {
        id: true,
        lastLogin: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error updating last login:", error);
    return NextResponse.json({ error: "Failed to update last login" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching login info:", error);
    return NextResponse.json({ error: "Failed to fetch login info" }, { status: 500 });
  }
}
