/**
 * Multi-tenant seed script (3-tier architecture).
 *
 * 1. Seeds the SYSTEM database with a super admin + a demo shop record.
 * 2. Seeds the SHOP USER database (shop_demo_users) with admin/staff users.
 * 3. Seeds the SHOP APP database (shop_demo_app) with ingredients, products, BOM, and stock movements.
 *
 * Prerequisites:
 *   - PostgreSQL is running with `inventory_system`, `shop_demo_users`, and `shop_demo_app` databases created.
 *   - Prisma migrations have been applied to all three databases.
 *   - Run `npm run prisma:generate` first to generate all three clients.
 */

const { PrismaClient: SystemPrismaClient } = require('@prisma/client/system');
const { PrismaClient: ShopUserPrismaClient } = require('@prisma/client/shop_user');
const { PrismaClient: ShopAppPrismaClient } = require('@prisma/client/shop_app');
const bcrypt = require('bcryptjs');

const systemPrisma = new SystemPrismaClient({
  datasourceUrl:
    process.env.SYSTEM_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/inventory_system?schema=public',
});

const shopUserPrisma = new ShopUserPrismaClient({
  datasourceUrl:
    process.env.SHOP_USER_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/shop_demo_users?schema=public',
});

const shopAppPrisma = new ShopAppPrismaClient({
  datasourceUrl:
    process.env.SHOP_APP_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/shop_demo_app?schema=public',
});

