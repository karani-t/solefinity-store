import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { emailService } from "../../lib/email";
import {
  ValidationRuleBuilder,
  validators,
  validationErrorResponse,
  unauthorizedResponse,
  internalErrorResponse,
  successResponse,
} from "../../lib/validation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return unauthorizedResponse("Only ADMIN and STAFF can view orders");
    }

    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return internalErrorResponse("Failed to fetch orders", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return unauthorizedResponse("You must be logged in to place an order");
    }

    const body = await request.json();
    const { items, totalPriceKES, taxAmountKES, shippingInfo, paymentMethod } = body;

    // Validate input
    const validation = new ValidationRuleBuilder()
      .addRule("items", validators.required("Items"))
      .addRule("totalPriceKES", (value) =>
        typeof value !== "number" ? "Total price must be a number" : null
      )
      .addRule("totalPriceKES", validators.minValue(0, "Total price"));

    const errors = validation.validate(body);

    if (!Array.isArray(items) || items.length === 0) {
      errors.push({ field: "items", message: "Order must contain at least one item" });
    }

    if (items.length > 0) {
      items.forEach((item: any, index: number) => {
        if (!item.productId)
          errors.push({ field: `items[${index}].productId`, message: "Product ID is required" });
        if (!Number.isInteger(item.quantity) || item.quantity <= 0)
          errors.push({ field: `items[${index}].quantity`, message: "Quantity must be a positive integer" });
        if (typeof item.priceKES !== "number" || item.priceKES < 0)
          errors.push({ field: `items[${index}].priceKES`, message: "Price must be a non-negative number" });
      });
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        orderNumber: `ORD-${Date.now()}`,
        totalPriceKES: totalPriceKES || 0,
        taxAmountKES: taxAmountKES || 0,
        paymentMethod: paymentMethod || null,
        status: "PENDING",
        paymentStatus: "PENDING",
        shippingAddress: shippingInfo ? JSON.stringify(shippingInfo) : null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceKES: item.priceKES || 0,
            taxedPriceKES: (item.priceKES || 0) * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    // Update inventory
    try {
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    } catch (inventoryError) {
      console.error("Failed to update inventory:", inventoryError);
      // Log this issue but don't fail order creation
    }

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation({
        orderId: order.id,
        customerEmail: order.user.email,
        customerName: order.user.name || "Valued Customer",
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.priceKES || 0,
        })),
        total: order.totalPriceKES || 0,
        shippingAddress: shippingInfo,
      });
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    return successResponse({ order }, 201);
  } catch (error) {
    console.error("Error creating order:", error);
    return internalErrorResponse("Failed to create order", error);
  }
}