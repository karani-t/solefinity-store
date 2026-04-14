import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

// GET - List all inventory
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["MANAGER", "INVENTORY_MANAGER", "STAFF"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("warehouseId");
    const productId = searchParams.get("productId");

    const batches = await prisma.productBatch.findMany({
      where: {
        warehouseId: warehouseId || undefined,
        productId: productId || undefined,
      },
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { expiryDate: "asc" },
    });

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// POST - Add inventory batch
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["MANAGER", "INVENTORY_MANAGER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      productId,
      warehouseId,
      batchNumber,
      quantityIn,
      manufactureDateOn,
      expiryDate,
      costPriceKES,
    } = await request.json();

    // Validate batch doesn't already exist
    const existingBatch = await prisma.productBatch.findUnique({
      where: {
        batchNumber_warehouseId: {
          batchNumber,
          warehouseId,
        },
      },
    });

    if (existingBatch) {
      return NextResponse.json(
        { error: "Batch already exists in this warehouse" },
        { status: 409 }
      );
    }

    const batch = await prisma.productBatch.create({
      data: {
        productId,
        warehouseId,
        batchNumber,
        quantityIn,
        quantityAvailable: quantityIn,
        manufactureDateOn: new Date(manufactureDateOn),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        costPriceKES,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    // Log inventory transaction
    await prisma.inventoryLog.create({
      data: {
        productId,
        warehouseId,
        userId: session.user.id,
        type: "IN",
        quantity: quantityIn,
        reason: "New batch received",
      },
    });

    // Update product total stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantityIn,
        },
      },
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    console.error("Error adding inventory:", error);
    return NextResponse.json(
      { error: "Failed to add inventory" },
      { status: 500 }
    );
  }
}

// PUT - Adjust inventory
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["MANAGER", "INVENTORY_MANAGER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { batchId, adjustmentQuantity, reason } = await request.json();

    const batch = await prisma.productBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 }
      );
    }

    // Update batch
    const newAvailable = batch.quantityAvailable + adjustmentQuantity;

    const updated = await prisma.productBatch.update({
      where: { id: batchId },
      data: {
        quantityOut: {
          increment: adjustmentQuantity > 0 ? 0 : Math.abs(adjustmentQuantity),
        },
        quantityAvailable: newAvailable,
      },
    });

    // Log adjustment
    await prisma.inventoryLog.create({
      data: {
        productId: batch.productId,
        warehouseId: batch.warehouseId,
        userId: session.user.id,
        type: "ADJUSTMENT",
        quantity: adjustmentQuantity,
        reason: reason || "Manual adjustment",
      },
    });

    // Update product stock
    await prisma.product.update({
      where: { id: batch.productId },
      data: {
        stock: {
          increment: adjustmentQuantity,
        },
      },
    });

    return NextResponse.json({ batch: updated });
  } catch (error) {
    console.error("Error adjusting inventory:", error);
    return NextResponse.json(
      { error: "Failed to adjust inventory" },
      { status: 500 }
    );
  }
}