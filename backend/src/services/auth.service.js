const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { mainPrisma } = require('../config/db');
const config = require('../config/env');

/**
 * Login with shop_code + username + password.
 * Returns a JWT that embeds shop_code, db_name, role, and user id.
 */
async function login({ shopCode, username, password }) {
  // 1. Look up the shop
  const shop = await mainPrisma.shop.findUnique({
    where: { shopCode },
  });
  if (!shop) {
    const error = new Error('Invalid shop code');
    error.statusCode = 401;
    throw error;
  }

  // 2. Look up the user within that shop
  const user = await mainPrisma.user.findUnique({
    where: {
      username_shopId: { username, shopId: shop.id },
    },
  });
  if (!user) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  // 3. Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  // 4. Generate JWT
  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
    shopId: shop.id,
    shopCode: shop.shopCode,
    dbName: shop.dbName,
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
 * Get list of shops (for the login dropdown).
 */
async function getShops() {
  return mainPrisma.shop.findMany({
    select: { id: true, shopCode: true, shopName: true },
    orderBy: { shopName: 'asc' },
  });
}

/**
 * Admin-only: create a new user for the admin's own shop.
 */
async function createUser({ username, password, role, shopId }) {
  // Check for duplicate username within the same shop
  const existing = await mainPrisma.user.findUnique({
    where: { username_shopId: { username, shopId } },
  });
  if (existing) {
    const error = new Error('Username already exists in this shop');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await mainPrisma.user.create({
    data: { username, passwordHash, role: role || 'STAFF', shopId },
    select: { id: true, username: true, role: true, shopId: true, createdAt: true },
  });

  return user;
}

/**
 * Admin-only: list users in a given shop.
 */
async function getUsersByShop(shopId) {
  return mainPrisma.user.findMany({
    where: { shopId },
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { username: 'asc' },
  });
}

/**
 * Admin-only: delete a user (cannot delete yourself).
 */
async function deleteUser(userId, requestingUserId) {
  if (userId === requestingUserId) {
    const error = new Error('Cannot delete your own account');
    error.statusCode = 400;
    throw error;
  }

  const user = await mainPrisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  await mainPrisma.user.delete({ where: { id: userId } });
  return { message: 'User deleted successfully' };
}

function generateToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

module.exports = { login, getShops, createUser, getUsersByShop, deleteUser };
