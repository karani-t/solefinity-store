import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { mpesaService } from "../../../lib/mpesa";
import { smsService } from "../../../lib/sms";

// POST - Initiate M-Pesa payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, phoneNumber } = await request.json();

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (order.paymentStatus === "COMPLETED") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 400 }
      );
    }

    const amountKES = order.totalPriceKES || 0;

    // Initiate STK Push
    const result = await mpesaService.initiateStkPush(
      phoneNumber,
      amountKES,
      orderId,
      `Groomers Cave Payment - Order #${order.orderNumber || orderId.slice(-8)}`
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Create M-Pesa payment record
    const payment = await prisma.mpesaPayment.create({
      data: {
        orderId,
        userId: session.user.id,
        phoneNumber,
        amountKES,
        transactionRef: result.checkoutRequestId || `MOCK-${Date.now()}`,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        paymentId: payment.id,
        message: result.message,
        checkoutRequestId: result.checkoutRequestId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error initiating payment:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

// GET - Check payment status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const payment = await prisma.mpesaPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Query M-Pesa status if pending
    if (payment.status === "PENDING") {
      const status = await mpesaService.queryStkStatus(payment.transactionRef);

      if (status.ResultCode === "0") {
        // Payment successful
        await prisma.mpesaPayment.update({
          where: { id: paymentId },
          data: {
            status: "SUCCESS",
            paidAt: new Date(),
          },
        });

        // Update order
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: "COMPLETED",
            status: "CONFIRMED",
          },
        });

        // Send confirmation SMS
        if (payment.phoneNumber) {
          await smsService.notifyPaymentConfirmation(
            payment.phoneNumber,
            payment.orderId,
            payment.amountKES
          );
        }
      }
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}

// POST - M-Pesa Callback webhook
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("📱 M-Pesa Callback Received:", body);

    // Parse M-Pesa callback body
    const callbackData = body.Body?.stkCallback?.CallbackMetadata?.Item || [];

    // Extract values
    const resultCode = body.Body?.stkCallback?.ResultCode;
    const resultDesc = body.Body?.stkCallback?.ResultDesc;
    const checkoutRequestId = body.Body?.stkCallback?.CheckoutRequestID;

    // Find payment by transaction reference
    const payment = await prisma.mpesaPayment.findUnique({
      where: { transactionRef: checkoutRequestId },
    });

    if (!payment) {
      console.log("Payment not found for request:", checkoutRequestId);
      return NextResponse.json(
        { ResultCode: "0", ResultDesc: "Received payment callback" },
        { status: 200 }
      );
    }

    if (resultCode === "0") {
      // Extract M-Pesa specific info
      const mtpCode = callbackData.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;
      const transactionTimestamp = callbackData.find((item: any) => item.Name === "TransactionDate")?.Value;

      // Update payment
      await prisma.mpesaPayment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          transactionCode: mtpCode,
          paidAt: new Date(),
        },
      });

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "COMPLETED",
          status: "CONFIRMED",
        },
      });

      // Send SMS notification
      await smsService.notifyPaymentConfirmation(
        payment.phoneNumber,
        payment.orderId,
        payment.amountKES
      );
    } else {
      // Payment failed
      await prisma.mpesaPayment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          errorMessage: resultDesc,
        },
      });
    }

    // Return success to M-Pesa
    return NextResponse.json(
      { ResultCode: "0", ResultDesc: "Callback received" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error);
    return NextResponse.json(
      { ResultCode: "1", ResultDesc: "Error processing callback" },
      { status: 500 }
    );
  }
}