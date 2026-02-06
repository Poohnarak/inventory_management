# Inventory Management Backend (Multi-Tenant)

Multi-tenant Express.js + Prisma + PostgreSQL backend for the restaurant/shop inventory management system. Each shop gets its own isolated PostgreSQL database while a central main database manages shops and users.

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│   Frontend App   │────>│   Express API    │────>│   PostgreSQL          │
│   (Next.js)      │     │   (Node.js)      │     │                       │
└──────────────────┘     └──────────────────┘     │  inventory_main       │
                                                   │    - shops            │
                                                   │    - users            │
                                                   │                       │
                                                   │  shop_demo            │
                                                   │    - ingredients      │
                                                   │    - products         │
                                                   │    - bom_items        │
                                                   │    - stock_movements  │
                                                   │    - purchases        │
                                                   │    - purchase_items   │
                                                   │    - sales_imports    │
                                                   │    - sales_records    │
                                                   │                       │
                                                   │  shop_branch_02      │
                                                   │    (same schema)      │
                                                   └──────────────────────┘
```

## Tech Stack

- Node.js + Express.js
- PostgreSQL 16 (self-hosted via Docker)
- Prisma ORM (dual schema: main + shop)
- JWT Authentication (with shop_code + role)
- Multer (receipt image upload, OCR-ready)
- CSV import support (csv-parse)
- pg (for dynamic database creation)

## Folder Structure

```
backend/
├── docker/
│   ├── docker-compose.yml          # PostgreSQL container
│   └── init-databases.sql          # Creates shop_demo DB on first run
├── prisma/
│   ├── main/
│   │   └── schema.prisma           # Main DB schema (shops, users)
│   ├── shop/
│   │   └── schema.prisma           # Per-shop DB schema (inventory data)
│   └── seed.js                     # Seeds both databases
├── scripts/
│   └── create-shop-db.js           # Utility to create new shop databases
├── src/
│   ├── config/
│   │   ├── db.js                   # Dynamic Prisma client manager
│   │   └── env.js                  # Environment configuration
│   ├── controllers/                # Request handlers
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT auth + shop context injection
│   │   ├── error.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/                     # Express routers
│   ├── services/                   # Business logic (all accept prisma param)
│   ├── utils/
│   │   └── response.js
│   ├── app.js                      # Express application setup
│   └── server.js                   # Entry point
├── .env.example
├── .gitignore
└── package.json
```

---

## Quick Start (macOS / Linux)

### 1. Prerequisites

```bash
brew install node
brew install --cask docker
```

### 2. Start PostgreSQL

```bash
cd backend
docker compose -f docker/docker-compose.yml up -d
```

This creates two databases: `inventory_main` (default) and `shop_demo` (via init script).

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env if your PostgreSQL credentials differ
```

### 4. Install Dependencies & Generate Prisma Clients

```bash
npm install
npm run prisma:generate
```

### 5. Run Migrations

```bash
# Main database (shops + users)
npm run prisma:migrate:main

# Shop database (shop_demo)
npm run prisma:migrate:shop
```

### 6. Seed Data

```bash
npm run seed
```

This creates:
- **Shop**: DEMO (Demo Bakery)
- **Admin user**: `admin` / `admin123`
- **Staff user**: `staff` / `staff123`
- 10 ingredients, 5 products with BOM, and 7 stock movements

### 7. Start Server

```bash
npm run dev    # development (auto-reload)
npm start      # production
```

Server runs at `http://localhost:4000`

---

## Authentication Flow

### 1. Get Available Shops (for login dropdown)

```bash
curl http://localhost:4000/api/auth/shops
```

**Response:**

```json
{
  "success": true,
  "data": [
    { "id": 1, "shopCode": "DEMO", "shopName": "Demo Bakery" }
  ]
}
```

### 2. Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "shopCode": "DEMO",
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN",
      "shopCode": "DEMO",
      "shopName": "Demo Bakery"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### JWT Payload

```json
{
  "id": 1,
  "username": "admin",
  "role": "ADMIN",
  "shopId": 1,
  "shopCode": "DEMO",
  "dbName": "shop_demo"
}
```

The `dbName` is used by the auth middleware to dynamically connect to the correct shop database.

### 3. Use the Token

All protected endpoints require: `Authorization: Bearer <token>`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl http://localhost:4000/api/ingredients \
  -H "Authorization: Bearer $TOKEN"
```

---

## User Management (ADMIN only)

```bash
# List users in my shop
curl http://localhost:4000/api/auth/users \
  -H "Authorization: Bearer $TOKEN"

# Create a new user for my shop
curl -X POST http://localhost:4000/api/auth/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "cashier1",
    "password": "pass123456",
    "role": "STAFF"
  }'

# Delete a user
curl -X DELETE http://localhost:4000/api/auth/users/3 \
  -H "Authorization: Bearer $TOKEN"
```

**Authorization rules:**
- `ADMIN` can create/delete users **for their own shop only**
- `STAFF` cannot access user management endpoints
- You cannot delete your own account

---

## Creating a New Shop

```bash
# 1. Create the PostgreSQL database + apply migrations
node scripts/create-shop-db.js shop_branch_02

# 2. Register the shop in the main database
psql postgresql://postgres:postgres@localhost:5432/inventory_main -c \
  "INSERT INTO shops (shop_code, shop_name, db_name, created_at, updated_at)
   VALUES ('BRANCH02', 'Branch 02 - Silom', 'shop_branch_02', NOW(), NOW());"

