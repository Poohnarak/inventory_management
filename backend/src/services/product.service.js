const prisma = require('../config/db');

async function getAll({ search, page = 1, limit = 50 }) {
  const where = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        bomItems: {
          include: {
            ingredient: {
              select: { id: true, name: true, unit: true, costPerUnit: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
}

async function getById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      bomItems: {
        include: {
          ingredient: {
            select: { id: true, name: true, unit: true, costPerUnit: true },
          },
        },
      },
    },
  });

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return product;
}

async function create({ name, sellingPrice, bom = [] }) {
  return prisma.product.create({
    data: {
      name,
      sellingPrice,
      bomItems: {
        create: bom.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      bomItems: {
        include: {
          ingredient: {
            select: { id: true, name: true, unit: true, costPerUnit: true },
          },
        },
      },
    },
  });
}

async function update(id, { name, sellingPrice, bom }) {
  await getById(id);

  return prisma.$transaction(async (tx) => {
    // Update product fields
    await tx.product.update({
      where: { id },
      data: { name, sellingPrice },
    });

    // Replace BOM items if provided
    if (bom !== undefined) {
      await tx.bomItem.deleteMany({ where: { productId: id } });
      if (bom.length > 0) {
        await tx.bomItem.createMany({
          data: bom.map((item) => ({
            productId: id,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
          })),
        });
      }
    }

    return tx.product.findUnique({
      where: { id },
      include: {
        bomItems: {
          include: {
            ingredient: {
              select: { id: true, name: true, unit: true, costPerUnit: true },
            },
          },
        },
      },
    });
  });
}

async function remove(id) {
  await getById(id);
  return prisma.product.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };
