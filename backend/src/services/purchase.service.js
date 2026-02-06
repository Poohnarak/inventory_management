/**
 * All functions receive `prisma` (the shop-specific PrismaClient) as the first argument.
 */

async function getAll(prisma, { page = 1, limit = 20 }) {
  const [purchases, total] = await Promise.all([
    prisma.purchase.findMany({
      include: {
        items: {
          include: {
            ingredient: { select: { id: true, name: true, unit: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchase.count(),
  ]);

  return { purchases, total };
}

async function getById(prisma, id) {
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          ingredient: { select: { id: true, name: true, unit: true } },
        },
      },
    },
  });

  if (!purchase) {
    const error = new Error('Purchase not found');
    error.statusCode = 404;
    throw error;
  }
  return purchase;
}

async function create(prisma, { date, items, imageUrl, note }) {
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        date: date ? new Date(date) : new Date(),
        totalAmount,
        imageUrl,
        note,
        items: {
          create: items.map((item) => ({
            ingredientId: item.ingredientId,
            rawItemName: item.rawItemName || '',
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            ingredient: { select: { id: true, name: true, unit: true } },
          },
        },
      },
    });

    // Increase stock for each purchased ingredient
    for (const item of items) {
      await tx.stockMovement.create({
        data: {
          ingredientId: item.ingredientId,
          type: 'Purchase',
          quantityChange: item.quantity,
          referenceId: `purchase-${purchase.id}`,
        },
      });

      await tx.ingredient.update({
        where: { id: item.ingredientId },
        data: { currentStock: { increment: item.quantity } },
      });
    }

    return purchase;
  });
}

async function uploadReceipt(file) {
  return {
    imageUrl: `/uploads/${file.filename}`,
    message: 'Receipt uploaded. OCR processing is not yet implemented. Please enter items manually.',
  };
}

module.exports = { getAll, getById, create, uploadReceipt };
