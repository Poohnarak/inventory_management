const superadminService = require('../services/superadmin.service');
const { success, created, paginated } = require('../utils/response');

// ─── Overview ─────────────────────────────────────────────────────────

async function getOverview(req, res, next) {
  try {
    const data = await superadminService.getOverview();
    return success(res, data);
  } catch (error) {
    next(error);
  }
}

// ─── Shop CRUD ────────────────────────────────────────────────────────

async function listShops(req, res, next) {
  try {
    const { search, isActive, page = 1, limit = 50 } = req.query;
    const result = await superadminService.listShops({
      search,
      isActive: isActive === undefined ? undefined : isActive === 'true',
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return paginated(res, result.shops, result.total, parseInt(page, 10), parseInt(limit, 10));
  } catch (error) {
    next(error);
  }
}

async function getShop(req, res, next) {
  try {
    const shop = await superadminService.getShopById(parseInt(req.params.id, 10));
    return success(res, shop);
  } catch (error) {
    next(error);
  }
}

async function createShop(req, res, next) {
  try {
    const shop = await superadminService.createShop(req.body);
    return created(res, shop);
  } catch (error) {
    next(error);
  }
}

async function updateShop(req, res, next) {
  try {
    const shop = await superadminService.updateShop(parseInt(req.params.id, 10), req.body);
    return success(res, shop);
  } catch (error) {
    next(error);
  }
}

async function deleteShop(req, res, next) {
  try {
    const result = await superadminService.deleteShop(parseInt(req.params.id, 10));
    return success(res, result);
  } catch (error) {
    next(error);
  }
}

// ─── Security Controls ────────────────────────────────────────────────

async function enableShop(req, res, next) {
  try {
    const shop = await superadminService.setShopActive(parseInt(req.params.id, 10), true);
    return success(res, shop);
  } catch (error) {
    next(error);
  }
}

async function disableShop(req, res, next) {
  try {
    const shop = await superadminService.setShopActive(parseInt(req.params.id, 10), false);
    return success(res, shop);
  } catch (error) {
    next(error);
  }
}

async function resetAdmin(req, res, next) {
  try {
    const result = await superadminService.resetShopAdmin(
      parseInt(req.params.id, 10),
      req.body
    );
    return success(res, result);
  } catch (error) {
    next(error);
  }
}

// ─── Shop Statistics ──────────────────────────────────────────────────

async function getShopStats(req, res, next) {
  try {
    const stats = await superadminService.getShopStats(parseInt(req.params.id, 10));
    return success(res, stats);
  } catch (error) {
    next(error);
  }
}

async function getShopUsers(req, res, next) {
  try {
    const users = await superadminService.getShopUsers(parseInt(req.params.id, 10));
    return success(res, users);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  listShops,
  getShop,
  createShop,
  updateShop,
  deleteShop,
  enableShop,
  disableShop,
  resetAdmin,
  getShopStats,
  getShopUsers,
};
