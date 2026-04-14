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
    const skip = (page - 1) * limit;

    // Get all messages (sent and received)
    const [sentMessages, receivedMessages] = await Promise.all([
      prisma.message.findMany({
        where: { senderId: session.user.id },
        skip,
        take: limit,
        include: {
          receiver: {
            select: { name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.message.findMany({
        where: { receiverId: session.user.id },
        skip,
        take: limit,
        include: {
          sender: {
            select: { name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const [totalSent, totalReceived, unreadCount] = await Promise.all([
      prisma.message.count({ where: { senderId: session.user.id } }),
      prisma.message.count({ where: { receiverId: session.user.id } }),
      prisma.message.count({
        where: { receiverId: session.user.id, read: false },
      }),
    ]);

    // Combine and sort all messages
    const allMessages = [
      ...sentMessages.map((m: any) => ({ ...m, direction: "sent" })),
      ...receivedMessages.map((m: any) => ({ ...m, direction: "received" })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      messages: allMessages,
      pagination: {
        page,
        limit,
        totalSent,
        totalReceived,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "DISTRIBUTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, subject, content } = await request.json();

    if (!receiverId || !subject || !content) {
      return NextResponse.json(
        { error: "Receiver ID, subject, and content are required" },
        { status: 400 }
      );
    }

    // Verify receiver is an admin
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver || !["ADMIN", "MANAGER"].includes(receiver.role)) {
      return NextResponse.json(
        { error: "Receiver must be an admin or manager" },
        { status: 400 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        subject,
        content,
      },
      include: {
        sender: {
          select: { name: true, email: true },
        },
        receiver: {
          select: { name: true, email: true },
        },
      },
    });

    // Log activity
    await prisma.distributorActivity.create({
      data: {
        distributorId: (
          await prisma.distributorProfile.findUnique({
            where: { userId: session.user.id },
          })
        )?.id || "",
        activityType: "MESSAGE_SENT",
        description: `Sent message to ${receiver.name}: ${subject}`,
        metadata: JSON.stringify({ messageId: message.id }),
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
