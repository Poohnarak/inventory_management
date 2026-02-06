const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { systemPrisma, getShopUserPrisma } = require('../config/db');
const config = require('../config/env');

/**
 * Login flow:
 * - If shopCode is provided → shop user login (ADMIN/STAFF)
 * - If shopCode is absent/empty → super admin login
 */
async function login({ shopCode, username, password }) {
  if (!shopCode) {
    return loginSuperAdmin({ username, password });
  }
  return loginShopUser({ shopCode, username, password });
}

/**
 * Super admin login: authenticate against the system database.
 */
async function loginSuperAdmin({ username, password }) {
  const user = await systemPrisma.systemUser.findUnique({
    where: { username },
  });
  if (!user) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }
  if (!user.isActive) {
    const error = new Error('Account is disabled');
    error.statusCode = 403;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: 'SUPER_ADMIN',
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      role: 'SUPER_ADMIN',
      shopCode: null,
      shopName: 'Platform Admin',
    },
    token,
  };
}

/**
 * Shop user login: look up the shop, then authenticate against the shop's user database.
 */
async function loginShopUser({ shopCode, username, password }) {
  // 1. Look up the shop in the system database
  const shop = await systemPrisma.shop.findUnique({
    where: { shopCode },
  });
  if (!shop) {
    const error = new Error('Invalid shop code');
    error.statusCode = 401;
    throw error;
  }
  if (!shop.isActive) {
    const error = new Error('This shop has been disabled. Contact the platform administrator.');
    error.statusCode = 403;
    throw error;
  }

  // 2. Look up the user in the shop's user database
  const shopUserPrisma = getShopUserPrisma(shop.userDbName);
  const user = await shopUserPrisma.shopUser.findUnique({
    where: { username },
  });
  if (!user) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }
  if (!user.isActive) {
    const error = new Error('Account is disabled');
    error.statusCode = 403;
    throw error;
  }

  // 3. Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  // 4. Generate JWT with both db names
  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
    shopCode: shop.shopCode,
    shopId: shop.id,
    userDb: shop.userDbName,
    appDb: shop.appDbName,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      shopCode: shop.shopCode,
      shopName: shop.shopName,
    },
    token,
  };
}

/**
 * Get list of active shops (for the login dropdown).
 */
async function getShops() {
  return systemPrisma.shop.findMany({
    where: { isActive: true },
    select: { id: true, shopCode: true, shopName: true },
    orderBy: { shopName: 'asc' },
  });
}

/**
 * Admin-only: create a new user in the shop's user database.
 */
async function createUser({ username, password, role, userDbName }) {
  const shopUserPrisma = getShopUserPrisma(userDbName);

  const existing = await shopUserPrisma.shopUser.findUnique({
    where: { username },
  });
  if (existing) {
    const error = new Error('Username already exists in this shop');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await shopUserPrisma.shopUser.create({
    data: { username, passwordHash, role: role || 'STAFF' },
    select: { id: true, username: true, role: true, isActive: true, createdAt: true },
  });

  return user;
}

/**
 * Admin-only: list users in the shop's user database.
 */
async function getUsersByShop(userDbName) {
  const shopUserPrisma = getShopUserPrisma(userDbName);
  return shopUserPrisma.shopUser.findMany({
    select: { id: true, username: true, role: true, isActive: true, createdAt: true },
    orderBy: { username: 'asc' },
  });
}

/**
 * Admin-only: delete a user from the shop's user database (cannot delete yourself).
 */
async function deleteUser(userId, requestingUserId, userDbName) {
  if (userId === requestingUserId) {
    const error = new Error('Cannot delete your own account');
    error.statusCode = 400;
    throw error;
  }

  const shopUserPrisma = getShopUserPrisma(userDbName);
  const user = await shopUserPrisma.shopUser.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  await shopUserPrisma.shopUser.delete({ where: { id: userId } });
  return { message: 'User deleted successfully' };
}

function generateToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

module.exports = { login, getShops, createUser, getUsersByShop, deleteUser };
