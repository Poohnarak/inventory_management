const { PrismaClient: SystemPrismaClient } = require('@prisma/client/system');
const { PrismaClient: ShopUserPrismaClient } = require('@prisma/client/shop_user');
const { PrismaClient: ShopAppPrismaClient } = require('@prisma/client/shop_app');
const config = require('./env');

const logLevel = config.nodeEnv === 'development' ? ['error', 'warn'] : ['error'];

// ---------- System database client (singleton) ----------
const systemPrisma = new SystemPrismaClient({
  datasourceUrl: config.systemDatabaseUrl,
  log: logLevel,
});

// ---------- Per-shop database clients (cached in-memory) ----------
const shopUserClients = new Map();
const shopAppClients = new Map();

/**
 * Build a PostgreSQL connection URL for a given database name.
 * All databases live on the same PostgreSQL server.
 */
function buildDatabaseUrl(dbName) {
  const base = config.shopDatabaseBaseUrl;
  return `${base}/${dbName}?schema=public`;
}

/**
 * Return a cached PrismaClient connected to a shop's USER database.
 */
function getShopUserPrisma(userDbName) {
  if (shopUserClients.has(userDbName)) {
    return shopUserClients.get(userDbName);
  }

  const client = new ShopUserPrismaClient({
    datasourceUrl: buildDatabaseUrl(userDbName),
    log: logLevel,
  });

  shopUserClients.set(userDbName, client);
  return client;
}

/**
 * Return a cached PrismaClient connected to a shop's APP database.
 */
function getShopAppPrisma(appDbName) {
  if (shopAppClients.has(appDbName)) {
    return shopAppClients.get(appDbName);
  }

  const client = new ShopAppPrismaClient({
    datasourceUrl: buildDatabaseUrl(appDbName),
    log: logLevel,
  });

  shopAppClients.set(appDbName, client);
  return client;
}

/**
 * Remove and disconnect a specific shop's cached clients.
 * Useful when a shop is deleted or disabled.
 */
async function removeShopClients(userDbName, appDbName) {
  if (shopUserClients.has(userDbName)) {
    await shopUserClients.get(userDbName).$disconnect();
    shopUserClients.delete(userDbName);
  }
  if (shopAppClients.has(appDbName)) {
    await shopAppClients.get(appDbName).$disconnect();
    shopAppClients.delete(appDbName);
  }
}

/**
 * Disconnect all cached clients (for graceful shutdown).
 */
async function disconnectAll() {
  await systemPrisma.$disconnect();
  for (const [, client] of shopUserClients) {
    await client.$disconnect();
  }
  for (const [, client] of shopAppClients) {
    await client.$disconnect();
  }
  shopUserClients.clear();
  shopAppClients.clear();
}

module.exports = {
  systemPrisma,
  getShopUserPrisma,
  getShopAppPrisma,
  buildDatabaseUrl,
  removeShopClients,
  disconnectAll,
};
