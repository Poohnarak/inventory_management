/**
 * All functions receive `prisma` (the shop-specific PrismaClient) as the first argument.
 */

async function getDashboard(prisma) {
  const [totalProducts, totalIngredients, ingredients, todaySalesRecords] = await Promise.all([
    prisma.product.count(),
    prisma.ingredient.count(),
    prisma.ingredient.findMany({
      select: { costPerUnit: true, currentStock: true },
    }),
    prisma.salesRecord.findMany({
      where: {
        date: {
          gte: new Date(new Date().toISOString().split('T')[0]),
          lt: new Date(new Date(Date.now() + 86400000).toISOString().split('T')[0]),
        },
      },
    }),
  ]);

  const currentStockValue = ingredients.reduce(
    (sum, ing) => sum + ing.costPerUnit * ing.currentStock,
    0
  );

  const todaySales = todaySalesRecords.reduce((sum, r) => sum + r.revenue, 0);

  return {
    totalProducts,
    totalIngredients,
    currentStockValue: Math.round(currentStockValue * 100) / 100,
    todaySales: Math.round(todaySales * 100) / 100,
  };
}

async function getNetProfit(prisma, { startDate, endDate, groupBy = 'day' }) {
  const where = {};
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate + 'T23:59:59.999Z');
  }

  const salesRecords = await prisma.salesRecord.findMany({
    where,
    orderBy: { date: 'asc' },
  });

  const grouped = {};
  for (const record of salesRecords) {
    let key;
    if (groupBy === 'month') {
      key = record.date.toISOString().slice(0, 7);
    } else {
      key = record.date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = { date: key, revenue: 0, costOfGoods: 0, netProfit: 0 };
    }
    grouped[key].revenue += record.revenue;
    grouped[key].costOfGoods += record.costOfGoods;
  }

  const report = Object.values(grouped).map((item) => ({
    ...item,
    revenue: Math.round(item.revenue * 100) / 100,
    costOfGoods: Math.round(item.costOfGoods * 100) / 100,
    netProfit: Math.round((item.revenue - item.costOfGoods) * 100) / 100,
  }));

  const totals = report.reduce(
    (acc, item) => ({
      revenue: acc.revenue + item.revenue,
      costOfGoods: acc.costOfGoods + item.costOfGoods,
      netProfit: acc.netProfit + item.netProfit,
    }),
    { revenue: 0, costOfGoods: 0, netProfit: 0 }
  );

  return {
    records: report,
    totals: {
      revenue: Math.round(totals.revenue * 100) / 100,
      costOfGoods: Math.round(totals.costOfGoods * 100) / 100,
      netProfit: Math.round(totals.netProfit * 100) / 100,
    },
  };
}

async function getLowStockAlerts(prisma) {
  return prisma.$queryRaw`
    SELECT id, name, unit, current_stock as "currentStock", 
           low_stock_threshold as "lowStockThreshold",
           cost_per_unit as "costPerUnit"
    FROM ingredients
    WHERE current_stock <= low_stock_threshold
    ORDER BY current_stock ASC
  `;
}

module.exports = { getDashboard, getNetProfit, getLowStockAlerts };
