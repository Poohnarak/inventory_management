const ingredientService = require('../services/ingredient.service');
const { success, created, paginated } = require('../utils/response');

async function getAll(req, res, next) {
  try {
    const { search, unit, page = 1, limit = 50 } = req.query;
    const result = await ingredientService.getAll(req.shopAppPrisma, {
      search,
      unit,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return paginated(res, result.ingredients, result.total, parseInt(page, 10), parseInt(limit, 10));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const ingredient = await ingredientService.getById(req.shopAppPrisma, parseInt(req.params.id, 10));
    return success(res, ingredient);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const ingredient = await ingredientService.create(req.shopAppPrisma, req.body);
    return created(res, ingredient);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const ingredient = await ingredientService.update(req.shopAppPrisma, parseInt(req.params.id, 10), req.body);
    return success(res, ingredient);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await ingredientService.remove(req.shopAppPrisma, parseInt(req.params.id, 10));
    return success(res, { message: 'Ingredient deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function getLowStock(req, res, next) {
  try {
    const ingredients = await ingredientService.getLowStockRaw(req.shopAppPrisma);
    return success(res, ingredients);
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove, getLowStock };
