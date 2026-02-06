const stockService = require('../services/stock.service');
const { success, created, paginated } = require('../utils/response');

async function getMovements(req, res, next) {
  try {
    const { type, ingredientId, startDate, endDate, search, page = 1, limit = 50 } = req.query;
    const result = await stockService.getMovements(req.shopAppPrisma, {
      type,
      ingredientId: ingredientId ? parseInt(ingredientId, 10) : undefined,
      startDate,
      endDate,
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return paginated(res, result.movements, result.total, parseInt(page, 10), parseInt(limit, 10));
  } catch (error) {
    next(error);
  }
}

async function createAdjustment(req, res, next) {
  try {
    const movement = await stockService.createManualAdjustment(req.shopAppPrisma, req.body);
    return created(res, movement);
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await stockService.getStats(req.shopAppPrisma);
    return success(res, stats);
  } catch (error) {
    next(error);
  }
}

module.exports = { getMovements, createAdjustment, getStats };
