/**
 * Data Migration Script
 * Copies data from local database to Vercel Postgres
 *
 * Usage: npx ts-node prisma/migrate-data.ts
 */

const { PrismaClient } = require("@prisma/client");

// Create two Prisma clients - one for local, one for production
const localDB = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:2612@localhost:5432/orith",
    },
  },
});

const prodDB = new PrismaClient(); // Uses DATABASE_URL from .env

async function migrateData() {
  try {
    console.log("🔄 Starting data migration from local to Vercel Postgres...\n");

    // 1. Migrate Users
    console.log("📋 Migrating users...");
    const users = await localDB.user.findMany();
    for (const user of users) {
      await prodDB.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      });
    }
    console.log(`✓ Migrated ${users.length} users\n`);

    // 2. Migrate Products
    console.log("📦 Migrating products...");
    const products = await localDB.product.findMany();
    for (const product of products) {
      await prodDB.product.upsert({
        where: { id: product.id },
        update: {},
        create: product,
      });
    }
    console.log(`✓ Migrated ${products.length} products\n`);

    // 3. Migrate Orders
    console.log("🛒 Migrating orders...");
    const orders = await localDB.order.findMany({
      include: { items: true },
    });
    for (const order of orders) {
      await prodDB.order.upsert({
        where: { id: order.id },
        update: {},
        create: {
          id: order.id,
          userId: order.userId,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: {
            create: order.items.map((item: any) => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              createdAt: item.createdAt,
            })),
          },
        },
      });
    }
    console.log(`✓ Migrated ${orders.length} orders\n`);

    // 4. Migrate Reviews
    console.log("⭐ Migrating reviews...");
    const reviews = await localDB.review.findMany();
    for (const review of reviews) {
      await prodDB.review.upsert({
        where: { id: review.id },
        update: {},
        create: review,
      });
    }
    console.log(`✓ Migrated ${reviews.length} reviews\n`);

    // 5. Migrate Cart Items
    console.log("🛍️ Migrating cart items...");
    const cartItems = await localDB.cartItem.findMany();
    for (const item of cartItems) {
      await prodDB.cartItem.upsert({
        where: {
          userId_productId: {
            userId: item.userId,
            productId: item.productId,
          },
        },
        update: {},
        create: item,
      });
    }
    console.log(`✓ Migrated ${cartItems.length} cart items\n`);

    console.log("✅ Data migration completed successfully!");
    console.log(`
Summary:
- Users: ${users.length}
- Products: ${products.length}
- Orders: ${orders.length}
- Reviews: ${reviews.length}
- Cart Items: ${cartItems.length}
    `);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await localDB.$disconnect();
    await prodDB.$disconnect();
  }
}

migrateData();
