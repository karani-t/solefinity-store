import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@solefinity.com" },
    update: {},
    create: {
      email: "admin@solefinity.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Create staff user
  const staffPassword = await bcrypt.hash("staff123", 10);
  const staff = await prisma.user.upsert({
    where: { email: "staff@solefinity.com" },
    update: {},
    create: {
      email: "staff@solefinity.com",
      password: staffPassword,
      name: "Staff User",
      role: "STAFF",
    },
  });

  // Create distributor
  const distributorPassword = await bcrypt.hash("distributor123", 10);
  const distributor = await prisma.user.upsert({
    where: { email: "distributor@solefinity.com" },
    update: {},
    create: {
      email: "distributor@solefinity.com",
      password: distributorPassword,
      name: "Distributor User",
      role: "DISTRIBUTOR",
    },
  });

  // Create sample products
  const products = [
    {
      name: "Air Max Running Shoes",
      description: "Premium running shoes with advanced cushioning technology for maximum comfort and performance. Perfect for long-distance running and daily training.",
      priceKES: 15999,
      stock: 45,
      category: "Running",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Urban Street Sneakers",
      description: "Stylish and versatile sneakers designed for urban lifestyles. Features breathable mesh upper and responsive sole for all-day comfort.",
      priceKES: 8999,
      stock: 60,
      category: "Casual",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Professional Basketball Shoes",
      description: "High-performance basketball shoes with superior ankle support and traction. Designed for competitive play and intense training sessions.",
      priceKES: 17999,
      stock: 25,
      category: "Basketball",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Trail Hiking Boots",
      description: "Rugged hiking boots built for challenging terrains. Waterproof construction with reinforced toe cap and excellent grip for outdoor adventures.",
      priceKES: 21999,
      stock: 18,
      category: "Hiking",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Classic Leather Loafers",
      description: "Timeless leather loafers crafted from premium Italian leather. Perfect for formal occasions and business attire with all-day comfort.",
      priceKES: 12999,
      stock: 35,
      category: "Formal",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Casual Canvas Shoes",
      description: "Lightweight canvas shoes with rubber sole for everyday wear. Available in multiple colors, perfect for casual outings and weekend activities.",
      priceKES: 4999,
      stock: 80,
      category: "Casual",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Tennis Performance Shoes",
      description: "Specialized tennis shoes with lateral support and quick directional changes. Designed for court performance and agility training.",
      priceKES: 13999,
      stock: 30,
      category: "Tennis",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Winter Boots Premium",
      description: "Insulated winter boots with waterproof membrane and thermal lining. Keep your feet warm and dry in extreme cold conditions.",
      priceKES: 18999,
      stock: 22,
      category: "Winter",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Soccer Cleats Pro",
      description: "Professional soccer cleats with advanced stud configuration for optimal traction on grass and turf surfaces. Lightweight and responsive.",
      priceKES: 16999,
      stock: 28,
      category: "Soccer",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Sandals Comfort Plus",
      description: "Breathable sandals with contoured footbed for superior comfort. Adjustable straps and durable construction for beach and casual wear.",
      priceKES: 3999,
      stock: 55,
      category: "Sandals",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Cycling Shoes Aero",
      description: "Aerodynamic cycling shoes with clipless pedal compatibility. Carbon fiber sole for efficient power transfer and long-distance comfort.",
      priceKES: 24999,
      stock: 15,
      category: "Cycling",
      image: "/api/placeholder/400/300",
    },
    {
      name: "Kids Sports Shoes",
      description: "Durable and comfortable sports shoes designed specifically for children. Features lightweight construction and excellent cushioning.",
      priceKES: 6999,
      stock: 40,
      category: "Kids",
      image: "/api/placeholder/400/300",
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });