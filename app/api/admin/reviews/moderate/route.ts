import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId, action, response } = await request.json();

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: "Review ID and action are required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (action === "approve") {
      updateData.isApproved = true;
    } else if (action === "reject") {
      updateData.isApproved = false;
    } else if (action === "respond") {
      if (!response?.trim()) {
        return NextResponse.json(
          { error: "Response text is required" },
          { status: 400 }
        );
      }
      updateData.adminResponse = response.trim();
      updateData.respondedBy = session.user.id;
      updateData.respondedAt = new Date();
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve', 'reject', or 'respond'" },
        { status: 400 }
      );
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        product: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      review,
      message: `Review ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error moderating review:", error);
    return NextResponse.json(
      { error: "Failed to moderate review" },
      { status: 500 }
    );
  }
}