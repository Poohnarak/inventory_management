const prisma = require('../config/db');

async function getMovements({ type, ingredientId, startDate, endDate, search, page = 1, limit = 50 }) {
  const where = {};

  if (type && type !== 'all') {
    where.type = type;
  }
  if (ingredientId) {
    where.ingredientId = ingredientId;
  }
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
  }
  if (search) {
    where.ingredient = { name: { contains: search, mode: 'insensitive' } };
  }

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        ingredient: { select: { id: true, name: true, unit: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return { movements, total };
}

async function adjustStock(ingredientId, quantityChange, type, note = null, referenceId = null) {
  return prisma.$transaction(async (tx) => {
    // Create movement record
    const movement = await tx.stockMovement.create({
      data: {
        ingredientId,
        type,
        quantityChange,
        note,
        referenceId,
      },
    });

    // Update ingredient current stock
    await tx.ingredient.update({
      where: { id: ingredientId },
      data: {
        currentStock: { increment: quantityChange },
      },
    });

    return movement;
  });
}

async function createManualAdjustment({ ingredientId, quantityChange, note }) {
  return adjustStock(ingredientId, quantityChange, 'Adjustment', note);
}

async function getStats() {
  const [purchases, sales, adjustments] = await Promise.all([
    prisma.stockMovement.count({ where: { type: 'Purchase' } }),
    prisma.stockMovement.count({ where: { type: 'Sale' } }),
    prisma.stockMovement.count({ where: { type: 'Adjustment' } }),
  ]);

  return { purchases, sales, adjustments };
}

module.exports = { getMovements, adjustStock, createManualAdjustment, getStats };
