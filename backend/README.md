# Inventory Management Backend (SaaS Multi-Tenant)

SaaS-grade multi-tenant Express.js + Prisma + PostgreSQL backend for restaurant/shop inventory management. Uses a **3-tier database architecture**: one system database for platform management, plus a separate user database and app database per shop.

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌────────────────────────────┐
│   Frontend App   │────>│   Express API    │────>│   PostgreSQL (self-hosted)  │
│   (Next.js)      │     │   (Node.js)      │     │                             │
└──────────────────┘     └──────────────────┘     │  inventory_system           │
                                                   │    - system_users           │
                                                   │    - shops                  │
                                                   │                             │
                                                   │  shop_demo_users            │
                                                   │    - shop_users             │
                                                   │                             │
                                                   │  shop_demo_app              │
                                                   │    - ingredients            │
                                                   │    - products               │
                                                   │    - bom_items              │
                                                   │    - stock_movements        │
                                                   │    - purchases              │
                                                   │    - purchase_items         │
                                                   │    - sales_imports          │
                                                   │    - sales_records          │
                                                   │                             │
                                                   │  shop_branch02_users        │
                                                   │  shop_branch02_app          │
                                                   │    (same schemas per shop)  │
                                                   └────────────────────────────┘
```

## Roles

| Role | Scope | Capabilities |
|------|-------|-------------|
| `SUPER_ADMIN` | Platform | Full access: shop CRUD, provisioning, disable/enable shops, reset admin, view all stats |
| `ADMIN` | Per shop | Manage users within own shop, full access to shop inventory data |
| `STAFF` | Per shop | Read/write inventory data, no user management |

## Tech Stack

- Node.js + Express.js
- PostgreSQL 16 (self-hosted via Docker)
- Prisma ORM (3 schemas: system, shop_user, shop_app)
- JWT Authentication (with role, shop_code, user_db, app_db)
- Multer (receipt image upload)
- CSV import support (csv-parse)
- pg (for dynamic database creation during provisioning)

## Folder Structure

```
backend/
├── docker/
│   ├── docker-compose.yml              # PostgreSQL container
│   └── init-databases.sql              # Creates demo shop DBs on first run
├── prisma/
│   ├── system/
│   │   └── schema.prisma               # System DB (system_users, shops)
│   ├── shop_user/
│   │   └── schema.prisma               # Per-shop user DB (shop_users)
│   ├── shop_app/
│   │   └── schema.prisma               # Per-shop app DB (inventory data)
│   └── seed.js                         # Seeds all three databases
├── scripts/
│   └── provision-shop.js               # Auto-provision new shop databases
├── src/
│   ├── config/
│   │   ├── db.js                       # Dynamic Prisma client manager (3-tier)
│   │   └── env.js                      # Environment configuration
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── superadmin.controller.js    # Super admin dashboard APIs
│   │   ├── ingredient.controller.js
│   │   ├── product.controller.js
│   │   ├── stock.controller.js
│   │   ├── purchase.controller.js
│   │   ├── sales.controller.js
│   │   └── report.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js           # JWT auth + dynamic DB injection
│   │   ├── error.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── superadmin.routes.js         # SUPER_ADMIN-only endpoints
│   │   ├── ingredient.routes.js
│   │   ├── product.routes.js
│   │   ├── stock.routes.js
│   │   ├── purchase.routes.js
│   │   ├── sales.routes.js
│   │   └── report.routes.js
│   ├── services/
│   │   ├── auth.service.js              # Dual login flow (super admin + shop)
│   │   ├── superadmin.service.js        # Shop CRUD, provisioning, stats
│   │   ├── ingredient.service.js
│   │   ├── product.service.js
│   │   ├── stock.service.js
│   │   ├── purchase.service.js
│   │   ├── sales.service.js
│   │   └── report.service.js
│   ├── utils/
│   │   └── response.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
└── package.json
```

---

## Quick Start

### 1. Start PostgreSQL

```bash
cd backend
docker compose -f docker/docker-compose.yml up -d
```

Creates three databases: `inventory_system`, `shop_demo_users`, `shop_demo_app`.

### 2. Configure Environment

```bash
cp .env.example .env
```

### 3. Install Dependencies & Generate Prisma Clients

```bash
npm install
npm run prisma:generate
```

### 4. Run Migrations

```bash
npm run prisma:migrate:system
npm run prisma:migrate:shop-user
npm run prisma:migrate:shop-app
```

### 5. Seed Data

```bash
npm run seed
```

Creates:
- **Super admin**: `superadmin` / `super123` (no shop code needed)
- **Shop**: DEMO (Demo Bakery)
- **Shop admin**: `admin` / `admin123`
- **Shop staff**: `staff` / `staff123`
- 10 ingredients, 5 products with BOM, 7 stock movements

### 6. Start Server

```bash
npm run dev    # development (auto-reload)
npm start      # production
```

Server runs at `http://localhost:4000`

---

## Authentication Flow

### Super Admin Login (no shop code)

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "super123"}'
```

**JWT Payload:**
```json
{
  "id": 1,
  "username": "superadmin",
  "role": "SUPER_ADMIN"
}
```

### Shop User Login (with shop code)

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"shopCode": "DEMO", "username": "admin", "password": "admin123"}'
```

**JWT Payload:**
```json
{
  "id": 1,
  "username": "admin",
  "role": "ADMIN",
  "shopCode": "DEMO",
  "shopId": 1,
  "userDb": "shop_demo_users",
  "appDb": "shop_demo_app"
}
```

