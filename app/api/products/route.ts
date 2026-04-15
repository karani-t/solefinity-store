/**
 * /api/products
 * 
 * GET: Fetch all products (public endpoint)
 * POST: Create new product (ADMIN only with validation)
 * 
 * Security:
 * - Input sanitization on POST
 * - Number validation
 * - Authorization check
 * - Activity logging
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sanitizeInput, logActivity } from "@/app/lib/security";

/**
 * GET - Fetch all products
 * Public endpoint - returns all active products
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true }, // Only show active products
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        priceKES: true,
        category: true,
        image: true,
        stock: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new product (ADMIN only)
 * 
 * Validates:
 * - User is authenticated and is ADMIN
 * - All required fields present
 * - Numeric values are valid
 * - Input is sanitized
 * 
 * Returns: Created product or error response
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      console.warn(`🚨 UNAUTHORIZED: Attempt to create product without ADMIN role`);
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const {
      name,
      description,
      priceKES,
      costPriceKES,
      stock,
      lowStockThreshold,
      category,
      image,
    } = body;

    // ============ INPUT VALIDATION ============

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { error: "Product name must be 255 characters or less" },
        { status: 400 }
      );
    }

    // Validate priceKES
    if (priceKES === undefined || priceKES === null) {
      return NextResponse.json(
        { error: "Price (KES) is required" },
        { status: 400 }
      );
    }

    const priceBigInt = Number(priceKES);
    if (isNaN(priceBigInt) || priceBigInt < 0) {
      return NextResponse.json(
        { error: "Price must be a valid positive number" },
        { status: 400 }
      );
    }

    // Validate stock
    if (stock !== undefined && stock !== null) {
      const stockNum = Number(stock);
      if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
        return NextResponse.json(
          { error: "Stock must be a valid positive integer" },
          { status: 400 }
        );
      }
    }

    // Validate category
    if (category && typeof category !== "string") {
      return NextResponse.json(
        { error: "Category must be a string" },
        { status: 400 }
      );
    }

    // ============ CREATE PRODUCT ============

    const product = await prisma.product.create({
      data: {
        name: sanitizeInput(name),
        description: description ? sanitizeInput(description) : null,
        sku: `SKU-${Date.now()}`,
        priceKES: priceBigInt || 0,
        costPriceKES: costPriceKES ? Number(costPriceKES) : 0,
        stock: stock ? Number(stock) : 0,
        lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 5,
        category: category ? sanitizeInput(category) : null,
        image: image || null,
        isActive: true,
      },
    });

    // ============ ACTIVITY LOGGING ============

    await logActivity(
      session.user.id,
      "CREATE_PRODUCT",
      `Created product: ${product.name}`,
      {
        resource: `Product:${product.id}`,
        metadata: {
          productId: product.id,
          productName: product.name,
          price: product.priceKES,
        },
      }
    );

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);

    // Don't expose internal error details
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}