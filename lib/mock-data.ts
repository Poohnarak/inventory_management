// Mock data for the inventory management system

export interface Ingredient {
  id: string
  name: string
  unit: "kg" | "g" | "pcs" | "L" | "mL"
  costPerUnit: number
  currentStock: number
}

export interface Product {
  id: string
  name: string
  sellingPrice: number
  bom: BOMItem[]
}

export interface BOMItem {
  ingredientId: string
  quantity: number
}

export interface StockMovement {
  id: string
  date: string
  type: "Purchase" | "Sale" | "Adjustment"
  itemName: string
  quantityChange: number
}

export interface ReceiptItem {
  id: string
  rawItemName: string
  ingredientId: string
  quantity: number
  price: number
}

export const mockIngredients: Ingredient[] = [
  { id: "1", name: "Flour", unit: "kg", costPerUnit: 2.5, currentStock: 50 },
  { id: "2", name: "Sugar", unit: "kg", costPerUnit: 3.0, currentStock: 30 },
  { id: "3", name: "Butter", unit: "kg", costPerUnit: 8.0, currentStock: 15 },
  { id: "4", name: "Eggs", unit: "pcs", costPerUnit: 0.3, currentStock: 200 },
  { id: "5", name: "Milk", unit: "L", costPerUnit: 1.5, currentStock: 40 },
  { id: "6", name: "Vanilla Extract", unit: "mL", costPerUnit: 0.15, currentStock: 500 },
  { id: "7", name: "Baking Powder", unit: "g", costPerUnit: 0.02, currentStock: 1000 },
  { id: "8", name: "Cocoa Powder", unit: "g", costPerUnit: 0.05, currentStock: 800 },
  { id: "9", name: "Salt", unit: "g", costPerUnit: 0.01, currentStock: 2000 },
  { id: "10", name: "Cream", unit: "L", costPerUnit: 4.0, currentStock: 20 },
]

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Chocolate Cake",
    sellingPrice: 25.0,
    bom: [
      { ingredientId: "1", quantity: 0.5 },
      { ingredientId: "2", quantity: 0.3 },
      { ingredientId: "3", quantity: 0.25 },
      { ingredientId: "4", quantity: 4 },
      { ingredientId: "8", quantity: 50 },
    ],
  },
  {
    id: "2",
    name: "Vanilla Cupcakes (12pcs)",
    sellingPrice: 18.0,
    bom: [
      { ingredientId: "1", quantity: 0.3 },
      { ingredientId: "2", quantity: 0.2 },
      { ingredientId: "3", quantity: 0.15 },
      { ingredientId: "4", quantity: 3 },
      { ingredientId: "6", quantity: 10 },
    ],
  },
  {
    id: "3",
    name: "Butter Cookies (20pcs)",
    sellingPrice: 12.0,
    bom: [
      { ingredientId: "1", quantity: 0.25 },
      { ingredientId: "2", quantity: 0.15 },
      { ingredientId: "3", quantity: 0.2 },
      { ingredientId: "4", quantity: 2 },
    ],
  },
  {
    id: "4",
    name: "Croissant",
    sellingPrice: 4.5,
    bom: [
      { ingredientId: "1", quantity: 0.1 },
      { ingredientId: "3", quantity: 0.08 },
      { ingredientId: "5", quantity: 0.05 },
      { ingredientId: "4", quantity: 1 },
    ],
  },
  {
    id: "5",
    name: "Cream Puffs (6pcs)",
    sellingPrice: 15.0,
    bom: [
      { ingredientId: "1", quantity: 0.15 },
      { ingredientId: "3", quantity: 0.1 },
      { ingredientId: "4", quantity: 3 },
      { ingredientId: "10", quantity: 0.2 },
      { ingredientId: "6", quantity: 5 },
    ],
  },
]

export const mockStockMovements: StockMovement[] = [
  { id: "1", date: "2026-02-05", type: "Purchase", itemName: "Flour", quantityChange: 25 },
  { id: "2", date: "2026-02-05", type: "Sale", itemName: "Chocolate Cake", quantityChange: -3 },
  { id: "3", date: "2026-02-04", type: "Purchase", itemName: "Butter", quantityChange: 10 },
  { id: "4", date: "2026-02-04", type: "Sale", itemName: "Vanilla Cupcakes", quantityChange: -5 },
  { id: "5", date: "2026-02-04", type: "Adjustment", itemName: "Eggs", quantityChange: -12 },
  { id: "6", date: "2026-02-03", type: "Purchase", itemName: "Sugar", quantityChange: 15 },
  { id: "7", date: "2026-02-03", type: "Sale", itemName: "Butter Cookies", quantityChange: -8 },
  { id: "8", date: "2026-02-02", type: "Purchase", itemName: "Cream", quantityChange: 10 },
  { id: "9", date: "2026-02-02", type: "Sale", itemName: "Croissant", quantityChange: -20 },
  { id: "10", date: "2026-02-01", type: "Adjustment", itemName: "Milk", quantityChange: -5 },
  { id: "11", date: "2026-02-01", type: "Purchase", itemName: "Cocoa Powder", quantityChange: 500 },
  { id: "12", date: "2026-01-31", type: "Sale", itemName: "Cream Puffs", quantityChange: -4 },
]

export const mockReceiptItems: ReceiptItem[] = [
  { id: "1", rawItemName: "FLOUR 25KG", ingredientId: "1", quantity: 25, price: 62.5 },
  { id: "2", rawItemName: "SUGAR WHITE", ingredientId: "2", quantity: 10, price: 30.0 },
  { id: "3", rawItemName: "BUTTER UNSALTED", ingredientId: "3", quantity: 5, price: 40.0 },
]

// Dashboard statistics
export const dashboardStats = {
  totalProducts: mockProducts.length,
  totalIngredients: mockIngredients.length,
  currentStockValue: mockIngredients.reduce(
    (sum, ing) => sum + ing.costPerUnit * ing.currentStock,
    0
  ),
  todaySales: 342.5,
}