async function main() {
  console.log('Seeding 3-tier multi-tenant database...\n');

  // ─── 1. System database: super admin + shop registry ────────────────
  console.log('--- System database ---');

  const superAdminHash = await bcrypt.hash('super123', 12);
  const superAdmin = await systemPrisma.systemUser.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      passwordHash: superAdminHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`System user: ${superAdmin.username} (role: ${superAdmin.role})`);

  const shop = await systemPrisma.shop.upsert({
    where: { shopCode: 'DEMO' },
    update: {},
    create: {
      shopCode: 'DEMO',
      shopName: 'Demo Bakery',
      userDbName: 'shop_demo_users',
      appDbName: 'shop_demo_app',
    },
  });
  console.log(`Shop: ${shop.shopName} (code: ${shop.shopCode}, userDb: ${shop.userDbName}, appDb: ${shop.appDbName})`);

  // ─── 2. Shop user database: admin + staff ───────────────────────────
  console.log('\n--- Shop user database (shop_demo_users) ---');

  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await shopUserPrisma.shopUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  console.log(`Shop user: ${admin.username} (role: ${admin.role})`);

  const staffHash = await bcrypt.hash('staff123', 12);
  const staff = await shopUserPrisma.shopUser.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      username: 'staff',
      passwordHash: staffHash,
      role: 'STAFF',
    },
  });
  console.log(`Shop user: ${staff.username} (role: ${staff.role})`);

  // ─── 3. Shop app database: inventory data ──────────────────────────
  console.log('\n--- Shop app database (shop_demo_app) ---');

  const ingredientsData = [
    { name: 'Flour', category: 'Dry Goods', unit: 'kg', costPerUnit: 2.5, currentStock: 50, lowStockThreshold: 10, supplier: 'Bangkok Flour Co.' },
    { name: 'Sugar', category: 'Dry Goods', unit: 'kg', costPerUnit: 3.0, currentStock: 30, lowStockThreshold: 10, supplier: 'Sweet Supply' },
    { name: 'Butter', category: 'Dairy', unit: 'kg', costPerUnit: 8.0, currentStock: 15, lowStockThreshold: 5, supplier: 'Dairy Farm' },
    { name: 'Eggs', category: 'Dairy', unit: 'pcs', costPerUnit: 0.3, currentStock: 200, lowStockThreshold: 30, supplier: 'Farm Fresh' },
    { name: 'Milk', category: 'Dairy', unit: 'L', costPerUnit: 1.5, currentStock: 40, lowStockThreshold: 10, supplier: 'Dairy Farm' },
    { name: 'Vanilla Extract', category: 'Flavoring', unit: 'mL', costPerUnit: 0.15, currentStock: 500, lowStockThreshold: 100, supplier: 'Spice World' },
    { name: 'Baking Powder', category: 'Dry Goods', unit: 'g', costPerUnit: 0.02, currentStock: 1000, lowStockThreshold: 200, supplier: 'Bangkok Flour Co.' },
    { name: 'Cocoa Powder', category: 'Dry Goods', unit: 'g', costPerUnit: 0.05, currentStock: 800, lowStockThreshold: 200, supplier: 'Choco Supply' },
    { name: 'Salt', category: 'Dry Goods', unit: 'g', costPerUnit: 0.01, currentStock: 2000, lowStockThreshold: 500, supplier: 'General Supplies' },
    { name: 'Cream', category: 'Dairy', unit: 'L', costPerUnit: 4.0, currentStock: 20, lowStockThreshold: 5, supplier: 'Dairy Farm' },
  ];

  const ingredients = [];
  for (const [index, data] of ingredientsData.entries()) {
    const ing = await shopAppPrisma.ingredient.upsert({
      where: { id: index + 1 },
      update: data,
      create: data,
    });
    ingredients.push(ing);
  }
  console.log(`Seeded ${ingredients.length} ingredients`);

  const productsData = [
    {
      name: 'Chocolate Cake',
      sellingPrice: 25.0,
      bom: [
        { ingredientIndex: 0, quantity: 0.5 },
        { ingredientIndex: 1, quantity: 0.3 },
        { ingredientIndex: 2, quantity: 0.25 },
        { ingredientIndex: 3, quantity: 4 },
        { ingredientIndex: 7, quantity: 50 },
      ],
    },
    {
      name: 'Vanilla Cupcakes (12pcs)',
      sellingPrice: 18.0,
      bom: [
        { ingredientIndex: 0, quantity: 0.3 },
        { ingredientIndex: 1, quantity: 0.2 },
        { ingredientIndex: 2, quantity: 0.15 },
        { ingredientIndex: 3, quantity: 3 },
        { ingredientIndex: 5, quantity: 10 },
      ],
    },
    {
      name: 'Butter Cookies (20pcs)',
      sellingPrice: 12.0,
      bom: [
        { ingredientIndex: 0, quantity: 0.25 },
        { ingredientIndex: 1, quantity: 0.15 },
        { ingredientIndex: 2, quantity: 0.2 },
        { ingredientIndex: 3, quantity: 2 },
      ],
    },
    {
      name: 'Croissant',
      sellingPrice: 4.5,
      bom: [
        { ingredientIndex: 0, quantity: 0.1 },
        { ingredientIndex: 2, quantity: 0.08 },
        { ingredientIndex: 4, quantity: 0.05 },
        { ingredientIndex: 3, quantity: 1 },
      ],
    },
    {
      name: 'Cream Puffs (6pcs)',
      sellingPrice: 15.0,
      bom: [
        { ingredientIndex: 0, quantity: 0.15 },
        { ingredientIndex: 2, quantity: 0.1 },
        { ingredientIndex: 3, quantity: 3 },
        { ingredientIndex: 9, quantity: 0.2 },
        { ingredientIndex: 5, quantity: 5 },
      ],
    },
  ];

  for (const pData of productsData) {
    const product = await shopAppPrisma.product.create({
      data: {
        name: pData.name,
        sellingPrice: pData.sellingPrice,
        bomItems: {
          create: pData.bom.map((b) => ({
            ingredientId: ingredients[b.ingredientIndex].id,
            quantity: b.quantity,
          })),
        },
      },
    });
    console.log(`Created product: ${product.name}`);
  }

  const movements = [
    { ingredientId: ingredients[0].id, type: 'Purchase', quantityChange: 25, createdAt: new Date('2026-02-05') },
    { ingredientId: ingredients[2].id, type: 'Purchase', quantityChange: 10, createdAt: new Date('2026-02-04') },
    { ingredientId: ingredients[1].id, type: 'Purchase', quantityChange: 15, createdAt: new Date('2026-02-03') },
    { ingredientId: ingredients[9].id, type: 'Purchase', quantityChange: 10, createdAt: new Date('2026-02-02') },
    { ingredientId: ingredients[7].id, type: 'Purchase', quantityChange: 500, createdAt: new Date('2026-02-01') },
    { ingredientId: ingredients[3].id, type: 'Adjustment', quantityChange: -12, createdAt: new Date('2026-02-04'), note: 'Broken eggs' },
    { ingredientId: ingredients[4].id, type: 'Adjustment', quantityChange: -5, createdAt: new Date('2026-02-01'), note: 'Expired milk' },
  ];

  for (const m of movements) {
    await shopAppPrisma.stockMovement.create({ data: m });
  }
  console.log(`Seeded ${movements.length} stock movements`);

  console.log('\nSeeding complete!');
  console.log('\nYou can now log in with:');
  console.log('  Super Admin: superadmin / super123  (no shop code)');
  console.log('  Shop code:   DEMO');
  console.log('  Admin:       admin / admin123');
  console.log('  Staff:       staff / staff123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await systemPrisma.$disconnect();
    await shopUserPrisma.$disconnect();
    await shopAppPrisma.$disconnect();
  });
