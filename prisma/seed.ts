import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed with comprehensive test data...\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // 1️⃣  CREATE USERS (Admin, Staff, Distributors, Customers)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("📝 Creating test users...");

  // ADMIN
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@solefinity.com" },
    update: {},
    create: {
      email: "admin@solefinity.com",
      password: adminPassword,
      name: "Samuel Kipchoge",
      phone: "+254712345001",
      role: "ADMIN",
    },
  });

  // STAFF MEMBERS (2)
  const staffPassword = await bcrypt.hash("Staff@123", 10);
  const staff1 = await prisma.user.upsert({
    where: { email: "staff.john@solefinity.com" },
    update: {},
    create: {
      email: "staff.john@solefinity.com",
      password: staffPassword,
      name: "John Mutua",
      phone: "+254712345002",
      role: "STAFF",
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: "staff.grace@solefinity.com" },
    update: {},
    create: {
      email: "staff.grace@solefinity.com",
      password: staffPassword,
      name: "Grace Wanjiru",
      phone: "+254712345003",
      role: "STAFF",
    },
  });

  // DISTRIBUTORS (2)
  const distributorPassword = await bcrypt.hash("Dist@123", 10);
  const distributor1 = await prisma.user.upsert({
    where: { email: "distributor.nairobi@solefinity.com" },
    update: {},
    create: {
      email: "distributor.nairobi@solefinity.com",
      password: distributorPassword,
      name: "Njeri Retail Solutions",
      phone: "+254712345010",
      role: "DISTRIBUTOR",
    },
  });

  const distributor2 = await prisma.user.upsert({
    where: { email: "distributor.mombasa@solefinity.com" },
    update: {},
    create: {
      email: "distributor.mombasa@solefinity.com",
      password: distributorPassword,
      name: "Coastal Wholesale",
      phone: "+254712345011",
      role: "DISTRIBUTOR",
    },
  });

  // CUSTOMERS (3)
  const customerPassword = await bcrypt.hash("Cust@123", 10);
  const customer1 = await prisma.user.upsert({
    where: { email: "customer.alice@gmail.com" },
    update: {},
    create: {
      email: "customer.alice@gmail.com",
      password: customerPassword,
      name: "Alice Johnson",
      phone: "+254712345020",
      role: "CUSTOMER",
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "customer.james@gmail.com" },
    update: {},
    create: {
      email: "customer.james@gmail.com",
      password: customerPassword,
      name: "James Kiprotich",
      phone: "+254712345021",
      role: "CUSTOMER",
    },
  });

  const customer3 = await prisma.user.upsert({
    where: { email: "customer.sarah@gmail.com" },
    update: {},
    create: {
      email: "customer.sarah@gmail.com",
      password: customerPassword,
      name: "Sarah Omondi",
      phone: "+254712345022",
      role: "CUSTOMER",
    },
  });

  console.log("✅ Test users created:\n");
  console.log("   ADMIN:");
  console.log("   📧 admin@solefinity.com");
  console.log("   🔐 Admin@123\n");
  console.log("   STAFF:");
  console.log("   📧 staff.john@solefinity.com");
  console.log("   🔐 Staff@123");
  console.log("   📧 staff.grace@solefinity.com");
  console.log("   🔐 Staff@123\n");
  console.log("   DISTRIBUTORS:");
  console.log("   📧 distributor.nairobi@solefinity.com");
  console.log("   🔐 Dist@123");
  console.log("   📧 distributor.mombasa@solefinity.com");
  console.log("   🔐 Dist@123\n");
  console.log("   CUSTOMERS:");
  console.log("   📧 customer.alice@gmail.com");
  console.log("   🔐 Cust@123");
  console.log("   📧 customer.james@gmail.com");
  console.log("   🔐 Cust@123");
  console.log("   📧 customer.sarah@gmail.com");
  console.log("   🔐 Cust@123\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // 2️⃣  CREATE STAFF PROFILES
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("👥 Creating staff profiles...");

  const staffProfile1 = await prisma.staffProfile.upsert({
    where: { userId: staff1.id },
    update: {},
    create: {
      userId: staff1.id,
      staffId: "STAFF-001",
      department: "Sales",
      isApproved: true,
      approvedBy: admin.id,
      performanceRating: 4.5,
    },
  });

  const staffProfile2 = await prisma.staffProfile.upsert({
    where: { userId: staff2.id },
    update: {},
    create: {
      userId: staff2.id,
      staffId: "STAFF-002",
      department: "Inventory",
      isApproved: true,
      approvedBy: admin.id,
      performanceRating: 4.2,
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3️⃣  CREATE DISTRIBUTOR PROFILES
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("🏪 Creating distributor profiles...");

  const distributorProfile1 = await prisma.distributorProfile.upsert({
    where: { userId: distributor1.id },
    update: {},
    create: {
      userId: distributor1.id,
      businessName: "Njeri Retail Solutions",
      businessType: "Retail",
      phoneNumber: "+254712345010",
      location: "Nairobi City Center",
      county: "Nairobi",
      taxId: "P051234567A",
      creditLimit: 500000,
      creditUsed: 125000,
      paymentTerms: 30,
      isApproved: true,
      approvedBy: admin.id,
    },
  });

  const distributorProfile2 = await prisma.distributorProfile.upsert({
    where: { userId: distributor2.id },
    update: {},
    create: {
      userId: distributor2.id,
      businessName: "Coastal Wholesale",
      businessType: "Wholesale",
      phoneNumber: "+254712345011",
      location: "Mombasa",
      county: "Mombasa",
      taxId: "P051234568B",
      creditLimit: 750000,
      creditUsed: 250000,
      paymentTerms: 45,
      isApproved: true,
      approvedBy: admin.id,
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4️⃣  CREATE PRODUCTS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("👟 Creating products...\n");

  const productsData = [
    {
      name: "Air Max Running Shoes",
      description: "Premium running shoes with advanced cushioning technology for maximum comfort and performance. Perfect for long-distance running and daily training.",
      priceKES: 15999,
      costPriceKES: 8000,
      stock: 45,
      category: "Running",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Urban Street Sneakers",
      description: "Stylish and versatile sneakers designed for urban lifestyles. Features breathable mesh upper and responsive sole for all-day comfort.",
      priceKES: 8999,
      costPriceKES: 4500,
      stock: 60,
      category: "Casual",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Professional Basketball Shoes",
      description: "High-performance basketball shoes with superior ankle support and traction. Designed for competitive play and intense training sessions.",
      priceKES: 17999,
      costPriceKES: 9000,
      stock: 25,
      category: "Basketball",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Trail Hiking Boots",
      description: "Rugged hiking boots built for challenging terrains. Waterproof construction with reinforced toe cap and excellent grip for outdoor adventures.",
      priceKES: 21999,
      costPriceKES: 11000,
      stock: 18,
      category: "Hiking",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Classic Leather Loafers",
      description: "Timeless leather loafers crafted from premium Italian leather. Perfect for formal occasions and business attire with all-day comfort.",
      priceKES: 12999,
      costPriceKES: 6500,
      stock: 35,
      category: "Formal",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Casual Canvas Shoes",
      description: "Lightweight canvas shoes with rubber sole for everyday wear. Available in multiple colors, perfect for casual outings and weekend activities.",
      priceKES: 4999,
      costPriceKES: 2000,
      stock: 80,
      category: "Casual",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Tennis Performance Shoes",
      description: "Specialized tennis shoes with lateral support and quick directional changes. Designed for court performance and agility training.",
      priceKES: 13999,
      costPriceKES: 7000,
      stock: 30,
      category: "Tennis",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Winter Boots Premium",
      description: "Insulated winter boots with waterproof membrane and thermal lining. Keep your feet warm and dry in extreme cold conditions.",
      priceKES: 18999,
      costPriceKES: 9500,
      stock: 22,
      category: "Winter",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Soccer Cleats Pro",
      description: "Professional soccer cleats with advanced stud configuration for optimal traction on grass and turf surfaces. Lightweight and responsive.",
      priceKES: 16999,
      costPriceKES: 8500,
      stock: 28,
      category: "Soccer",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Sandals Comfort Plus",
      description: "Breathable sandals with contoured footbed for superior comfort. Adjustable straps and durable construction for beach and casual wear.",
      priceKES: 3999,
      costPriceKES: 1500,
      stock: 55,
      category: "Sandals",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Cycling Shoes Aero",
      description: "Aerodynamic cycling shoes with clipless pedal compatibility. Carbon fiber sole for efficient power transfer and long-distance comfort.",
      priceKES: 24999,
      costPriceKES: 12500,
      stock: 15,
      category: "Cycling",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Kids Sports Shoes",
      description: "Durable and comfortable sports shoes designed specifically for children. Features lightweight construction and excellent cushioning.",
      priceKES: 6999,
      costPriceKES: 3500,
      stock: 40,
      category: "Kids",
      image: "/api/placeholder/400/300",
    },
  ];

  const products = [];
  for (const productData of productsData) {
    // Check if product already exists by name
    let product = await prisma.product.findFirst({
      where: { name: productData.name },
    });

    // If not found, create it
    if (!product) {
      product = await prisma.product.create({
        data: productData,
      });
    }
    products.push(product);
  }

  console.log(`✅ ${products.length} products created\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 5️⃣  CREATE ORDERS (Customer Orders)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("📦 Creating customer orders...");

  // Order 1: PENDING (for staff to process)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-001`,
      userId: customer1.id,
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod: "MPESA",
      totalPriceKES: 25998,
      taxAmountKES: 4160,
      shippingAddress: "123 Nairobi Street, Nairobi",
      items: {
        create: [
          { productId: products[0].id, quantity: 1, priceKES: 15999, taxedPriceKES: 18559 },
          { productId: products[1].id, quantity: 1, priceKES: 8999, taxedPriceKES: 10439 },
        ],
      },
    },
  });

  // Order 2: PROCESSING
  const order2 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-002`,
      userId: customer2.id,
      status: "PROCESSING",
      paymentStatus: "PAID",
      paymentMethod: "MPESA",
      totalPriceKES: 35998,
      taxAmountKES: 5760,
      shippingAddress: "456 Mombasa Road, Mombasa",
      items: {
        create: [
          { productId: products[2].id, quantity: 2, priceKES: 17999, taxedPriceKES: 20879 },
        ],
      },
    },
  });

  // Order 3: SHIPPED
  const order3 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-003`,
      userId: customer1.id,
      status: "SHIPPED",
      paymentStatus: "PAID",
      paymentMethod: "MPESA",
      totalPriceKES: 27998,
      taxAmountKES: 4480,
      shippingAddress: "123 Nairobi Street, Nairobi",
      trackingNumber: "TRACK-2026-04-14-001",
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      items: {
        create: [
          { productId: products[3].id, quantity: 1, priceKES: 21999, taxedPriceKES: 25519 },
        ],
      },
    },
  });

  // Order 4: DELIVERED
  const order4 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-004`,
      userId: customer3.id,
      status: "DELIVERED",
      paymentStatus: "PAID",
      paymentMethod: "MPESA",
      totalPriceKES: 13998,
      taxAmountKES: 2240,
      shippingAddress: "789 Kisumu Lane, Kisumu",
      trackingNumber: "TRACK-2026-04-14-002",
      deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      items: {
        create: [
          { productId: products[4].id, quantity: 1, priceKES: 12999, taxedPriceKES: 15079 },
        ],
      },
    },
  });

  // Order 5: DELIVERED  
  const order5 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-005`,
      userId: customer2.id,
      status: "DELIVERED",
      paymentStatus: "PAID",
      paymentMethod: "MPESA",
      totalPriceKES: 19998,
      taxAmountKES: 3200,
      shippingAddress: "456 Mombasa Road, Mombasa",
      trackingNumber: "TRACK-2026-04-14-003",
      deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      items: {
        create: [
          { productId: products[5].id, quantity: 1, priceKES: 4999, taxedPriceKES: 5799 },
          { productId: products[6].id, quantity: 1, priceKES: 13999, taxedPriceKES: 16239 },
        ],
      },
    },
  });

  console.log("✅ Customer orders created (PENDING, PROCESSING, SHIPPED, DELIVERED)\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // 6️⃣  CREATE REVIEWS (Product Reviews)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("⭐ Creating product reviews...");

  const review1 = await prisma.review.create({
    data: {
      userId: customer1.id,
      productId: products[0].id,
      rating: 5,
      comment: "Excellent running shoes! Very comfortable and durable. Highly recommended!",
      isApproved: true,
    },
  });

  const review2 = await prisma.review.create({
    data: {
      userId: customer3.id,
      productId: products[4].id,
      rating: 4,
      comment: "Great quality leather loafers. Perfect for office wear.",
      isApproved: true,
    },
  });

  const review3 = await prisma.review.create({
    data: {
      userId: customer2.id,
      productId: products[2].id,
      rating: 5,
      comment: "Basketball shoes are of premium quality. Ankle support is excellent.",
      isApproved: false, // Pending admin approval
    },
  });

  console.log("✅ Product reviews created\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // 7️⃣  CREATE LOW STOCK NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("🚨 Creating low stock notifications...");

  const lowStock1 = await prisma.lowStockNotification.create({
    data: {
      productId: products[3].id, // Trail Hiking Boots (stock: 18)
      distributorId: distributorProfile1.id,
      currentStock: 18,
      threshold: 20,
    },
  });

  const lowStock2 = await prisma.lowStockNotification.create({
    data: {
      productId: products[10].id, // Cycling Shoes (stock: 15)
      distributorId: distributorProfile2.id,
      currentStock: 15,
      threshold: 20,
    },
  });

  console.log("✅ Low stock notifications created\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // 8️⃣  CREATE DISTRIBUTOR ACTIVITIES
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("📊 Creating distributor activities...");

  const activity1 = await prisma.distributorActivity.create({
    data: {
      distributorId: distributorProfile1.id,
      activityType: "ORDER_PLACED",
      description: "Placed order for 50 units of Urban Street Sneakers",
      relatedProductId: products[1].id,
      metadata: JSON.stringify({ quantity: 50, totalAmount: 449950 }),
    },
  });

  const activity2 = await prisma.distributorActivity.create({
    data: {
      distributorId: distributorProfile1.id,
      activityType: "RESTOCK",
      description: "Restocked 30 units of Air Max Running Shoes",
      relatedProductId: products[0].id,
      metadata: JSON.stringify({ quantity: 30, restockDate: new Date() }),
    },
  });

  const activity3 = await prisma.distributorActivity.create({
    data: {
      distributorId: distributorProfile2.id,
      activityType: "PRICE_VIEW",
      description: "Viewed pricing for Winter Boots Premium",
      relatedProductId: products[7].id,
    },
  });

  const activity4 = await prisma.distributorActivity.create({
    data: {
      distributorId: distributorProfile2.id,
      activityType: "PROFILE_UPDATE",
      description: "Updated business profile information",
    },
  });

  console.log("✅ Distributor activities created\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // 9️⃣  CREATE INVENTORY LOGS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("📋 Creating inventory logs...");

  // Note: This requires a warehouse. Let's check if we need one first
  // For now, we'll skip detailed inventory logs as they depend on warehouse setup

  console.log("✅ Database seeding completed successfully!\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 SUMMARY OF TEST DATA
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n🎯 TEST DATA SUMMARY\n");
  console.log("═══════════════════════════════════════════════════════════════════════════");
  console.log("\n👥 USERS CREATED:");
  console.log("   ✓ 1 Admin");
  console.log("   ✓ 2 Staff Members");
  console.log("   ✓ 2 Distributors");
  console.log("   ✓ 3 Customers");

  console.log("\n👟 PRODUCTS:");
  console.log(`   ✓ ${products.length} products across 12 categories`);

  console.log("\n📦 ORDERS:");
  console.log("   ✓ 5 customer orders (statuses: PENDING, PROCESSING, SHIPPED, DELIVERED)");

  console.log("\n⭐ REVIEWS:");
  console.log("   ✓ 3 product reviews (2 approved, 1 pending)");

  console.log("\n🚨 LOW STOCK NOTIFICATIONS:");
  console.log("   ✓ 2 low stock alerts for distributors");

  console.log("\n📊 DISTRIBUTOR ACTIVITIES:");
  console.log("   ✓ 4 activity logs (orders, restocking, price views)");

  console.log("\n═══════════════════════════════════════════════════════════════════════════");
  console.log("\n✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });