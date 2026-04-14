import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "DISTRIBUTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get distributor profile
    const distributorProfile = await prisma.distributorProfile.findFirst({
      where: { userId: session.user.id },
    });

    if (!distributorProfile) {
      return NextResponse.json(
        { error: "Distributor profile not found" },
        { status: 404 }
      );
    }

    // Get date range from query params (default: last 30 days)
    const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Fetch distributor inventory and order metrics
    const [
      totalOrders,
      totalSpent,
      pendingOrders,
      lowStockProducts,
      ordersByStatus,
      recentOrders,
      creditUsage,
      inventoryMetrics,
    ] = await Promise.all([
      // Total orders placed by distributor
      prisma.order.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startDate },
        },
      }),

      // Total amount spent
      prisma.order.aggregate({
        where: {
          userId: session.user.id,
          createdAt: { gte: startDate },
          paymentStatus: "PAID",
        },
        _sum: { totalPriceKES: true },
      }),

      // Pending orders
      prisma.order.count({
        where: {
          userId: session.user.id,
          status: { notIn: ["DELIVERED", "CANCELLED"] },
        },
      }),

      // Low stock products (from notifications)
      prisma.lowStockNotification.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        where: {
          userId: session.user.id,
          createdAt: { gte: startDate },
        },
        _count: { id: true },
      }),

      // Recent 10 orders
      prisma.order.findMany({
        where: {
          userId: session.user.id,
          createdAt: { gte: startDate },
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Credit usage
      prisma.distributorProfile.findUnique({
        where: { id: distributorProfile.id },
        select: { creditLimit: true },
      }),

      // Inventory/restock metrics - using distributor orders as proxy
      prisma.order.aggregate({
        where: {
          userId: session.user.id,
          createdAt: { gte: startDate },
        },
        _count: { id: true },
        _sum: { totalPriceKES: true },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalOrders,
        totalSpent: totalSpent._sum?.totalPriceKES || 0,
        pendingOrders,
        alertedLowStockProducts: lowStockProducts,
        creditLimit: creditUsage?.creditLimit || 0,
      },
      ordersByStatus: ordersByStatus.map((item: any) => ({
        status: item.status,
        count: item._count.id,
      })),
      recentOrders: recentOrders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalPriceKES: order.totalPriceKES,
        itemCount: order.items.length,
        createdAt: order.createdAt,
      })),
      restockMetrics: {
        requestsMade: inventoryMetrics._count.id,
        quantityRequested: inventoryMetrics._sum?.totalPriceKES || 0, // Using order total as proxy
      },
    });
  } catch (error) {
    console.error("Error fetching distributor reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
