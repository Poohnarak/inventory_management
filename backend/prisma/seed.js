const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inventory.local' },
    update: {},
    create: {
      email: 'admin@inventory.local',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  });
  console.log('Created admin user:', admin.email);

  // Seed ingredients
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
  for (const data of ingredientsData) {
    const ing = await prisma.ingredient.upsert({
      where: { id: ingredientsData.indexOf(data) + 1 },
      update: data,
      create: data,
    });
    ingredients.push(ing);
  }
  console.log(`Seeded ${ingredients.length} ingredients`);

  // Seed products with BOM
  const productsData = [
    {
      name: 'Chocolate Cake',
      sellingPrice: 25.0,
      bom: [
        { ingredientIndex: 0, quantity: 0.5 },   // Flour
        { ingredientIndex: 1, quantity: 0.3 },   // Sugar
        { ingredientIndex: 2, quantity: 0.25 },  // Butter
        { ingredientIndex: 3, quantity: 4 },     // Eggs
        { ingredientIndex: 7, quantity: 50 },    // Cocoa Powder
      ],
    },
    {
      name: 'Vanilla Cupcakes (12pcs)',
      sellingPrice: 18.0,
      bom: [
        { ingredientIndex: 0, quantity: 0.3 },   // Flour
        { ingredientIndex: 1, quantity: 0.2 },   // Sugar
        { ingredientIndex: 2, quantity: 0.15 },  // Butter
        { ingredientIndex: 3, quantity: 3 },     // Eggs
        { ingredientIndex: 5, quantity: 10 },    // Vanilla Extract
      ],
    },
    {
      name: 'Butter Cookies (20pcs)',
      sellingPrice: 12.0,
      bom: [
        { ingredientIndex: 0, quantity: 0.25 },  // Flour
        { ingredientIndex: 1, quantity: 0.15 },  // Sugar
        { ingredientIndex: 2, quantity: 0.2 },   // Butter
        { ingredientIndex: 3, quantity: 2 },     // Eggs
      ],
    },
    {
      name: 'Croissant',
      sellingPrice: 4.5,
      bom: [
        { ingredientIndex: 0, quantity: 0.1 },   // Flour
        { ingredientIndex: 2, quantity: 0.08 },  // Butter
        { ingredientIndex: 4, quantity: 0.05 },  // Milk
        { ingredientIndex: 3, quantity: 1 },     // Eggs
      ],
    },
    {
      name: 'Cream Puffs (6pcs)',
      sellingPrice: 15.0,
      bom: [
        { ingredientIndex: 0, quantity: 0.15 },  // Flour
        { ingredientIndex: 2, quantity: 0.1 },   // Butter
        { ingredientIndex: 3, quantity: 3 },     // Eggs
        { ingredientIndex: 9, quantity: 0.2 },   // Cream
        { ingredientIndex: 5, quantity: 5 },     // Vanilla Extract
      ],
    },
  ];

  for (const pData of productsData) {
    const product = await prisma.product.create({
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

  // Seed some stock movements
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
    await prisma.stockMovement.create({ data: m });
  }
  console.log(`Seeded ${movements.length} stock movements`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
