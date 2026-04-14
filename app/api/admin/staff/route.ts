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

// GET - List all staff
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["MANAGER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staffProfile.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true, isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// POST - Add new staff member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["MANAGER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name, phone, department, warehouseId } =
      await request.json();

    const normalizedEmail = (email || "").toString().trim().toLowerCase();
    const normalizedName = (name || "").toString().trim();
    const normalizedPhone = (phone || "").toString().trim();
    const normalizedDepartment = (department || "").toString().trim();
    const normalizedWarehouseId = (warehouseId || "").toString().trim();

    if (!normalizedEmail || !normalizedName || !normalizedPhone || !normalizedDepartment) {
      return NextResponse.json(
        { error: "Missing required fields: email, name, phone, and department are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    if (normalizedPhone) {
      const existingPhoneUser = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existingPhoneUser) {
        return NextResponse.json(
          { error: "Phone number already in use" },
          { status: 409 }
        );
      }
    }

    // Auto-generate password
    const generatedPassword = generatePassword();
    
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Validate warehouse if provided
    let validWarehouseId = null;
    if (normalizedWarehouseId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: normalizedWarehouseId },
      });
      if (warehouse) {
        validWarehouseId = normalizedWarehouseId;
      } else {
        console.warn(`Invalid warehouse ID provided: ${normalizedWarehouseId}, using null`);
      }
    }

    // Create user and staff profile
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedName,
        phone: normalizedPhone || null,
        password: hashedPassword,
        role: "STAFF",
      },
    });

    const staffProfile = await prisma.staffProfile.create({
      data: {
        userId: user.id,
        staffId: `STF-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        department: normalizedDepartment,
        warehouseId: validWarehouseId,
        isApproved: false,
        approvedBy: session.user.id,
      },
    });

    // Send credentials via email
    try {
      await sendCredentialsEmail(
        normalizedEmail,
        normalizedName,
        generatedPassword,
        "STAFF",
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
        "STAFF"
      );
    } catch (smsError) {
      console.error("SMS sending failed:", smsError);
    }

    return NextResponse.json(
      { user, staffProfile, message: "Credentials sent to email and SMS" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating staff:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Unique constraint failed: a user or staff entry already exists" },
        { status: 409 }
      );
    }

    const errorMessage = error?.message || "Failed to create staff";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update staff member
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["MANAGER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { staffId, department, warehouseId, isApproved, salary } =
      await request.json();

    const staffProfile = await prisma.staffProfile.findUnique({
      where: { staffId },
    });

    if (!staffProfile) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.staffProfile.update({
      where: { staffId },
      data: {
        department: department || undefined,
        warehouseId: warehouseId || undefined,
        isApproved: isApproved !== undefined ? isApproved : undefined,
        approvedBy: isApproved ? session.user.id : undefined,
        salary: salary !== undefined ? salary : undefined,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true, isActive: true },
        },
      },
    });

    return NextResponse.json({ staffProfile: updated });
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    );
  }
}

// PROMOTION - Update staff role (allow ADMIN to promote STAFF to MANAGER)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["MANAGER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, newRole } = await request.json();

    if (!["STAFF", "MANAGER"].includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    );
  }
}

// DELETE - Remove staff member
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["MANAGER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID is required" },
        { status: 400 }
      );
    }

    const staffProfile = await prisma.staffProfile.findUnique({
      where: { staffId },
    });

    if (!staffProfile) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      );
    }

    // Deactivate user instead of deleting
    await prisma.user.update({
      where: { id: staffProfile.userId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Staff member deactivated" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      { error: "Failed to delete staff" },
      { status: 500 }
    );
  }
}