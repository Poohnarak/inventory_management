/**
 * Provision a new shop: create user DB + app DB, run Prisma migrations,
 * and seed a default admin user in the user DB.
 *
 * This module can be used as a library (imported by super-admin service)
 * or run directly from CLI:
 *
 *   node scripts/provision-shop.js <user_db_name> <app_db_name> [admin_username] [admin_password]
 *
 * Example:
 *   node scripts/provision-shop.js shop_demo_users shop_demo_app admin admin123
 */

require('dotenv').config();
const { Client } = require('pg');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');
const path = require('path');

const baseUrl =
  process.env.SHOP_DATABASE_BASE_URL ||
  'postgresql://postgres:postgres@localhost:5432';

/**
 * Create a PostgreSQL database if it doesn't already exist.
 */
async function createDatabase(pgClient, dbName) {
  const result = await pgClient.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [dbName]
  );

  if (result.rowCount === 0) {
    await pgClient.query(
      `CREATE DATABASE "${dbName}" TEMPLATE template0 ENCODING 'UTF8'`
    );
    console.log(`  Database "${dbName}" created.`);
    return true;
  } else {
    console.log(`  Database "${dbName}" already exists.`);
    return false;
  }
}

/**
 * Run Prisma migrate deploy against a database.
 */
function runMigrations(schemaDir, envVarName, dbName) {
  const schemaPath = path.resolve(__dirname, '..', 'prisma', schemaDir, 'schema.prisma');
  const dbUrl = `${baseUrl}/${dbName}?schema=public`;

  console.log(`  Running migrations on "${dbName}" (${schemaDir})...`);
  execSync(`npx prisma migrate deploy --schema="${schemaPath}"`, {
    stdio: 'inherit',
    env: { ...process.env, [envVarName]: dbUrl },
  });
}

/**
 * Seed a default admin user in the shop user database.
 */
async function seedAdminUser(userDbName, username = 'admin', password = 'admin123') {
  const { PrismaClient: ShopUserPrismaClient } = require('@prisma/client/shop_user');
  const client = new ShopUserPrismaClient({
    datasourceUrl: `${baseUrl}/${userDbName}?schema=public`,
  });

  try {
    const existing = await client.shopUser.findUnique({ where: { username } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(password, 12);
      await client.shopUser.create({
        data: { username, passwordHash, role: 'ADMIN' },
      });
      console.log(`  Admin user "${username}" created in "${userDbName}".`);
    } else {
      console.log(`  Admin user "${username}" already exists in "${userDbName}".`);
    }
  } finally {
    await client.$disconnect();
  }
}

/**
 * Full provisioning flow: create both databases, migrate, and seed admin.
 */
async function provisionShop(userDbName, appDbName, adminUsername = 'admin', adminPassword = 'admin123') {
  console.log(`Provisioning shop databases: ${userDbName}, ${appDbName}`);

  const pgClient = new Client({ connectionString: `${baseUrl}/postgres` });
  await pgClient.connect();

  try {
    await createDatabase(pgClient, userDbName);
    await createDatabase(pgClient, appDbName);
  } finally {
    await pgClient.end();
  }

  // Run migrations for both schemas
  runMigrations('shop_user', 'SHOP_USER_DATABASE_URL', userDbName);
  runMigrations('shop_app', 'SHOP_APP_DATABASE_URL', appDbName);

  // Seed admin user
  await seedAdminUser(userDbName, adminUsername, adminPassword);

  console.log(`Shop provisioning complete.`);
}

// CLI mode
if (require.main === module) {
  const userDbName = process.argv[2];
  const appDbName = process.argv[3];
  const adminUsername = process.argv[4] || 'admin';
  const adminPassword = process.argv[5] || 'admin123';

  if (!userDbName || !appDbName) {
    console.error('Usage: node scripts/provision-shop.js <user_db_name> <app_db_name> [admin_username] [admin_password]');
    process.exit(1);
  }

  provisionShop(userDbName, appDbName, adminUsername, adminPassword).catch((err) => {
    console.error('Provisioning error:', err);
    process.exit(1);
  });
}

module.exports = { provisionShop, createDatabase, runMigrations, seedAdminUser };
