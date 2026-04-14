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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const activityType = searchParams.get("type");
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");
    const skip = (page - 1) * limit;

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

    // Build where clause
    const where: any = {
      distributorId: distributorProfile.id,
    };

    if (activityType) {
      where.activityType = activityType;
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

    // Get activities
    const activities = await prisma.distributorActivity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const totalActivities = await prisma.distributorActivity.count({ where });

    // Group activities by type for summary
    const allActivities = await prisma.distributorActivity.findMany({
      where: { distributorId: distributorProfile.id },
      select: { activityType: true },
    });

    const activitySummary = {
      RESTOCK: allActivities.filter((a: any) => a.activityType === "RESTOCK").length,
      ORDER_PLACED: allActivities.filter((a: any) => a.activityType === "ORDER_PLACED").length,
      MESSAGE_SENT: allActivities.filter((a: any) => a.activityType === "MESSAGE_SENT").length,
      PRICE_VIEW: allActivities.filter((a: any) => a.activityType === "PRICE_VIEW").length,
      PROFILE_UPDATE: allActivities.filter((a: any) => a.activityType === "PROFILE_UPDATE").length,
    };

    // Parse metadata for each activity
    const parsedActivities = activities.map((activity: any) => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
    }));

    return NextResponse.json({
      activities: parsedActivities,
      summary: activitySummary,
      pagination: {
        page,
        limit,
        total: totalActivities,
        pages: Math.ceil(totalActivities / limit),
      },
      filters: {
        type: activityType,
        from: dateFrom,
        to: dateTo,
      },
    });
  } catch (error) {
    console.error("Error fetching activity history:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity history" },
      { status: 500 }
    );
  }
}
