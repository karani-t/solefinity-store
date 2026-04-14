import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import {
  unauthorizedResponse,
  internalErrorResponse,
  successResponse,
} from "../../../lib/validation";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return unauthorizedResponse("Only ADMIN and MANAGER can view analytics");
    }

    // Get date range from query params (default: last 30 days)
    const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Fetch analytics data in parallel
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      pendingOrders,
      ordersByStatus,
      topProducts,
      revenueByDay,
      averageOrderValue,
    ] = await Promise.all([
      // Total orders in period
      prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Total revenue in period
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate }, paymentStatus: "PAID" },
        _sum: { totalPriceKES: true },
      }),

      // Total products
      prisma.product.count(),

      // Total customers
      prisma.user.count({
        where: { role: "CUSTOMER" },
      }),

      // Pending orders
      prisma.order.count({
        where: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
      }),

      // Top 5 products by sales
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { createdAt: { gte: startDate } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),

      // Revenue by day (last 30 days)
      prisma.order.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: startDate }, paymentStatus: "PAID" },
        _sum: { totalPriceKES: true },
      }),

      // Average order value
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate }, paymentStatus: "PAID" },
        _avg: { totalPriceKES: true },
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

    return successResponse({
      metrics: {
        totalOrders,
        totalRevenue: totalRevenue._sum?.totalPriceKES || 0,
        totalProducts,
        totalCustomers,
        pendingOrders,
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
      revenueByDay: revenueByDay
        .map((item: any) => ({
          date: item.createdAt.toISOString().split("T")[0],
          revenue: item._sum?.totalPriceKES || 0,
        }))
        .sort((a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return internalErrorResponse("Failed to fetch analytics", error);
  }
}