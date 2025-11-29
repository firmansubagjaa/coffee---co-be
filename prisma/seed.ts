import { PrismaClient, Role, Category, OrderStatus } from "../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from "../src/config/env"; // Use type-safe env

// Setup Prisma Client
const connectionString = env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Cleanup Database
  console.log("🧹 Cleaning up old data...");
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.stationLogistics.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.storeLocation.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  console.log("👤 Seeding Users...");
  const passwordHash = await Bun.password.hash("dev123", {
    algorithm: "bcrypt",
    cost: 10,
  });

  const users = [
    {
      email: "super@coffee.co",
      name: "Super Admin",
      role: Role.SUPERADMIN,
      password: passwordHash,
      avatarColor: "FF5722",
    },
    {
      email: "admin@coffee.co",
      name: "Admin Store",
      role: Role.ADMIN,
      password: passwordHash,
      avatarColor: "2196F3",
    },
    {
      email: "sarah@coffee.co",
      name: "Sarah Barista",
      role: Role.BARISTA,
      password: passwordHash,
      avatarColor: "D7CCC8",
    },
    {
      email: "mike@coffee.co",
      name: "Mike Analyst",
      role: Role.DATA_ANALYST,
      password: passwordHash,
      avatarColor: "9C27B0",
    },
    {
      email: "user@coffee.co",
      name: "Customer Demo",
      role: Role.CUSTOMER,
      password: passwordHash,
      points: 500,
      streak: 3,
      avatarColor: "4CAF50",
    },
    {
      email: "jane@coffee.co",
      name: "Jane Doe",
      role: Role.CUSTOMER,
      password: passwordHash,
      points: 120,
      streak: 1,
      avatarColor: "E91E63",
    },
  ];

  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.create({ data: u });
    createdUsers.push(user);
  }
  const customerUser = createdUsers.find(u => u.email === "user@coffee.co");
  const janeUser = createdUsers.find(u => u.email === "jane@coffee.co");

  // 3. Seed Products & Variants
  console.log("☕ Seeding Products & Variants...");

  // --- Coffee: Espresso Romano ---
  const espressoRomano = await prisma.product.create({
    data: {
      name: "Espresso Romano",
      description: "<p>A shot of espresso served with a slice of lemon.</p>",
      category: Category.COFFEE,
      price: 3.5,
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
      images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"],
      subDescriptions: ["Zesty Lemon Note", "Strong Body", "Italian Classic"],
      tastingNotes: ["Citrus", "Bold", "Dark Chocolate"],
      sizes: ["S", "M", "L"],
      grindOptions: ["Espresso"],
      rating: 4.8,
    },
  });

  const vEspressoS = await prisma.productVariant.create({ data: { productId: espressoRomano.id, name: "S", price: 3.5, costPrice: 1.5, stock: 100 } });
  const vEspressoM = await prisma.productVariant.create({ data: { productId: espressoRomano.id, name: "M", price: 4.0, costPrice: 1.8, stock: 80 } });
  const vEspressoL = await prisma.productVariant.create({ data: { productId: espressoRomano.id, name: "L", price: 4.5, costPrice: 2.0, stock: 50 } });

  // --- Coffee: Caramel Macchiato ---
  const caramelMacchiato = await prisma.product.create({
    data: {
      name: "Caramel Macchiato",
      description: "<p>Freshly steamed milk with vanilla-flavored syrup marked with espresso and topped with a caramel drizzle.</p>",
      category: Category.COFFEE,
      price: 4.5,
      image: "https://images.unsplash.com/photo-1485808191679-5f8c7c8606af?auto=format&fit=crop&w=800&q=80",
      images: ["https://images.unsplash.com/photo-1485808191679-5f8c7c8606af?auto=format&fit=crop&w=800&q=80"],
      subDescriptions: ["Sweet Caramel", "Vanilla Hint", "Creamy"],
      tastingNotes: ["Caramel", "Vanilla", "Sweet"],
      sizes: ["S", "M", "L"],
      grindOptions: ["Espresso"],
      rating: 4.5,
    },
  });

  const vCaramelS = await prisma.productVariant.create({ data: { productId: caramelMacchiato.id, name: "S", price: 4.5, costPrice: 2.0, stock: 100 } });
  const vCaramelM = await prisma.productVariant.create({ data: { productId: caramelMacchiato.id, name: "M", price: 5.0, costPrice: 2.5, stock: 100 } });
  const vCaramelL = await prisma.productVariant.create({ data: { productId: caramelMacchiato.id, name: "L", price: 5.5, costPrice: 3.0, stock: 100 } });

  // --- Coffee: Matcha Latte (New) ---
  const matchaLatte = await prisma.product.create({
    data: {
      name: "Matcha Latte",
      description: "<p>Premium Japanese matcha green tea powder steamed with milk.</p>",
      category: Category.COFFEE,
      price: 5.0,
      image: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=800&q=80",
      images: ["https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=800&q=80"],
      subDescriptions: ["Ceremonial Grade", "Antioxidant Rich", "Smooth"],
      tastingNotes: ["Earthy", "Sweet", "Vegetal"],
      sizes: ["S", "M", "L"],
      grindOptions: [],
      rating: 4.9,
    },
  });

  const vMatchaS = await prisma.productVariant.create({ data: { productId: matchaLatte.id, name: "S", price: 5.0, costPrice: 2.5, stock: 50 } });
  const vMatchaM = await prisma.productVariant.create({ data: { productId: matchaLatte.id, name: "M", price: 5.5, costPrice: 3.0, stock: 40 } });
  const vMatchaL = await prisma.productVariant.create({ data: { productId: matchaLatte.id, name: "L", price: 6.0, costPrice: 3.5, stock: 30 } });

  // --- Pastry: Croissant ---
  const croissant = await prisma.product.create({
    data: {
      name: "Butter Croissant",
      description: "<p>Flaky, buttery, and freshly baked French pastry.</p>",
      category: Category.PASTRY,
      price: 3.0,
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
      images: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80"],
      subDescriptions: ["French Butter", "Flaky Layers", "Baked Daily"],
      tastingNotes: ["Buttery", "Crispy"],
      sizes: ["Standard"],
      grindOptions: [],
      rating: 4.7,
    },
  });

  const vCroissant = await prisma.productVariant.create({ data: { productId: croissant.id, name: "Standard", price: 3.0, costPrice: 1.0, stock: 20 } });

  // --- Food: Avocado Toast (New) ---
  const avocadoToast = await prisma.product.create({
    data: {
      name: "Avocado Toast",
      description: "<p>Smashed avocado on toasted sourdough bread, topped with chili flakes and poached egg.</p>",
      category: Category.FOOD,
      price: 8.5,
      image: "https://images.unsplash.com/photo-1588137372308-15f75323ca8d?auto=format&fit=crop&w=800&q=80",
      images: ["https://images.unsplash.com/photo-1588137372308-15f75323ca8d?auto=format&fit=crop&w=800&q=80"],
      subDescriptions: ["Sourdough", "Fresh Avocado", "Healthy"],
      tastingNotes: ["Creamy", "Spicy", "Savory"],
      sizes: ["Standard"],
      grindOptions: [],
      rating: 4.6,
    },
  });

  const vAvocado = await prisma.productVariant.create({ data: { productId: avocadoToast.id, name: "Standard", price: 8.5, costPrice: 3.5, stock: 15 } });

  // --- Merch: Tumbler ---
  const tumbler = await prisma.product.create({
    data: {
      name: "Tumbler Coffee & Co",
      description: "<p>Keep your coffee hot or cold with our premium stainless steel tumbler.</p>",
      category: Category.MERCH,
      price: 25.0,
      image: "https://images.unsplash.com/photo-1517080319566-2c1e19d446ac?auto=format&fit=crop&w=800&q=80",
      images: ["https://images.unsplash.com/photo-1517080319566-2c1e19d446ac?auto=format&fit=crop&w=800&q=80"],
      subDescriptions: ["Stainless Steel", "Double Wall", "Leak Proof"],
      tastingNotes: [],
      sizes: ["500ml"],
      grindOptions: [],
      rating: 5.0,
    },
  });

  const vTumblerBlack = await prisma.productVariant.create({ data: { productId: tumbler.id, name: "Black", price: 25.0, costPrice: 10.0, stock: 10 } });
  const vTumblerWhite = await prisma.productVariant.create({ data: { productId: tumbler.id, name: "White", price: 25.0, costPrice: 10.0, stock: 5 } });

  // 4. Seed Logistics
  console.log("🚚 Seeding Logistics...");
  await prisma.stationLogistics.createMany({
    data: [
      {
        name: "La Marzocco Group 1",
        category: "machine",
        status: "ok",
        metricValue: "93.5",
        unit: "°C",
      },
      {
        name: "House Blend (Hopper)",
        category: "beans",
        status: "low",
        metricValue: "15",
        unit: "%",
      },
      {
        name: "Milk Fridge",
        category: "dairy",
        status: "critical",
        metricValue: "8.0",
        unit: "°C",
      },
      {
        name: "Grinder 1",
        category: "machine",
        status: "ok",
        metricValue: "200",
        unit: "g/min",
      },
    ],
  });

  // 5. Seed CMS Data (Jobs & Locations)
  console.log("📰 Seeding CMS Data...");
  
  // Locations
  await prisma.storeLocation.createMany({
    data: [
      {
        name: "Senopati Flagship",
        address: "Jl. Senopati No. 10, Jakarta Selatan",
        city: "Jakarta",
        phone: "+62 21 555 0001",
        coordinates: { lat: -6.2305, lng: 106.8086 },
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
        mapUrl: "https://maps.google.com/?q=-6.2305,106.8086",
      },
      {
        name: "Canggu Beach House",
        address: "Jl. Pantai Batu Bolong, Bali",
        city: "Bali",
        phone: "+62 361 555 0002",
        coordinates: { lat: -8.6500, lng: 115.1300 },
        image: "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=800&q=80",
        mapUrl: "https://maps.google.com/?q=-8.6500,115.1300",
      },
      {
        name: "Braga Heritage",
        address: "Jl. Braga No. 50, Bandung",
        city: "Bandung",
        phone: "+62 22 555 0003",
        coordinates: { lat: -6.9175, lng: 107.6191 },
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        mapUrl: "https://maps.google.com/?q=-6.9175,107.6191",
      },
    ],
  });

  // Jobs
  await prisma.jobPosting.createMany({
    data: [
      {
        title: "Senior Barista",
        location: "Jakarta (Senopati)",
        type: "Full-time",
        description: "<p>We are looking for an experienced Barista to lead our flagship store team.</p>",
      },
      {
        title: "Store Manager",
        location: "Bali (Canggu)",
        type: "Full-time",
        description: "<p>Manage daily operations and ensure high customer satisfaction in our busiest location.</p>",
      },
      {
        title: "Pastry Chef",
        location: "Bandung (Braga)",
        type: "Part-time",
        description: "<p>Create delicious pastries for our heritage store.</p>",
      },
    ],
  });

  // 6. Seed Finance (Expenses)
  console.log("💰 Seeding Expenses...");
  await prisma.expense.createMany({
    data: [
      { description: "Coffee Beans Restock", amount: 5000000, category: "Ingredients" },
      { description: "Milk Supply", amount: 2000000, category: "Ingredients" },
      { description: "Electricity Bill", amount: 3500000, category: "Utilities" },
      { description: "Store Rent (Monthly)", amount: 15000000, category: "Rent" },
      { description: "Packaging Materials", amount: 1500000, category: "Supplies" },
      { description: "Machine Maintenance", amount: 2500000, category: "Maintenance" },
    ],
  });

  // 7. Seed Social (Reviews & Wishlist)
  if (customerUser && janeUser) {
    console.log("⭐ Seeding Social Data...");
    
    // Wishlist
    await prisma.wishlist.create({ data: { userId: customerUser.id, productId: espressoRomano.id } });
    await prisma.wishlist.create({ data: { userId: customerUser.id, productId: matchaLatte.id } });
    await prisma.wishlist.create({ data: { userId: janeUser.id, productId: avocadoToast.id } });

    // Reviews
    await prisma.review.create({
      data: {
        userId: customerUser.id,
        productId: espressoRomano.id,
        rating: 5,
        comment: "Best espresso in town! The lemon note is genius.",
      },
    });

    await prisma.review.create({
      data: {
        userId: customerUser.id,
        productId: croissant.id,
        rating: 4,
        comment: "Very flaky, but a bit small.",
      },
    });

    await prisma.review.create({
      data: {
        userId: janeUser.id,
        productId: matchaLatte.id,
        rating: 5,
        comment: "Authentic taste, love it!",
      },
    });

    await prisma.review.create({
      data: {
        userId: janeUser.id,
        productId: avocadoToast.id,
        rating: 5,
        comment: "Perfect brunch option.",
      },
    });
  }

  // 8. Seed Orders (History)
  if (customerUser) {
    console.log("📦 Seeding Orders...");
    
    // Order 1: Completed
    await prisma.order.create({
      data: {
        userId: customerUser.id,
        status: OrderStatus.DELIVERED,
        total: 8.5,
        items: {
          create: [
            {
              productName: "Espresso Romano",
              productImage: espressoRomano.image,
              quantity: 1,
              price: 3.5,
              variantId: vEspressoS.id,
            },
            {
              productName: "Matcha Latte",
              productImage: matchaLatte.image,
              quantity: 1,
              price: 5.0,
              variantId: vMatchaS.id,
            },
          ],
        },
        transaction: {
          create: {
            amount: 8.5,
            status: "settlement",
            paymentMethod: "gopay",
          },
        },
      },
    });

    // Order 2: Pending
    await prisma.order.create({
      data: {
        userId: customerUser.id,
        status: OrderStatus.PENDING,
        total: 12.0,
        items: {
          create: [
            {
              productName: "Avocado Toast",
              productImage: avocadoToast.image,
              quantity: 1,
              price: 8.5,
              variantId: vAvocado.id,
            },
            {
              productName: "Butter Croissant",
              productImage: croissant.image,
              quantity: 1,
              price: 3.5, // Note: price changed slightly in seed but history keeps old price if needed, here matching variant
              variantId: vCroissant.id,
            },
          ],
        },
      },
    });
  }

  console.log("✅ Seeding Completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
