const { PrismaClient: MainPrismaClient } = require('@prisma/client/main');
const { PrismaClient: ShopPrismaClient } = require('@prisma/client/shop');
const config = require('./env');

// ---------- Main database client (singleton) ----------
const mainPrisma = new MainPrismaClient({
  datasourceUrl: config.mainDatabaseUrl,
  log: config.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
});

// ---------- Per-shop database clients (cached in-memory) ----------
const shopClients = new Map();

/**
 * Build a PostgreSQL connection URL for a shop database.
 * All shop databases live on the same PostgreSQL server, so we replace
 * only the database name portion of the base URL.
 */
function buildShopDatabaseUrl(dbName) {
  const base = config.shopDatabaseBaseUrl; // e.g. postgresql://user:pass@host:5432
  return `${base}/${dbName}?schema=public`;
}

/**
 * Return a cached PrismaClient connected to the given shop's database.
 * Creates a new client on first access and caches it for subsequent calls.
 */
function getShopPrisma(dbName) {
  if (shopClients.has(dbName)) {
    return shopClients.get(dbName);
  }

  const client = new ShopPrismaClient({
    datasourceUrl: buildShopDatabaseUrl(dbName),
    log: config.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
  });

  shopClients.set(dbName, client);
  return client;
}

/**
 * Disconnect all cached shop clients (for graceful shutdown).
 */
async function disconnectAll() {
  await mainPrisma.$disconnect();
  for (const [, client] of shopClients) {
    await client.$disconnect();
  }
  shopClients.clear();
}

module.exports = { mainPrisma, getShopPrisma, buildShopDatabaseUrl, disconnectAll };
