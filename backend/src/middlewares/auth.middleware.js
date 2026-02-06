const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { getShopUserPrisma, getShopAppPrisma } = require('../config/db');

/**
 * Verify JWT and attach `req.user`, `req.shopUserPrisma`, and `req.shopAppPrisma`.
 *
 * For SUPER_ADMIN tokens (no shop context):
 *   req.user = { id, username, role: 'SUPER_ADMIN' }
 *   req.shopUserPrisma = undefined
 *   req.shopAppPrisma  = undefined
 *
 * For shop-level tokens (ADMIN / STAFF):
 *   req.user = { id, username, role, shopCode, shopId, userDb, appDb }
 *   req.shopUserPrisma = PrismaClient for the shop's user database
 *   req.shopAppPrisma  = PrismaClient for the shop's app database
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;

    // Attach shop-specific Prisma clients for non-super-admin users
    if (decoded.role !== 'SUPER_ADMIN' && decoded.userDb && decoded.appDb) {
      req.shopUserPrisma = getShopUserPrisma(decoded.userDb);
      req.shopAppPrisma = getShopAppPrisma(decoded.appDb);
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Role-based authorization guard.
 * Pass one or more allowed roles. SUPER_ADMIN always passes.
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    // SUPER_ADMIN bypasses all role checks
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
}

/**
 * Require SUPER_ADMIN role specifically. No shop users allowed.
 */
function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super admin access required.' });
  }
  next();
}

module.exports = { authenticate, authorize, requireSuperAdmin };
