import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { sendCredentialsEmail } from "../../../lib/email";
import { smsService } from "../../../lib/sms";
import bcrypt from "bcryptjs";

// Utility to generate random password
function generatePassword(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const isAdminOrManager = (session: any) =>
  Boolean(session && ["MANAGER", "ADMIN"].includes(session.user.role));

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdminOrManager(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const distributors = await prisma.distributorProfile.findMany({
      include: {
        user: { select: { id: true, email: true, name: true, phone: true, isActive: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ distributors });
  } catch (error) {
    console.error("Error fetching distributors:", error);
    return NextResponse.json({ error: "Failed to fetch distributors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdminOrManager(session) || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUserId = session.user.id;

    const {
      email,
      name,
      phone,
      businessName,
      businessType,
      location,
      county,
      taxId,
      retailerLicense,
      creditLimit,
      paymentTerms,
    } = await request.json();

    const normalizedEmail = (email || "").toString().trim().toLowerCase();
    const normalizedName = (name || "").toString().trim();
    const normalizedPhone = (phone || "").toString().trim();
    const normalizedBusinessName = (businessName || "").toString().trim();
    const normalizedBusinessType = (businessType || "").toString().trim();
    const normalizedLocation = (location || "").toString().trim();
    const normalizedCounty = (county || "").toString().trim();

    if (!normalizedEmail || !normalizedName || !normalizedPhone || !normalizedBusinessName || !normalizedBusinessType || !normalizedLocation) {
      return NextResponse.json({ error: "Missing required fields: email, name, phone, business name, type, and location are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    if (normalizedPhone) {
      const existingPhoneUser = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
      if (existingPhoneUser) {
        return NextResponse.json({ error: "Phone number already in use" }, { status: 409 });
      }
    }

    // Auto-generate password
    const generatedPassword = generatePassword();

    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedName,
        phone: normalizedPhone || null,
        password: hashedPassword,
        role: "DISTRIBUTOR",
      },
    });

    const distributor = await prisma.distributorProfile.create({
      data: {
        userId: user.id,
        businessName,
        businessType,
        phoneNumber: phone,
        location,
        county,
        taxId,
        retailerLicense,
        creditLimit: Number(creditLimit) || 0,
        paymentTerms: Number(paymentTerms) || 30,
        approvedBy: adminUserId,
        isApproved: true,
      },
    });

    // Send credentials email
    try {
      await sendCredentialsEmail(
        normalizedEmail,
        normalizedName,
        generatedPassword,
        "DISTRIBUTOR",
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/signin`
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    // Send credentials via SMS
    try {
      await smsService.sendCredentials(
        normalizedPhone,
        normalizedName,
        normalizedEmail,
        generatedPassword,
        "DISTRIBUTOR"
      );
    } catch (smsError) {
      console.error("SMS sending failed:", smsError);
    }

    return NextResponse.json({ distributor, user, message: "Credentials sent to email and SMS" }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating distributor:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Unique constraint failed: a user or distributor entry already exists" },
        { status: 409 }
      );
    }

    const errorMessage = error?.message || "Failed to create distributor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdminOrManager(session) || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUserId = session.user.id;

    const { distributorId, businessName, businessType, location, county, creditLimit, paymentTerms, isApproved } =
      await request.json();

    const distributor = await prisma.distributorProfile.update({
      where: { id: distributorId },
      data: {
        businessName: businessName || undefined,
        businessType: businessType || undefined,
        location: location || undefined,
        county: county || undefined,
        creditLimit: creditLimit !== undefined ? Number(creditLimit) : undefined,
        paymentTerms: paymentTerms !== undefined ? Number(paymentTerms) : undefined,
        isApproved: isApproved !== undefined ? Boolean(isApproved) : undefined,
        approvedBy: isApproved ? adminUserId : undefined,
      },
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
      },
    });

    return NextResponse.json({ distributor });
  } catch (error) {
    console.error("Error updating distributor:", error);
    return NextResponse.json({ error: "Failed to update distributor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdminOrManager(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const distributorId = searchParams.get("distributorId");

    if (!distributorId) {
      return NextResponse.json({ error: "Distributor ID required" }, { status: 400 });
    }

    const distributor = await prisma.distributorProfile.findUnique({ where: { id: distributorId } });

    if (!distributor) {
      return NextResponse.json({ error: "Distributor not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: distributor.userId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Distributor deactivated" });
  } catch (error) {
    console.error("Error deleting distributor:", error);
    return NextResponse.json({ error: "Failed to delete distributor" }, { status: 500 });
  }
}
