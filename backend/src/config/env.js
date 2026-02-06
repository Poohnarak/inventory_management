require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // System database (super admins + shop registry)
  systemDatabaseUrl:
    process.env.SYSTEM_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/inventory_system?schema=public',

  // Base URL used to build per-shop connection strings.
  // The database name is appended at runtime: <base>/<db_name>?schema=public
  shopDatabaseBaseUrl:
    process.env.SHOP_DATABASE_BASE_URL ||
    'postgresql://postgres:postgres@localhost:5432',

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,
  },
};
