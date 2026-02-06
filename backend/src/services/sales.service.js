const prisma = require('../config/db');
const { parse } = require('csv-parse/sync');

async function getImports({ page = 1, limit = 20 }) {
  const [imports, total] = await Promise.all([
    prisma.salesImport.findMany({
      include: { _count: { select: { records: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.salesImport.count(),
  ]);

  return { imports, total };
}

async function parseCSV(fileBuffer) {
  const content = fileBuffer.toString('utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((row, index) => ({
    id: (index + 1).toString(),
    productName: row.product_name || row.productName || row.name || '',
    quantity: parseInt(row.quantity || row.qty || '0', 10),
    date: row.date || new Date().toISOString().split('T')[0],
  }));
}

async function importSales({ fileName, source, mappings }) {
  // mappings: Array of { productName, quantity, date, productId }
  return prisma.$transaction(async (tx) => {
    // Create the import record
    const salesImport = await tx.salesImport.create({
      data: {
        fileName,
        source: source || 'Manual',
        totalRows: mappings.length,
      },
    });

    // Process each mapped sale
    for (const mapping of mappings) {
      // Get the product and its BOM
      const product = await tx.product.findUnique({
        where: { id: mapping.productId },
        include: {
          bomItems: {
            include: { ingredient: true },
          },
        },
      });

      if (!product) continue;

      const revenue = product.sellingPrice * mapping.quantity;

      // Calculate cost of goods
      let costOfGoods = 0;
      for (const bomItem of product.bomItems) {
        costOfGoods += bomItem.ingredient.costPerUnit * bomItem.quantity * mapping.quantity;
      }

      // Create the sales record
      await tx.salesRecord.create({
        data: {
          salesImportId: salesImport.id,
          productId: mapping.productId,
          productName: mapping.productName,
          quantity: mapping.quantity,
          date: new Date(mapping.date),
          revenue,
          costOfGoods,
        },
      });

      // Deduct stock based on BOM
      for (const bomItem of product.bomItems) {
        const deduction = bomItem.quantity * mapping.quantity;

        await tx.stockMovement.create({
          data: {
            ingredientId: bomItem.ingredientId,
            type: 'Sale',
            quantityChange: -deduction,
            referenceId: `sales-import-${salesImport.id}`,
          },
        });

        await tx.ingredient.update({
          where: { id: bomItem.ingredientId },
          data: { currentStock: { decrement: deduction } },
        });
      }
    }

    return tx.salesImport.findUnique({
      where: { id: salesImport.id },
      include: {
        records: true,
        _count: { select: { records: true } },
      },
    });
  });
}

module.exports = { getImports, parseCSV, importSales };
