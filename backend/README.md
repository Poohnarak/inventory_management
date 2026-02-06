# Inventory Management Backend

REST API for the restaurant/shop inventory management system.

## Tech Stack

- Node.js + Express.js
- PostgreSQL (via Docker)
- Prisma ORM
- JWT Authentication
- Multer (receipt image upload, OCR-ready)
- CSV import support (csv-parse)

## Setup Instructions (macOS)

### 1. Prerequisites

```bash
# Install Node.js LTS (if not installed)
brew install node

# Install Docker Desktop (if not installed)
brew install --cask docker
```

### 2. Start PostgreSQL

```bash
cd backend/docker
docker compose up -d
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work with Docker setup)
```

### 5. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 6. Seed the Database

```bash
npm run seed
```

### 7. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:4000`

### 8. View Database (optional)

```bash
npx prisma studio
```

Opens a web UI at `http://localhost:5555`

---

## API Endpoints

### Authentication

| Method | Endpoint         | Description       |
|--------|------------------|-------------------|
| POST   | /api/auth/register | Register new user |
| POST   | /api/auth/login    | Login, get JWT    |
| GET    | /api/auth/me       | Get current user  |

### Ingredients

| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| GET    | /api/ingredients            | List all ingredients   |
| GET    | /api/ingredients/low-stock  | Get low-stock items    |
| GET    | /api/ingredients/:id        | Get single ingredient  |
| POST   | /api/ingredients            | Create ingredient      |
| PUT    | /api/ingredients/:id        | Update ingredient      |
| DELETE | /api/ingredients/:id        | Delete ingredient      |

### Products & BOM

| Method | Endpoint            | Description            |
|--------|---------------------|------------------------|
| GET    | /api/products       | List all products+BOM  |
| GET    | /api/products/:id   | Get single product+BOM |
| POST   | /api/products       | Create product+BOM     |
| PUT    | /api/products/:id   | Update product+BOM     |
| DELETE | /api/products/:id   | Delete product         |

### Stock Movements

| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| GET    | /api/stock/movements | List stock movements   |
| GET    | /api/stock/stats     | Movement count stats   |
| POST   | /api/stock/adjust    | Manual stock adjustment|

### Purchases

| Method | Endpoint                      | Description            |
|--------|-------------------------------|------------------------|
| GET    | /api/purchases                | List purchases         |
| GET    | /api/purchases/:id            | Get single purchase    |
| POST   | /api/purchases                | Create purchase + stock|
| POST   | /api/purchases/upload-receipt | Upload receipt image   |

### Sales Import

| Method | Endpoint             | Description             |
|--------|----------------------|-------------------------|
| GET    | /api/sales/imports   | List all imports        |
| POST   | /api/sales/parse-csv | Upload & parse CSV      |
| POST   | /api/sales/import    | Confirm import + deduct |

### Reports

| Method | Endpoint                 | Description          |
|--------|--------------------------|----------------------|
| GET    | /api/reports/dashboard   | Dashboard stats      |
| GET    | /api/reports/net-profit  | Net profit report    |
| GET    | /api/reports/low-stock   | Low stock alerts     |

---

## Sample API Requests

### Register

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123","name":"Admin"}'
```

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventory.local","password":"admin123"}'
```

### List Ingredients (authenticated)

```bash
TOKEN="your-jwt-token-here"

curl http://localhost:4000/api/ingredients \
  -H "Authorization: Bearer $TOKEN"
```

### Create Ingredient

```bash
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
```

### Create Product with BOM

```bash
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
```

### Create Purchase (stock auto-increases)

```bash
curl -X POST http://localhost:4000/api/purchases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "date": "2026-02-06",
    "note": "Weekly flour restock",
    "items": [
      { "ingredientId": 1, "rawItemName": "FLOUR 25KG BAG", "quantity": 25, "price": 62.50 },
      { "ingredientId": 2, "rawItemName": "SUGAR 10KG", "quantity": 10, "price": 30.00 }
    ]
  }'
```

### Upload Receipt Image

```bash
curl -X POST http://localhost:4000/api/purchases/upload-receipt \
  -H "Authorization: Bearer $TOKEN" \
  -F "receipt=@/path/to/receipt.jpg"
```

### Import Sales (with product mappings)

```bash
curl -X POST http://localhost:4000/api/sales/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fileName": "grab-sales-feb.csv",
    "source": "Grab",
    "mappings": [
      { "productName": "Choco Cake Large", "productId": 1, "quantity": 5, "date": "2026-02-05" },
      { "productName": "Vanilla Cup 12pc", "productId": 2, "quantity": 3, "date": "2026-02-05" }
    ]
  }'
```

### Dashboard Stats

```bash
curl http://localhost:4000/api/reports/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Net Profit Report

```bash
curl "http://localhost:4000/api/reports/net-profit?startDate=2026-02-01&endDate=2026-02-28&groupBy=day" \
  -H "Authorization: Bearer $TOKEN"
```

### Manual Stock Adjustment

```bash
curl -X POST http://localhost:4000/api/stock/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "ingredientId": 4, "quantityChange": -12, "note": "Broken eggs" }'
```

---

## Project Structure

```
backend/
├── src/
│   ├── app.js                  # Express app setup
│   ├── server.js               # Server entry point
│   ├── config/
│   │   ├── db.js               # Prisma client
│   │   └── env.js              # Environment config
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── ingredient.routes.js
│   │   ├── product.routes.js
│   │   ├── stock.routes.js
│   │   ├── purchase.routes.js
│   │   ├── sales.routes.js
│   │   └── report.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── ingredient.controller.js
│   │   ├── product.controller.js
│   │   ├── stock.controller.js
│   │   ├── purchase.controller.js
│   │   ├── sales.controller.js
│   │   └── report.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── ingredient.service.js
│   │   ├── product.service.js
│   │   ├── stock.service.js
│   │   ├── purchase.service.js
│   │   ├── sales.service.js
│   │   └── report.service.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validate.middleware.js
│   └── utils/
│       └── response.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── docker/
│   └── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Default Login

After seeding, you can log in with:
- Email: `admin@inventory.local`
- Password: `admin123`
