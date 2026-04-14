import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Clearing database (keeping admin only)...");

  // Delete all data in order of foreign key dependencies
  await prisma.wishlist.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.productBatch.deleteMany();
  await prisma.review.deleteMany();
  await prisma.mpesaPayment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.distributorOrder.deleteMany();
  await prisma.distributorPrice.deleteMany();
  await prisma.message.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.distributorProfile.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  // Delete all users except admin
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (adminUser) {
    console.log(`✨ Keeping admin user: ${adminUser.email}`);
    // Update admin email to user's email
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { email: "tonykarani012@gmail.com" },
    });
    console.log("✅ Admin email updated to: tonykarani012@gmail.com");
    await prisma.user.deleteMany({
      where: { id: { not: adminUser.id } },
    });
  } else {
    console.log("⚠️  No admin user found, creating one...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        email: "tonykarani012@gmail.com",
        name: "Admin",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });
    console.log("✅ Admin user created: tonykarani012@gmail.com / admin123");
  }

  console.log("🧹 Database reset complete!");

  // Create default warehouse if none exist
  const warehouseCount = await prisma.warehouse.count();
  if (warehouseCount === 0) {
    console.log("🏭 Creating default warehouse...");
    await prisma.warehouse.create({
      data: {
        name: "Main Warehouse",
        location: "Nairobi CBD",
        county: "Nairobi",
        capacity: 10000,
        currentStock: 0,
        manager: adminUser?.id || "admin",
        isActive: true,
      },
    });
    console.log("✅ Default warehouse created");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