The `userDb` and `appDb` are used by the auth middleware to dynamically connect to the correct shop databases.

---

## Super Admin Dashboard APIs

All require `SUPER_ADMIN` JWT token.

```bash
SA_TOKEN="<super_admin_token>"

# System overview metrics
curl http://localhost:4000/api/superadmin/overview \
  -H "Authorization: Bearer $SA_TOKEN"

# List all shops
curl http://localhost:4000/api/superadmin/shops \
  -H "Authorization: Bearer $SA_TOKEN"

# Create a new shop (auto-provisions databases)
curl -X POST http://localhost:4000/api/superadmin/shops \
  -H "Authorization: Bearer $SA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shopCode": "BRANCH02",
    "shopName": "Branch 02 - Silom",
    "adminUsername": "admin",
    "adminPassword": "admin123"
  }'

# Get shop usage statistics
curl http://localhost:4000/api/superadmin/shops/1/stats \
  -H "Authorization: Bearer $SA_TOKEN"

# View shop users
curl http://localhost:4000/api/superadmin/shops/1/users \
  -H "Authorization: Bearer $SA_TOKEN"

# Disable a shop
curl -X POST http://localhost:4000/api/superadmin/shops/1/disable \
  -H "Authorization: Bearer $SA_TOKEN"

# Enable a shop
curl -X POST http://localhost:4000/api/superadmin/shops/1/enable \
  -H "Authorization: Bearer $SA_TOKEN"

# Reset shop admin password
curl -X POST http://localhost:4000/api/superadmin/shops/1/reset-admin \
  -H "Authorization: Bearer $SA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "newpassword123"}'

# Update shop details
curl -X PUT http://localhost:4000/api/superadmin/shops/1 \
  -H "Authorization: Bearer $SA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shopName": "Demo Bakery - Updated"}'

# Delete a shop
curl -X DELETE http://localhost:4000/api/superadmin/shops/1 \
  -H "Authorization: Bearer $SA_TOKEN"
```

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/shops` | List active shops (for login dropdown) |
| POST | `/api/auth/login` | Login (shopCode optional for super admin) |

### Protected (require `Authorization: Bearer <token>`)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/me` | Any | Current user info |
| GET | `/api/auth/users` | ADMIN | List shop users |
| POST | `/api/auth/users` | ADMIN | Create user |
| DELETE | `/api/auth/users/:id` | ADMIN | Delete user |

### Super Admin Only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/overview` | System metrics |
| GET | `/api/superadmin/shops` | List all shops |
| GET | `/api/superadmin/shops/:id` | Get shop by ID |
| POST | `/api/superadmin/shops` | Create shop (auto-provision) |
| PUT | `/api/superadmin/shops/:id` | Update shop |
| DELETE | `/api/superadmin/shops/:id` | Delete shop |
| POST | `/api/superadmin/shops/:id/enable` | Enable shop |
| POST | `/api/superadmin/shops/:id/disable` | Disable shop |
| POST | `/api/superadmin/shops/:id/reset-admin` | Reset admin password |
| GET | `/api/superadmin/shops/:id/stats` | Shop usage stats |
| GET | `/api/superadmin/shops/:id/users` | Shop user list |

### Shop Data (ADMIN + STAFF)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ingredients` | List (?search, ?unit, ?page, ?limit) |
| GET | `/api/ingredients/low-stock` | Low stock alerts |
| GET/POST/PUT/DELETE | `/api/ingredients/:id` | CRUD |
| GET | `/api/products` | List (?search) |
| GET/POST/PUT/DELETE | `/api/products/:id` | CRUD with BOM |
| GET | `/api/stock/movements` | List (?type, ?ingredientId, ?startDate, ?endDate) |
| POST | `/api/stock/adjust` | Manual adjustment |
| GET/POST | `/api/purchases` | List / Create |
| POST | `/api/purchases/upload-receipt` | Upload receipt |
| GET | `/api/sales/imports` | List imports |
| POST | `/api/sales/parse-csv` | Parse CSV |
| POST | `/api/sales/import` | Confirm import |
| GET | `/api/reports/dashboard` | Dashboard stats |
| GET | `/api/reports/net-profit` | Profit report |
| GET | `/api/reports/low-stock` | Low stock alerts |

---

## How 3-Tier Multi-Tenancy Works

```
Request Flow:

  SUPER_ADMIN login (no shopCode):
    -> System DB -> verify system_users -> JWT { role: SUPER_ADMIN }

  Shop user login (with shopCode):
    -> System DB -> find shop (get userDbName, appDbName)
    -> Shop User DB -> verify shop_users -> JWT { role, userDb, appDb }

  Protected shop request:
    -> JWT -> auth middleware
      -> getShopUserPrisma(userDb)  -> req.shopUserPrisma
      -> getShopAppPrisma(appDb)    -> req.shopAppPrisma
    -> Controller -> Service(prisma, ...) -> Shop App DB
```

1. **System DB** holds the shop registry and super admin accounts.
2. **Shop User DB** holds each shop's users and credentials (isolated per shop).
3. **Shop App DB** holds each shop's inventory data (isolated per shop).
4. **Dynamic connection** -- Prisma clients are created on-demand and cached in memory per database.
5. **Auto-provisioning** -- Creating a shop via the super admin API automatically creates both databases, runs migrations, and seeds a default admin user.

---

## Prisma Studio

```bash
npm run prisma:studio:system       # system_users, shops
npm run prisma:studio:shop-user    # shop_users (demo)
npm run prisma:studio:shop-app     # inventory data (demo)
```
