const productService = require('../services/product.service');
const { success, created, paginated } = require('../utils/response');

async function getAll(req, res, next) {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const result = await productService.getAll(req.shopAppPrisma, {
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return paginated(res, result.products, result.total, parseInt(page, 10), parseInt(limit, 10));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const product = await productService.getById(req.shopAppPrisma, parseInt(req.params.id, 10));
    return success(res, product);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const product = await productService.create(req.shopAppPrisma, req.body);
    return created(res, product);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const product = await productService.update(req.shopAppPrisma, parseInt(req.params.id, 10), req.body);
    return success(res, product);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await productService.remove(req.shopAppPrisma, parseInt(req.params.id, 10));
    return success(res, { message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
