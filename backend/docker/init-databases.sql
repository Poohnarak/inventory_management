-- This script runs once when the postgres container is first created.
-- It creates the system database and default demo shop databases
-- so Prisma migrations and seed script can run.

-- The system database (POSTGRES_DB=inventory_system is created automatically by Docker)

-- Per-shop databases for the demo shop
CREATE DATABASE shop_demo_users;
CREATE DATABASE shop_demo_app;
