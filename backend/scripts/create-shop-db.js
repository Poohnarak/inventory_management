/**
 * Utility script: Create a new PostgreSQL database for a shop
 * and run Prisma migrations on it.
 *
 * Usage:
 *   node scripts/create-shop-db.js <db_name>
 *
 * Example:
 *   node scripts/create-shop-db.js shop_bangkok_01
 */

require('dotenv').config();
const { Client } = require('pg');
const { execSync } = require('child_process');
const path = require('path');

const dbName = process.argv[2];

if (!dbName) {
  console.error('Usage: node scripts/create-shop-db.js <db_name>');
  process.exit(1);
}

const baseUrl =
  process.env.SHOP_DATABASE_BASE_URL ||
  'postgresql://postgres:postgres@localhost:5432';

async function main() {
  // 1. Connect to the default "postgres" database to create the new DB
  const client = new Client({ connectionString: `${baseUrl}/postgres` });
  await client.connect();

  try {
    // Check if db already exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rowCount === 0) {
      // Use template0 to avoid encoding issues
      await client.query(`CREATE DATABASE "${dbName}" TEMPLATE template0 ENCODING 'UTF8'`);
      console.log(`Database "${dbName}" created.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } finally {
    await client.end();
  }

  // 2. Run Prisma migrations against the new shop database
  const shopSchemaPath = path.resolve(__dirname, '..', 'prisma', 'shop', 'schema.prisma');
  const shopUrl = `${baseUrl}/${dbName}?schema=public`;

  console.log(`Running Prisma migrations on "${dbName}"...`);
  execSync(
    `npx prisma migrate deploy --schema="${shopSchemaPath}"`,
    {
      stdio: 'inherit',
      env: { ...process.env, SHOP_DATABASE_URL: shopUrl },
    }
  );

  console.log(`Shop database "${dbName}" is ready.`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
