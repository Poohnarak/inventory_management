const salesService = require('../services/sales.service');
const { success, created, paginated } = require('../utils/response');

async function getImports(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await salesService.getImports(req.shopAppPrisma, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return paginated(res, result.imports, result.total, parseInt(page, 10), parseInt(limit, 10));
  } catch (error) {
    next(error);
  }
}

async function parseCSV(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }
    const rows = await salesService.parseCSV(req.file.buffer);
    return success(res, { rows, fileName: req.file.originalname });
  } catch (error) {
    next(error);
  }
}

async function importSales(req, res, next) {
  try {
    const result = await salesService.importSales(req.shopAppPrisma, req.body);
    return created(res, result);
  } catch (error) {
    next(error);
  }
}

module.exports = { getImports, parseCSV, importSales };
