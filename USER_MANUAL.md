# Multi-Shop Stock Management System -- User Manual

---

## 1. System Overview

The Multi-Shop Stock Management System is a web-based platform designed for businesses that operate one or more shops or branches. Each shop has its own private workspace for managing ingredients, products, recipes, purchases, sales, and reports. All data is kept fully isolated between shops for security and privacy.

The system is built for food-related businesses such as bakeries, restaurants, cafes, and cloud kitchens, but can be adapted to any business that tracks raw materials, finished products, and sales.

**Key capabilities:**

- Manage multiple shops from a single platform
- Track ingredient stock levels in real time
- Define product recipes (Bill of Materials) to link products with ingredients
- Record purchases and automatically increase stock
- Import sales data from delivery platforms (Grab, LINE MAN) via CSV files
- Automatically calculate remaining stock based on recipes and sales
- Generate net profit reports with revenue and cost-of-goods breakdowns
- Receive low-stock alerts when ingredients fall below a defined threshold
- Role-based access so each user sees only what they need

---

## 2. User Roles and Permissions

The system has three user roles, each with different levels of access.

### Super Admin

The Super Admin is the platform owner or operator. This role manages the entire platform, not any individual shop.

| Capability | Access |
|---|---|
| View platform overview (total shops, active/disabled counts) | Yes |
| Create new shops (with automatic setup) | Yes |
| Edit or delete shops | Yes |
| Enable or disable a shop | Yes |
| Reset a shop's admin password | Yes |
| View usage statistics for any shop | Yes |
| View user lists for any shop | Yes |
| Access shop-level data (ingredients, products, sales) | No |

### Shop Admin

Each shop has at least one Admin. The Shop Admin manages the shop's daily operations and its user accounts.

