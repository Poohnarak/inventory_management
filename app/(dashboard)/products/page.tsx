"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  mockProducts,
  mockIngredients,
  type Product,
  type BOMItem,
} from "@/lib/mock-data"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [expandedProducts, setExpandedProducts] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    sellingPrice: "",
    bom: [] as BOMItem[],
  })

  const [newBomItem, setNewBomItem] = useState({
    ingredientId: "",
    quantity: "",
  })

  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const getIngredientName = (id: string) => {
    return mockIngredients.find((ing) => ing.id === id)?.name || "Unknown"
  }

  const getIngredientUnit = (id: string) => {
    return mockIngredients.find((ing) => ing.id === id)?.unit || ""
  }

  const handleAdd = () => {
    setFormData({ name: "", sellingPrice: "", bom: [] })
    setNewBomItem({ ingredientId: "", quantity: "" })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      sellingPrice: product.sellingPrice.toString(),
      bom: [...product.bom],
    })
    setNewBomItem({ ingredientId: "", quantity: "" })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleAddBomItem = () => {
    if (newBomItem.ingredientId && newBomItem.quantity) {
      setFormData({
        ...formData,
        bom: [
          ...formData.bom,
          {
            ingredientId: newBomItem.ingredientId,
            quantity: parseFloat(newBomItem.quantity) || 0,
          },
        ],
      })
      setNewBomItem({ ingredientId: "", quantity: "" })
    }
  }

  const handleRemoveBomItem = (index: number) => {
    setFormData({
      ...formData,
      bom: formData.bom.filter((_, i) => i !== index),
    })
  }

  const handleSubmitAdd = () => {
    setIsLoading(true)
    setTimeout(() => {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        bom: formData.bom,
      }
      setProducts([...products, newProduct])
      setIsAddDialogOpen(false)
      setIsLoading(false)
    }, 500)
  }

  const handleSubmitEdit = () => {
    if (!selectedProduct) return
    setIsLoading(true)
    setTimeout(() => {
      setProducts(
        products.map((p) =>
          p.id === selectedProduct.id
            ? {
                ...p,
                name: formData.name,
                sellingPrice: parseFloat(formData.sellingPrice) || 0,
                bom: formData.bom,
              }
            : p
        )
      )
      setIsEditDialogOpen(false)
      setIsLoading(false)
    }, 500)
  }

  const handleConfirmDelete = () => {
    if (!selectedProduct) return
    setIsLoading(true)
    setTimeout(() => {
      setProducts(products.filter((p) => p.id !== selectedProduct.id))
      setIsDeleteDialogOpen(false)
      setIsLoading(false)
    }, 500)
  }

  const ProductFormContent = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="product-name">Product Name</Label>
        <Input
          id="product-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter product name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="selling-price">Selling Price ($)</Label>
        <Input
          id="selling-price"
          type="number"
          step="0.01"
          value={formData.sellingPrice}
          onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
          placeholder="0.00"
        />
      </div>

      {/* BOM Section */}
      <div className="space-y-3">
        <Label>Bill of Materials (BOM)</Label>
        
        {formData.bom.length > 0 && (
          <div className="space-y-2">
            {formData.bom.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-muted rounded-lg"
              >
                <span className="flex-1 text-sm">
                  {getIngredientName(item.ingredientId)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {item.quantity} {getIngredientUnit(item.ingredientId)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveBomItem(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Select
            value={newBomItem.ingredientId}
            onValueChange={(value) =>
              setNewBomItem({ ...newBomItem, ingredientId: value })
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select ingredient" />
            </SelectTrigger>
            <SelectContent>
              {mockIngredients.map((ing) => (
                <SelectItem key={ing.id} value={ing.id}>
                  {ing.name} ({ing.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            step="0.01"
            placeholder="Qty"
            className="w-24"
            value={newBomItem.quantity}
            onChange={(e) =>
              setNewBomItem({ ...newBomItem, quantity: e.target.value })
            }
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddBomItem}
            disabled={!newBomItem.ingredientId || !newBomItem.quantity}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Products & BOM"
        description="Manage products and their bill of materials"
        action={
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      {/* Product List */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No products yet</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Collapsible
              key={product.id}
              open={expandedProducts.includes(product.id)}
              onOpenChange={() => toggleExpand(product.id)}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {expandedProducts.includes(product.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <div>
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          ${product.sellingPrice.toFixed(2)} | {product.bom.length} ingredients
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-medium mb-3">Bill of Materials</p>
                      {product.bom.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No ingredients added</p>
                      ) : (
                        <div className="space-y-2">
                          {product.bom.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg"
                            >
                              <span className="text-sm">{getIngredientName(item.ingredientId)}</span>
                              <span className="text-sm text-muted-foreground">
                                {item.quantity} {getIngredientUnit(item.ingredientId)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductFormContent />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd} disabled={isLoading || !formData.name}>
              {isLoading ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductFormContent />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isLoading || !formData.name}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{selectedProduct?.name}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
