const purchaseService = require('../services/purchase.service');
const { success, created, paginated } = require('../utils/response');

async function getAll(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await purchaseService.getAll(req.shopAppPrisma, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return paginated(res, result.purchases, result.total, parseInt(page, 10), parseInt(limit, 10));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const purchase = await purchaseService.getById(req.shopAppPrisma, parseInt(req.params.id, 10));
    return success(res, purchase);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const purchase = await purchaseService.create(req.shopAppPrisma, req.body);
    return created(res, purchase);
  } catch (error) {
    next(error);
  }
}

async function uploadReceipt(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const result = await purchaseService.uploadReceipt(req.file);
    return success(res, result);
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, uploadReceipt };