| Capability | Access |
|---|---|
| View the shop dashboard (stock value, today's sales, product/ingredient counts) | Yes |
| Manage ingredients (add, edit, delete) | Yes |
| Manage products and recipes (add, edit, delete) | Yes |
| Record purchases (manual entry or receipt upload) | Yes |
| Import sales from CSV files | Yes |
| View stock history and make manual stock adjustments | Yes |
| View net profit reports and low-stock alerts | Yes |
| Create, view, and delete user accounts within the shop | Yes |

### Staff

Staff users are everyday operators who work within a single shop. They can perform all operational tasks but cannot manage other user accounts.

| Capability | Access |
|---|---|
| View the shop dashboard | Yes |
| Manage ingredients | Yes |
| Manage products and recipes | Yes |
| Record purchases | Yes |
| Import sales from CSV files | Yes |
| View stock history and make manual stock adjustments | Yes |
| View net profit reports and low-stock alerts | Yes |
| Manage user accounts | No |

---

## 3. Login and Shop Selection Flow

### Shop User Login (Admin / Staff)

1. Open the system in your web browser.
2. On the login page, select the **Shop Login** tab.
3. Choose your shop from the **Shop** dropdown. Only active shops appear in this list.
4. Enter your **Username** and **Password**.
5. Click **Sign In**.
6. You will be taken to your shop's dashboard.

### Super Admin Login

1. Open the system in your web browser.
2. On the login page, select the **Platform Admin** tab.
3. Enter your **Username** and **Password** (no shop selection needed).
4. Click **Sign In**.
5. You will be taken to the platform overview dashboard.

### Signing Out

Click the **Sign Out** button in the top-right corner of the header (desktop) or at the bottom of the sidebar menu (mobile). You will be returned to the login page.

---

## 4. Shop Management (Super Admin)

The Super Admin can manage all shops on the platform from the **Shop Management** page.

### Viewing Shops

- Navigate to **Shop Management** in the sidebar.
- All shops are listed in a table showing the shop code, shop name, status (active/disabled), and creation date.
- Use the search bar to filter shops by name or code.
- Use the status filter to show only active or disabled shops.

### Creating a New Shop

1. Click the **Create Shop** button.
2. Fill in the required fields:
   - **Shop Code** -- A unique identifier (e.g., `BK001`). Only letters, numbers, hyphens, and underscores are allowed.
   - **Shop Name** -- The display name for the shop (e.g., "Downtown Bakery").
   - **Admin Username** -- The username for the shop's first admin account (defaults to `admin`).
   - **Admin Password** -- The password for the shop's first admin account (defaults to `admin123`).
3. Click **Create Shop**.
4. The system will automatically set up the shop's private databases, create the initial admin account, and make the shop available for login.

### Editing a Shop

1. Click the edit icon next to the shop you want to modify.
2. Update the shop name or shop code.
3. Click **Save Changes**.

### Enabling or Disabling a Shop

- To **disable** a shop, click the toggle/status icon. Disabled shops will not appear in the login dropdown, and their users will not be able to sign in.
- To **re-enable** a shop, click the toggle/status icon again.

### Resetting a Shop Admin Password

1. Click the key/reset icon next to the shop.
2. Enter the admin username and new password (or leave the defaults).
3. Click **Reset Password**.
4. If the admin account does not exist, it will be created automatically.

### Viewing Shop Statistics

1. Click the statistics/chart icon next to the shop.
2. A dialog will show the shop's usage data:
   - Number of users (total and active)
   - Number of products and ingredients
   - Number of sales records and purchases

### Deleting a Shop

1. Click the delete icon next to the shop.
2. Confirm the deletion. Note: this removes the shop record from the platform registry. The shop's databases are not automatically dropped.

---

## 5. User Management (per Shop)

Shop Admins can manage user accounts for their own shop.

### Viewing Users

- Navigate to **User Management** in the sidebar (visible only to Admin users).
- All users in your shop are listed with their username, role, status, and creation date.

### Creating a New User

1. Click the **Create User** button (or use the form at the top of the page).
2. Enter a **Username** (must be unique within the shop).
3. Enter a **Password** (minimum 6 characters).
4. Select a **Role**: Admin or Staff.
5. Click **Create User**.

### Deleting a User

1. Click the delete icon next to the user you want to remove.
2. Confirm the deletion.
3. Note: You cannot delete your own account.

---

## 6. Master Ingredients

Ingredients are the raw materials used to make your products. Managing them is the foundation of the stock tracking system.

### Viewing Ingredients

- Navigate to **Ingredients** in the sidebar.
- All ingredients are listed with their name, category, unit, cost per unit, current stock level, and low-stock threshold.
- Use the search bar to find ingredients by name.
- Use the unit filter to show only ingredients measured in a specific unit (kg, g, pcs, L, mL).

### Adding an Ingredient

1. Click the **Add Ingredient** button.
2. Fill in the details:
   - **Name** -- e.g., "All-Purpose Flour"
   - **Category** -- optional grouping (e.g., "Dry Goods")
   - **Unit** -- the measurement unit (kg, g, pcs, L, or mL)
   - **Cost per Unit** -- how much one unit costs to purchase
   - **Current Stock** -- the starting stock quantity (optional, defaults to 0)
   - **Low Stock Threshold** -- the system will alert you when stock falls below this number (defaults to 10)
   - **Supplier** -- optional supplier name
3. Click **Save**.

### Editing an Ingredient

1. Click on the ingredient you want to edit.
2. Update any of its fields.
3. Click **Save**.

### Deleting an Ingredient

1. Click the delete icon on the ingredient row.
2. Confirm the deletion.
3. Note: Deleting an ingredient will also remove it from any product recipes and delete its stock movement history.

---

## 7. BOM (Recipe / Bill of Materials)

The Bill of Materials (BOM) defines which ingredients and how much of each are needed to make one unit of a product. This is how the system knows how much stock to deduct when a sale is recorded.

### Viewing a Product's Recipe

- Navigate to **Products & BOM** in the sidebar.
- Each product displays its name, selling price, and its recipe breakdown (which ingredients and quantities).

### Creating a Product with a Recipe

1. Click **Add Product**.
2. Enter the **Product Name** (e.g., "Chocolate Croissant").
3. Enter the **Selling Price** (the price at which you sell one unit).
4. In the BOM section, add one or more ingredients:
   - Select an **Ingredient** from the dropdown.
   - Enter the **Quantity** needed per unit of the product.
5. Click **Save**.

### Editing a Recipe

1. Click on the product you want to edit.
2. You can change the name, selling price, or modify the ingredient list.
3. Click **Save**. The old recipe will be replaced with the new one.

### How Recipes Affect Stock

When a sale is recorded (via CSV import), the system automatically:

1. Looks up the product's BOM.
2. Multiplies each ingredient quantity by the number of units sold.
3. Deducts that amount from the ingredient's current stock.
4. Records a stock movement entry of type "Sale".

**Example:** If a Chocolate Croissant uses 0.1 kg of flour and 0.05 kg of chocolate, selling 10 croissants will deduct 1 kg of flour and 0.5 kg of chocolate.

---

## 8. Stock Management

### Overview

Stock levels are updated automatically whenever a purchase is recorded or a sale is imported. You can also make manual adjustments if needed (e.g., for spoilage, waste, or corrections).

### Recording a Purchase (Manual Entry)

1. Navigate to the purchase entry area.
2. Select the date of the purchase (defaults to today).
3. For each item purchased:
   - Select the **Ingredient** from the dropdown.
   - Enter the **Quantity** purchased.
   - Enter the **Price** paid.
   - Optionally enter the **Item Name** as it appeared on the receipt.
4. Add a note if needed.
5. Click **Save**.

The system will:
- Create a purchase record.
- Increase the current stock of each ingredient by the quantity purchased.
- Record a stock movement entry of type "Purchase".

### Receipt Upload (AI OCR)

1. Navigate to the receipt upload area (**Scan Receipt** in the sidebar).
2. Upload a photo or scan of the purchase receipt.
3. The system will store the image for reference.
4. Currently, item details need to be entered manually after the upload. AI-powered OCR for automatic item extraction is planned for a future release.

### Manual Stock Adjustment

1. Navigate to **Stock History** in the sidebar.
2. Click **Adjust Stock** (or use the adjustment form).
3. Select the **Ingredient**.
4. Enter a positive number to add stock, or a negative number to deduct stock.
5. Add a note explaining the reason (e.g., "Damaged during delivery", "Inventory count correction").
6. Click **Save**.

### Viewing Stock History

- Navigate to **Stock History** in the sidebar.
- All stock movements are listed in chronological order (newest first).
- Each entry shows the ingredient name, movement type (Purchase, Sale, or Adjustment), the quantity change, an optional note, and the date.
- Use the filters to narrow the list by:
  - Movement type (Purchase, Sale, Adjustment)
  - Ingredient
  - Date range
  - Search keyword

---

## 9. Sales Import (Grab / LINE MAN via CSV)

The system supports importing sales data from delivery platforms and point-of-sale systems via CSV files.

### Importing Sales

1. Navigate to **Import Sales** in the sidebar.
2. Upload a CSV file. The file should contain columns for:
   - **Product name** (the name as it appears on the platform)
   - **Quantity** sold
   - **Date** of the sale
3. The system will parse the CSV and display the rows for review.
4. For each row, map the product name from the CSV to the corresponding product in the system.
5. Confirm the import.

### What Happens During Import

For each sales row, the system:

1. Creates a sales record with the product name, quantity, date, and revenue (quantity x selling price).
2. Calculates the cost of goods sold using the product's BOM.
3. Deducts ingredient stock based on the BOM and quantity sold.
4. Records stock movement entries of type "Sale".

### Viewing Past Imports

- The import history is listed on the Import Sales page, showing the file name, source (Grab, LINE MAN, Manual), number of rows, and the import date.

---

## 10. Remaining Stock Calculation

The system calculates remaining stock automatically. You do not need to count stock manually unless you want to verify or correct it.

### How It Works

- **Starting stock** is set when an ingredient is first created.
- **Purchases** increase the stock by the purchased quantity.
- **Sales** decrease the stock based on the product's BOM and the quantity sold.
- **Manual adjustments** increase or decrease the stock by the entered amount.

The formula is:

**Current Stock = Starting Stock + Total Purchases - Total Sales Deductions + Total Adjustments**

### Low-Stock Alerts

- Each ingredient has a configurable **Low Stock Threshold**.
- When the current stock falls at or below the threshold, the ingredient appears in the **Low Stock Alerts** section of the dashboard and reports.
- This helps you reorder ingredients before running out.

---

## 11. Net Profit and Reports

### Shop Dashboard

The main dashboard (home page) shows at-a-glance metrics:

- **Total Products** -- the number of products defined in the system
- **Total Ingredients** -- the number of ingredients defined in the system
- **Current Stock Value** -- the total value of all ingredients in stock (quantity x cost per unit)
- **Today's Sales** -- total revenue from sales recorded for today

### Net Profit Report

1. Navigate to the reports section or use the dashboard link.
2. Select a **date range** (start date and end date).
3. Choose to group results by **day** or **month**.
4. The report displays:
   - **Revenue** -- total selling price of products sold
   - **Cost of Goods Sold** -- total ingredient cost based on BOM
   - **Net Profit** -- Revenue minus Cost of Goods Sold
5. A summary row shows the totals for the entire selected period.

### Low-Stock Alerts Report

- View all ingredients that are at or below their low-stock threshold.
- Each entry shows the ingredient name, unit, current stock, threshold, and cost per unit.

---

## 12. Super Admin Dashboard

The Super Admin has a dedicated platform overview dashboard showing:

- **Total Shops** -- the number of shops registered on the platform
- **Active Shops** -- shops that are currently enabled and can be used
- **Disabled Shops** -- shops that have been temporarily disabled
- **Total Super Admins** -- the number of platform administrator accounts

This overview helps the platform operator monitor the health and growth of the system at a glance.

From the Super Admin dashboard, you can navigate to **Shop Management** to take action on individual shops.

---

## 13. FAQ

**Q: Can one user account access multiple shops?**
A: No. Each user account belongs to a single shop. If a person needs access to multiple shops, they will need a separate account in each shop.

**Q: What happens if a shop is disabled?**
A: The shop will no longer appear in the login dropdown. Users of that shop will not be able to sign in. All data is preserved, and the shop can be re-enabled at any time.

**Q: Can I change my password?**
A: Shop Admins can manage user accounts. If you need a password reset, ask your shop's Admin. If the shop Admin's password is lost, the Super Admin can reset it from the platform management panel.

**Q: Is my shop's data visible to other shops?**
A: No. Each shop has its own private database. No other shop can see your ingredients, products, recipes, stock, or sales data.

**Q: Can I undo a sales import?**
A: Currently, imported sales records are permanent. Ensure the CSV data is correct before confirming the import. If a mistake is made, you can use manual stock adjustments to correct ingredient quantities.

**Q: What CSV format is required for sales import?**
A: The CSV file should include columns for product name, quantity, and date. The column names can be: `product_name` (or `productName` or `name`), `quantity` (or `qty`), and `date`. The first row must be the column header.

**Q: Can the Super Admin view a shop's actual data (ingredients, products, sales)?**
A: The Super Admin can view summary statistics (counts of products, ingredients, sales records, purchases) and user lists. However, the Super Admin cannot browse or edit the shop's actual business data. This is by design for data privacy.

**Q: What units of measurement are supported for ingredients?**
A: The system supports: kg (kilograms), g (grams), pcs (pieces), L (liters), and mL (milliliters).

**Q: How is cost of goods sold (COGS) calculated?**
A: For each product sold, the system multiplies the ingredient quantities defined in the recipe (BOM) by the ingredient's cost per unit, then multiplies by the number of units sold. The total COGS is the sum across all ingredients.

---

## 14. Key Benefits / System Highlights

- **Multi-shop support** -- Manage any number of shops from a single platform. Each shop operates independently with its own data.

- **Complete data isolation** -- Each shop's data is stored in a separate database, ensuring security and privacy between shops.

- **Role-based access control** -- Three levels of access (Super Admin, Admin, Staff) ensure that each user sees only what they need.

- **Automatic stock tracking** -- Stock levels update automatically when purchases are recorded or sales are imported. No manual counting required for day-to-day operations.

- **Recipe-based cost calculation** -- Define recipes (BOM) once, and the system automatically calculates ingredient usage, cost of goods sold, and net profit for every sale.

- **Delivery platform integration** -- Import sales data directly from Grab, LINE MAN, or any source that exports CSV files.

- **Real-time low-stock alerts** -- Get notified when any ingredient drops below its reorder threshold so you never run out unexpectedly.

- **Self-service shop setup** -- The Super Admin can create a new shop in seconds. The system automatically provisions the shop's databases, runs setup, and creates the first admin account.

- **Web-based access** -- Use the system from any device with a web browser. The interface is responsive and works on both desktop and mobile.

- **Detailed reporting** -- Track revenue, cost of goods sold, and net profit over any date range, grouped by day or month.
