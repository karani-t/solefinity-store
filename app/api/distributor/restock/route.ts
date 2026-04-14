import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "DISTRIBUTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantityAdded, restockNotes } = await request.json();

    if (!productId || !quantityAdded || quantityAdded <= 0) {
      return NextResponse.json(
        { error: "Product ID and valid quantity are required" },
        { status: 400 }
      );
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

    // Get the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Update product stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: product.stock + quantityAdded,
      },
    });

    // Log the restock activity
    await prisma.distributorActivity.create({
      data: {
        distributorId: distributorProfile.id,
        activityType: "RESTOCK",
        description: `Restocked ${product.name} with ${quantityAdded} units`,
        relatedProductId: productId,
        metadata: JSON.stringify({
          quantityAdded,
          previousStock: product.stock,
          newStock: updatedProduct.stock,
          notes: restockNotes,
        }),
      },
    });

    // Dismiss the low stock notification if it exists
    await prisma.lowStockNotification.updateMany({
      where: {
        productId,
        distributorId: distributorProfile.id,
      },
      data: {
        dismissedAt: new Date(),
      },
    });

    // Send notification to admin about restock
    await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: await getAdminId(), // Helper to get admin
        subject: `Product Restock Notification: ${product.name}`,
        content: `Distributor ${distributorProfile.businessName} has restocked ${product.name} with ${quantityAdded} units. New stock level: ${updatedProduct.stock}. Notes: ${restockNotes || "None"}`,
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: "Restock recorded successfully",
    });
  } catch (error) {
    console.error("Error recording restock:", error);
    return NextResponse.json(
      { error: "Failed to record restock" },
      { status: 500 }
    );
  }
}

async function getAdminId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  return admin?.id || "";
}
