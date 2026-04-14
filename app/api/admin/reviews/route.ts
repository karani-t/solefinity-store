import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status"); // "approved", "pending", "rejected"
    const productId = searchParams.get("productId");
    const rating = searchParams.get("rating");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (status) {
      if (status === "approved") {
        where.isApproved = true;
      } else if (status === "pending") {
        where.isApproved = false;
        where.adminResponse = null;
      } else if (status === "rejected") {
        where.isApproved = false;
        where.adminResponse = { not: null };
      }
    }

    if (productId) {
      where.productId = productId;
    }

    if (rating) {
      where.rating = parseInt(rating);
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Fetch reviews with filters
    const reviews = await prisma.review.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            priceKES: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get total count for pagination
    const totalReviews = await prisma.review.count({ where });

    // Calculate statistics (filtered if applicable)
    const allReviews = await prisma.review.findMany({
      where,
      select: {
        rating: true,
        createdAt: true,
        isApproved: true,
        adminResponse: true,
      },
    });

    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: allReviews.filter(review => review.rating === rating).length,
      percentage: allReviews.length > 0
        ? (allReviews.filter(review => review.rating === rating).length / allReviews.length) * 100
        : 0,
    }));

    // Status distribution
    const approvedCount = allReviews.filter(review => review.isApproved).length;
    const pendingCount = allReviews.filter(review => !review.isApproved && !review.adminResponse).length;
    const rejectedCount = allReviews.filter(review => !review.isApproved && review.adminResponse).length;

    // Recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReviews = allReviews.filter(review => review.createdAt >= thirtyDaysAgo).length;

    return NextResponse.json({
      reviews,
      statistics: {
        totalReviews: allReviews.length,
        averageRating,
        recentReviews,
        ratingDistribution,
        statusDistribution: {
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
        },
      },
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
      },
      filters: {
        status,
        productId,
        rating,
        dateFrom,
        dateTo,
      },
    });
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}