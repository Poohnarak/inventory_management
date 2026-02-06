-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'g', 'pcs', 'L', 'mL')),
  cost_per_unit DECIMAL(10, 4) NOT NULL DEFAULT 0,
  current_stock DECIMAL(12, 4) NOT NULL DEFAULT 0,
  low_stock_threshold DECIMAL(12, 4) NOT NULL DEFAULT 10,
  supplier VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bill of Materials (BOM) - maps products to ingredients
CREATE TABLE IF NOT EXISTS bom_items (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(12, 4) NOT NULL,
  UNIQUE(product_id, ingredient_id)
);

-- Stock movements (purchase, sale, adjustment)
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE SET NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Purchase', 'Sale', 'Adjustment')),
  item_name VARCHAR(255) NOT NULL,
  quantity_change DECIMAL(12, 4) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases (receipt-level records)
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  receipt_image_url TEXT,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase items (line items per purchase)
CREATE TABLE IF NOT EXISTS purchase_items (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  raw_item_name VARCHAR(255),
  quantity DECIMAL(12, 4) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- Sales imports (CSV-level records)
CREATE TABLE IF NOT EXISTS sales_imports (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255),
  record_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales records (individual sold items)
CREATE TABLE IF NOT EXISTS sales_records (
  id SERIAL PRIMARY KEY,
  sales_import_id INTEGER REFERENCES sales_imports(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  sale_date DATE NOT NULL,
  revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial ingredients
INSERT INTO ingredients (name, unit, cost_per_unit, current_stock, low_stock_threshold) VALUES
  ('Flour', 'kg', 2.5, 50, 10),
  ('Sugar', 'kg', 3.0, 30, 10),
  ('Butter', 'kg', 8.0, 15, 5),
  ('Eggs', 'pcs', 0.3, 200, 50),
  ('Milk', 'L', 1.5, 40, 10),
  ('Vanilla Extract', 'mL', 0.15, 500, 100),
  ('Baking Powder', 'g', 0.02, 1000, 200),
  ('Cocoa Powder', 'g', 0.05, 800, 200),
  ('Salt', 'g', 0.01, 2000, 500),
  ('Cream', 'L', 4.0, 20, 5)
ON CONFLICT DO NOTHING;

-- Seed initial products
INSERT INTO products (name, selling_price) VALUES
  ('Chocolate Cake', 25.00),
  ('Vanilla Cupcakes (12pcs)', 18.00),
  ('Butter Cookies (20pcs)', 12.00),
  ('Croissant', 4.50),
  ('Cream Puffs (6pcs)', 15.00)
ON CONFLICT DO NOTHING;

-- Seed BOM items (product_id, ingredient_id, quantity)
-- Chocolate Cake
INSERT INTO bom_items (product_id, ingredient_id, quantity) VALUES
  (1, 1, 0.5), (1, 2, 0.3), (1, 3, 0.25), (1, 4, 4), (1, 8, 50)
ON CONFLICT DO NOTHING;

-- Vanilla Cupcakes
INSERT INTO bom_items (product_id, ingredient_id, quantity) VALUES
  (2, 1, 0.3), (2, 2, 0.2), (2, 3, 0.15), (2, 4, 3), (2, 6, 10)
ON CONFLICT DO NOTHING;

-- Butter Cookies
INSERT INTO bom_items (product_id, ingredient_id, quantity) VALUES
  (3, 1, 0.25), (3, 2, 0.15), (3, 3, 0.2), (3, 4, 2)
ON CONFLICT DO NOTHING;

-- Croissant
INSERT INTO bom_items (product_id, ingredient_id, quantity) VALUES
  (4, 1, 0.1), (4, 3, 0.08), (4, 5, 0.05), (4, 4, 1)
ON CONFLICT DO NOTHING;

-- Cream Puffs
INSERT INTO bom_items (product_id, ingredient_id, quantity) VALUES
  (5, 1, 0.15), (5, 3, 0.1), (5, 4, 3), (5, 10, 0.2), (5, 6, 5)
ON CONFLICT DO NOTHING;

-- Seed some stock movements
INSERT INTO stock_movements (ingredient_id, type, item_name, quantity_change, created_at) VALUES
  (1, 'Purchase', 'Flour', 25, '2026-02-05'),
  (NULL, 'Sale', 'Chocolate Cake', -3, '2026-02-05'),
  (3, 'Purchase', 'Butter', 10, '2026-02-04'),
  (NULL, 'Sale', 'Vanilla Cupcakes', -5, '2026-02-04'),
  (4, 'Adjustment', 'Eggs', -12, '2026-02-04'),
  (2, 'Purchase', 'Sugar', 15, '2026-02-03'),
  (NULL, 'Sale', 'Butter Cookies', -8, '2026-02-03'),
  (10, 'Purchase', 'Cream', 10, '2026-02-02'),
  (NULL, 'Sale', 'Croissant', -20, '2026-02-02'),
  (5, 'Adjustment', 'Milk', -5, '2026-02-01'),
  (8, 'Purchase', 'Cocoa Powder', 500, '2026-02-01'),
  (NULL, 'Sale', 'Cream Puffs', -4, '2026-01-31')
ON CONFLICT DO NOTHING;