# 3. Create an admin user for the new shop (generate bcrypt hash first)
node -e "require('bcryptjs').hash('admin123', 12).then(h => console.log(h))"
# Then insert with the hash:
psql postgresql://postgres:postgres@localhost:5432/inventory_main -c \
  "INSERT INTO users (username, password_hash, role, shop_id, created_at, updated_at)
   VALUES ('admin', '<bcrypt_hash>', 'ADMIN', 2, NOW(), NOW());"
```

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/shops` | List shops (for login dropdown) |
| POST | `/api/auth/login` | Login (shopCode + username + password) |

### Protected (require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Current user info |
| GET | `/api/auth/users` | List shop users (ADMIN only) |
| POST | `/api/auth/users` | Create user (ADMIN only) |
| DELETE | `/api/auth/users/:id` | Delete user (ADMIN only) |

#### Ingredients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ingredients` | List (?search, ?unit, ?page, ?limit) |
| GET | `/api/ingredients/low-stock` | Low stock alerts |
| GET | `/api/ingredients/:id` | Get by ID |
| POST | `/api/ingredients` | Create |
| PUT | `/api/ingredients/:id` | Update |
| DELETE | `/api/ingredients/:id` | Delete |

#### Products & BOM

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List (?search) |
| GET | `/api/products/:id` | Get by ID (includes BOM) |
| POST | `/api/products` | Create with BOM |
| PUT | `/api/products/:id` | Update (replaces BOM) |
| DELETE | `/api/products/:id` | Delete |

#### Stock

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stock/movements` | List (?type, ?ingredientId, ?startDate, ?endDate) |
| GET | `/api/stock/stats` | Movement type counts |
| POST | `/api/stock/adjust` | Manual adjustment |

#### Purchases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchases` | List |
| GET | `/api/purchases/:id` | Get by ID |
| POST | `/api/purchases` | Create (auto-updates stock) |
| POST | `/api/purchases/upload-receipt` | Upload receipt image |

#### Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales/imports` | List imports |
| POST | `/api/sales/parse-csv` | Upload & parse CSV |
| POST | `/api/sales/import` | Confirm import (deducts stock via BOM) |

#### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/dashboard` | Dashboard stats |
| GET | `/api/reports/net-profit` | Net profit (?startDate, ?endDate, ?groupBy) |
| GET | `/api/reports/low-stock` | Low stock alerts |

---

## How Multi-Tenancy Works

1. **Login** -- User provides `shopCode`, `username`, and `password`. The auth service looks up the shop in the main database, verifies credentials, and issues a JWT containing the shop's `dbName`.

2. **Middleware** -- The `authenticate` middleware verifies the JWT and uses `dbName` to get (or create) a cached `PrismaClient` connected to that shop's PostgreSQL database. This client is attached to `req.shopPrisma`.

3. **Services** -- Every service function receives `prisma` (the shop-specific client) as its first argument, ensuring all queries target the correct database.

4. **Isolation** -- Each shop's data lives in a completely separate PostgreSQL database. There is no way for one shop's API calls to access another shop's data.

```
Request Flow:
  Client -> JWT Token (contains dbName) -> Auth Middleware
    -> getShopPrisma(dbName) -> cached PrismaClient
    -> req.shopPrisma -> Controller -> Service(prisma, ...) -> Shop DB
```

---

## Prisma Studio

```bash
# Browse main database (shops, users)
npm run prisma:studio:main

# Browse shop database (inventory data)
npm run prisma:studio:shop
```

---

## Sample curl Commands

```bash
# Store token from login
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"shopCode":"DEMO","username":"admin","password":"admin123"}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data.token))")

# Create ingredient
curl -X POST http://localhost:4000/api/ingredients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Chocolate Chips",
    "category": "Dry Goods",
    "unit": "g",
    "costPerUnit": 0.08,
    "currentStock": 500,
    "lowStockThreshold": 100,
    "supplier": "Choco Supply"
  }'

# Create product with BOM
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Double Chocolate Muffin",
    "sellingPrice": 6.50,
    "bom": [
      { "ingredientId": 1, "quantity": 0.15 },
      { "ingredientId": 2, "quantity": 0.1 },
      { "ingredientId": 4, "quantity": 2 },
      { "ingredientId": 8, "quantity": 30 }
    ]
  }'

# Create purchase (auto-increases stock)
curl -X POST http://localhost:4000/api/purchases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "date": "2026-02-06",
    "note": "Weekly flour restock",
    "items": [
      { "ingredientId": 1, "rawItemName": "FLOUR 25KG", "quantity": 25, "price": 62.50 }
    ]
  }'

# Import sales (deducts stock via BOM)
curl -X POST http://localhost:4000/api/sales/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fileName": "grab-feb.csv",
    "source": "Grab",
    "mappings": [
      { "productName": "Chocolate Cake", "productId": 1, "quantity": 5, "date": "2026-02-05" }
    ]
  }'

# Dashboard
curl http://localhost:4000/api/reports/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Net profit report
curl "http://localhost:4000/api/reports/net-profit?startDate=2026-02-01&endDate=2026-02-28&groupBy=day" \
  -H "Authorization: Bearer $TOKEN"
```
