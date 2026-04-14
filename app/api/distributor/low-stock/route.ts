import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "DISTRIBUTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get distributor profile
    const distributorProfile = await prisma.distributorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!distributorProfile) {
      return NextResponse.json(
        { error: "Distributor profile not found" },
        { status: 404 }
      );
    }

    // Get all products with low stock
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: prisma.product.fields.lowStockThreshold },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockThreshold: true,
        reorderQuantity: true,
        priceKES: true,
        category: true,
        image: true,
      },
      orderBy: { stock: "asc" },
    });

    // Get notifications for this distributor
    const notifications = await prisma.lowStockNotification.findMany({
      where: {
        distributorId: distributorProfile.id,
        dismissedAt: null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            stock: true,
            lowStockThreshold: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      lowStockProducts,
      notifications,
      totalNotifications: notifications.length,
    });
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    return NextResponse.json(
      { error: "Failed to fetch low stock products" },
      { status: 500 }
    );
  }
}
