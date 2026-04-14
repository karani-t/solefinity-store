import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { taxCalculator } from "../../../lib/taxes";
import { smsService } from "../../../lib/sms";

// GET - Distributor orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const distributorProfile = await prisma.distributorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!distributorProfile) {
      return NextResponse.json(
        { error: "Distributor profile not found" },
        { status: 404 }
      );
    }

    const orders = await prisma.distributorOrder.findMany({
      where: { distributorId: distributorProfile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create distributor order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const distributorProfile = await prisma.distributorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!distributorProfile) {
      return NextResponse.json(
        { error: "Distributor profile not found" },
        { status: 404 }
      );
    }

    const { items } = await request.json(); // Array of { productId, quantity }

    // Calculate total
    let totalPriceKES = 0;
    let taxAmountKES = 0;

    // Get products with distributor pricing
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      // Get distributor pricing based on quantity
      const priceInfo = await prisma.distributorPrice.findFirst({
        where: {
          productId: item.productId,
          minQuantity: { lte: item.quantity },
        },
        orderBy: { minQuantity: "desc" },
      });

      const unitPrice = priceInfo?.priceKES || product.priceKES || 0;
      const itemTotal = unitPrice * item.quantity;
      const itemTax =
        itemTotal * (product.taxRate || 0.16);

      totalPriceKES += itemTotal;
      taxAmountKES += itemTax;
    }

    // Check credit limit
    const creditCheck = distributorProfile.creditUsed + totalPriceKES;
    if (creditCheck > distributorProfile.creditLimit) {
      return NextResponse.json(
        {
          error: "Insufficient credit limit",
          creditLimit: distributorProfile.creditLimit,
          creditUsed: distributorProfile.creditUsed,
          orderAmount: totalPriceKES,
        },
        { status: 400 }
      );
    }

    // Calculate payment due date
    const paymentDueDate = new Date();
    paymentDueDate.setDate(paymentDueDate.getDate() + distributorProfile.paymentTerms);

    // Create order
    const order = await prisma.distributorOrder.create({
      data: {
        orderNumber: `ORD-DIST-${Date.now()}`,
        distributorId: distributorProfile.id,
        totalPriceKES,
        taxAmountKES,
        paymentTermsUsed: distributorProfile.paymentTerms,
        paymentDueDate,
        status: "PENDING",
      },
    });

    // Update credit utilization
    await prisma.distributorProfile.update({
      where: { id: distributorProfile.id },
      data: { creditUsed: { increment: totalPriceKES } },
    });

    // Send notification
    if (session.user.phone) {
      await smsService.sendSMS({
        phoneNumber: session.user.phone,
        message: `Order ${order.orderNumber} created. Amount: KES ${totalPriceKES}. Due:  ${paymentDueDate.toLocaleDateString()}`,
        type: "order_status",
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}