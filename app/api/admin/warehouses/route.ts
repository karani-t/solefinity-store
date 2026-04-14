import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

// GET - List warehouses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["MANAGER", "INVENTORY_MANAGER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const warehouses = await prisma.warehouse.findMany({
      include: {
        staffProfiles: true,
      },
      orderBy: { location: "asc" },
    });

    return NextResponse.json({ warehouses });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}

// POST - Create warehouse
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, location, county, capacity, manager } = await request.json();

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        location,
        county,
        capacity,
        manager: manager || null,
        isActive: true,
      },
    });

    return NextResponse.json({ warehouse }, { status: 201 });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to create warehouse" },
      { status: 500 }
    );
  }
}

// PUT - Update warehouse
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { warehouseId, name, location, county, capacity, manager, isActive } =
      await request.json();

    const warehouse = await prisma.warehouse.update({
      where: { id: warehouseId },
      data: {
        name: name || undefined,
        location: location || undefined,
        county: county || undefined,
        capacity: capacity || undefined,
        manager: manager || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json({ warehouse });
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return NextResponse.json(
      { error: "Failed to update warehouse" },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate warehouse
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("warehouseId");

    if (!warehouseId) {
      return NextResponse.json(
        { error: "Warehouse ID is required" },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.update({
      where: { id: warehouseId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Warehouse deactivated", warehouse });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 }
    );
  }
}