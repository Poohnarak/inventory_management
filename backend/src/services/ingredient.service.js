/**
 * All functions receive `prisma` (the shop-specific PrismaClient) as the first argument.
 */

async function getAll(prisma, { search, unit, page = 1, limit = 50 }) {
  const where = {};

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  if (unit && unit !== 'all') {
    where.unit = unit;
  }

  const [ingredients, total] = await Promise.all([
    prisma.ingredient.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ingredient.count({ where }),
  ]);

  return { ingredients, total };
}

async function getById(prisma, id) {
  const ingredient = await prisma.ingredient.findUnique({ where: { id } });
  if (!ingredient) {
    const error = new Error('Ingredient not found');
    error.statusCode = 404;
    throw error;
  }
  return ingredient;
}

async function create(prisma, data) {
  return prisma.ingredient.create({ data });
}

async function update(prisma, id, data) {
  await getById(prisma, id);
  return prisma.ingredient.update({ where: { id }, data });
}

async function remove(prisma, id) {
  await getById(prisma, id);
  return prisma.ingredient.delete({ where: { id } });
}

async function getLowStockRaw(prisma) {
  return prisma.$queryRaw`
    SELECT * FROM ingredients
    WHERE current_stock <= low_stock_threshold
    ORDER BY current_stock ASC
  `;
}

module.exports = { getAll, getById, create, update, remove, getLowStockRaw };
