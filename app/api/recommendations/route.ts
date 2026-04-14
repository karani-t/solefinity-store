import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const excludeId = searchParams.get("excludeId");
    const limit = parseInt(searchParams.get("limit") || "4");

    let whereClause: any = {};

    if (category) {
      whereClause.category = category;
    }

    if (excludeId) {
      whereClause.id = {
        not: excludeId
      };
    }

    // Get recommended products
    const recommendations = await prisma.product.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        // Simple recommendation: order by stock (popular items first) and price
        stock: "desc"
      }
    });

    // If we don't have enough recommendations, fill with other products
    if (recommendations.length < limit) {
      const additionalProducts = await prisma.product.findMany({
        where: {
          id: {
            not: excludeId || "",
            notIn: recommendations.map(p => p.id)
          }
        },
        take: limit - recommendations.length,
        orderBy: {
          priceKES: "asc" // Cheaper items as fallback
        }
      });

      recommendations.push(...additionalProducts);
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}