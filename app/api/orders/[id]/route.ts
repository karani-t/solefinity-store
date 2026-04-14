import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { emailService } from "../../../lib/email";
import {
  ValidationRuleBuilder,
  validators,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
  successResponse,
} from "../../../lib/validation";

const VALID_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
const VALID_PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return unauthorizedResponse("Only ADMIN and STAFF can update orders");
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, trackingNumber } = body;

    // Validate input
    const errors: Array<{ field: string; message: string }> = [];

    if (status && !VALID_STATUSES.includes(status)) {
      errors.push({
        field: "status",
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      errors.push({
        field: "paymentStatus",
        message: `Payment status must be one of: ${VALID_PAYMENT_STATUSES.join(", ")}`,
      });
    }

    if (trackingNumber && typeof trackingNumber !== "string") {
      errors.push({
        field: "trackingNumber",
        message: "Tracking number must be a string",
      });
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Check order exists
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!currentOrder) {
      return notFoundResponse("Order not found");
    }

    // Validate status progression
    if (status) {
      const currentIndex = VALID_STATUSES.indexOf(currentOrder.status);
      const newIndex = VALID_STATUSES.indexOf(status);

      if (newIndex < currentIndex) {
        errors.push({
          field: "status",
          message: `Cannot change status from ${currentOrder.status} to ${status}. Status can only move forward.`,
        });
      }
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Update order
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: { include: { product: true } }, user: true },
    });

    // Send status update email if status changed
    if (status && currentOrder.status !== status) {
      try {
        await emailService.sendOrderStatusUpdate({
          orderId: order.id,
          customerEmail: currentOrder.user.email,
          customerName: currentOrder.user.name || "Valued Customer",
          status,
          trackingNumber,
        });
      } catch (emailError) {
        console.error("Failed to send order status update email:", emailError);
        // Don't fail the status update if email fails
      }
    }

    return successResponse({ order });
  } catch (error) {
    console.error("Error updating order:", error);
    return internalErrorResponse("Failed to update order", error);
  }
}