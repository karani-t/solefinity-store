import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date range from query params (default: last 30 days)
    const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Fetch staff sales metrics
    const [
      totalOrders,
      totalRevenue,
      totalItemsSold,
      ordersProcessed,
      averageOrderValue,
      ordersByStatus,
      topProducts,
      dailyRevenue,
    ] = await Promise.all([
      // Total orders processed by this staff
      prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Total revenue (from paid orders)
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate }, paymentStatus: "PAID" },
        _sum: { totalPriceKES: true },
      }),

      // Total items sold
      prisma.orderItem.aggregate({
        where: { order: { createdAt: { gte: startDate } } },
        _sum: { quantity: true },
      }),

      // Orders in each status
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          status: { in: ["DELIVERED", "SHIPPED"] },
        },
      }),

      // Average order value
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate }, paymentStatus: "PAID" },
        _avg: { totalPriceKES: true },
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
      }),

      // Top 5 products sold
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { createdAt: { gte: startDate } } },
        _sum: { quantity: true },
        _count: { id: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),

      // Daily revenue trend
      prisma.order.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: startDate }, paymentStatus: "PAID" },
        _sum: { totalPriceKES: true },
        _count: { id: true },
      }),
    ]);

    // Get product details for top products
    const topProductDetails = await Promise.all(
      (topProducts || []).map((item: any) =>
        prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true },
        })
      )
    );

    return NextResponse.json({
      metrics: {
        totalOrders,
        totalRevenue: totalRevenue._sum?.totalPriceKES || 0,
        totalItemsSold: totalItemsSold._sum?.quantity || 0,
        ordersProcessed,
        averageOrderValue: averageOrderValue._avg?.totalPriceKES || 0,
      },
      ordersByStatus: ordersByStatus.map((item: any) => ({
        status: item.status,
        count: item._count.id,
      })),
      topProducts: topProductDetails.map((product, index) => ({
        ...product,
        quantity: topProducts[index]._sum?.quantity || 0,
      })),
      dailyRevenue: dailyRevenue
        .map((item: any) => ({
          date: item.createdAt.toISOString().split("T")[0],
          revenue: item._sum?.totalPriceKES || 0,
          ordersCount: item._count.id,
        }))
        .sort((a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
    });
  } catch (error) {
    console.error("Error fetching staff reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
