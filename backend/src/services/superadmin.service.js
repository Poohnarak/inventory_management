const bcrypt = require('bcryptjs');
const { systemPrisma, getShopUserPrisma, getShopAppPrisma, removeShopClients } = require('../config/db');
const { provisionShop } = require('../../scripts/provision-shop');

// ─── System Overview Metrics ──────────────────────────────────────────

/**
 * Get platform-wide overview statistics.
 */
async function getOverview() {
  const [totalShops, activeShops, disabledShops, totalSuperAdmins] = await Promise.all([
    systemPrisma.shop.count(),
    systemPrisma.shop.count({ where: { isActive: true } }),
    systemPrisma.shop.count({ where: { isActive: false } }),
    systemPrisma.systemUser.count({ where: { role: 'SUPER_ADMIN' } }),
  ]);

  return {
    totalShops,
    activeShops,
    disabledShops,
    totalSuperAdmins,
  };
}

// ─── Shop CRUD ────────────────────────────────────────────────────────

/**
 * List all shops with optional filtering.
 */
async function listShops({ search, isActive, page = 1, limit = 50 }) {
  const where = {};
  if (search) {
    where.OR = [
      { shopCode: { contains: search, mode: 'insensitive' } },
      { shopName: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const [shops, total] = await Promise.all([
    systemPrisma.shop.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    systemPrisma.shop.count({ where }),
  ]);

  return { shops, total };
}

/**
 * Get a single shop by ID.
 */
async function getShopById(id) {
  const shop = await systemPrisma.shop.findUnique({ where: { id } });
  if (!shop) {
    const error = new Error('Shop not found');
    error.statusCode = 404;
    throw error;
  }
  return shop;
}

/**
 * Create a new shop with full auto-provisioning:
 * 1. Register in system DB
 * 2. Create user DB + app DB
 * 3. Run migrations
 * 4. Seed default admin user
 */
async function createShop({ shopCode, shopName, adminUsername = 'admin', adminPassword = 'admin123' }) {
  // Validate uniqueness
  const existing = await systemPrisma.shop.findUnique({ where: { shopCode } });
  if (existing) {
    const error = new Error('Shop code already exists');
    error.statusCode = 409;
    throw error;
  }

  // Derive database names from shop code
  const normalizedCode = shopCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const userDbName = `shop_${normalizedCode}_users`;
  const appDbName = `shop_${normalizedCode}_app`;

  // 1. Register shop in system database
  const shop = await systemPrisma.shop.create({
    data: {
      shopCode,
      shopName,
      userDbName,
      appDbName,
    },
  });

  try {
    // 2. Provision databases (create DBs, migrate, seed admin)
    await provisionShop(userDbName, appDbName, adminUsername, adminPassword);
  } catch (provisionError) {
    // Roll back the shop record if provisioning fails
    await systemPrisma.shop.delete({ where: { id: shop.id } });
    const error = new Error(`Shop provisioning failed: ${provisionError.message}`);
    error.statusCode = 500;
    throw error;
  }

  return shop;
}

/**
 * Update shop details (name, code).
 */
async function updateShop(id, data) {
  await getShopById(id);
  return systemPrisma.shop.update({
    where: { id },
    data: {
      ...(data.shopName && { shopName: data.shopName }),
      ...(data.shopCode && { shopCode: data.shopCode }),
    },
  });
}

/**
 * Delete a shop (soft: disable, or hard: remove record).
 * Note: hard delete does NOT drop the PostgreSQL databases.
 */
async function deleteShop(id) {
  const shop = await getShopById(id);
  await removeShopClients(shop.userDbName, shop.appDbName);
  await systemPrisma.shop.delete({ where: { id } });
  return { message: 'Shop deleted successfully' };
}

// ─── Shop Status Controls ─────────────────────────────────────────────

/**
 * Enable or disable a shop.
 */
async function setShopActive(id, isActive) {
  await getShopById(id);
  return systemPrisma.shop.update({
    where: { id },
    data: { isActive },
  });
}

/**
 * Reset a shop's admin password. Creates the admin user if it doesn't exist.
 */
async function resetShopAdmin(id, { username = 'admin', password = 'admin123' } = {}) {
  const shop = await getShopById(id);
  const shopUserPrisma = getShopUserPrisma(shop.userDbName);
  const passwordHash = await bcrypt.hash(password, 12);

  const existingUser = await shopUserPrisma.shopUser.findUnique({ where: { username } });
  if (existingUser) {
    await shopUserPrisma.shopUser.update({
      where: { id: existingUser.id },
      data: { passwordHash, isActive: true, role: 'ADMIN' },
    });
    return { message: `Admin user "${username}" password has been reset.` };
  } else {
    await shopUserPrisma.shopUser.create({
      data: { username, passwordHash, role: 'ADMIN' },
    });
    return { message: `Admin user "${username}" created.` };
  }
}

// ─── Shop Usage Statistics ────────────────────────────────────────────

/**
 * Get usage stats for a specific shop.
 */
async function getShopStats(id) {
  const shop = await getShopById(id);
  const shopUserPrisma = getShopUserPrisma(shop.userDbName);
  const shopAppPrisma = getShopAppPrisma(shop.appDbName);

  try {
    const [totalUsers, activeUsers, totalProducts, totalIngredients, totalSalesRecords, totalPurchases] =
      await Promise.all([
        shopUserPrisma.shopUser.count(),
        shopUserPrisma.shopUser.count({ where: { isActive: true } }),
        shopAppPrisma.product.count(),
        shopAppPrisma.ingredient.count(),
        shopAppPrisma.salesRecord.count(),
        shopAppPrisma.purchase.count(),
      ]);

    return {
      shop: {
        id: shop.id,
        shopCode: shop.shopCode,
        shopName: shop.shopName,
        isActive: shop.isActive,
      },
      users: { total: totalUsers, active: activeUsers },
      data: {
        products: totalProducts,
        ingredients: totalIngredients,
        salesRecords: totalSalesRecords,
        purchases: totalPurchases,
      },
    };
  } catch (err) {
    // Database might not be provisioned yet
    return {
      shop: {
        id: shop.id,
        shopCode: shop.shopCode,
        shopName: shop.shopName,
        isActive: shop.isActive,
      },
      users: { total: 0, active: 0 },
      data: { products: 0, ingredients: 0, salesRecords: 0, purchases: 0 },
      error: 'Could not read shop databases. They may not be provisioned yet.',
    };
  }
}

/**
 * List users in a specific shop (for super admin visibility).
 */
async function getShopUsers(id) {
  const shop = await getShopById(id);
  const shopUserPrisma = getShopUserPrisma(shop.userDbName);
  return shopUserPrisma.shopUser.findMany({
    select: { id: true, username: true, role: true, isActive: true, createdAt: true },
    orderBy: { username: 'asc' },
  });
}

module.exports = {
  getOverview,
  listShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
  setShopActive,
  resetShopAdmin,
  getShopStats,
  getShopUsers,
};
