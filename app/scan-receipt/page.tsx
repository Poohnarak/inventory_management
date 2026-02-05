"use client"

import React from "react"

import { useState, useCallback } from "react"
import {
  Camera,
  Upload,
  X,
  Check,
  Trash2,
  Plus,
  ImageIcon,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { mockIngredients, type ReceiptItem } from "@/lib/mock-data"

const initialReceiptItems: ReceiptItem[] = [
  { id: "1", rawItemName: "FLOUR 25KG BAG", ingredientId: "", quantity: 25, price: 62.5 },
  { id: "2", rawItemName: "SUGAR WHITE 10KG", ingredientId: "", quantity: 10, price: 30.0 },
  { id: "3", rawItemName: "BUTTER UNSALTED 5KG", ingredientId: "", quantity: 5, price: 40.0 },
]

export default function ScanReceiptPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmSuccess, setConfirmSuccess] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        processReceipt()
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const processReceipt = () => {
    setIsProcessing(true)
    // Simulate OCR processing
    setTimeout(() => {
      setReceiptItems(initialReceiptItems)
      setIsProcessing(false)
    }, 2000)
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    setReceiptItems([])
    setConfirmSuccess(false)
  }

  const handleUpdateItem = (
    id: string,
    field: keyof ReceiptItem,
    value: string | number
  ) => {
    setReceiptItems(
      receiptItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleDeleteItem = (id: string) => {
    setReceiptItems(receiptItems.filter((item) => item.id !== id))
  }

  const handleAddItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      rawItemName: "",
      ingredientId: "",
      quantity: 0,
      price: 0,
    }
    setReceiptItems([...receiptItems, newItem])
  }

  const handleConfirm = () => {
    setIsConfirming(true)
    // Simulate confirmation
    setTimeout(() => {
      setIsConfirming(false)
      setConfirmSuccess(true)
    }, 1500)
  }

  const allItemsMapped = receiptItems.every((item) => item.ingredientId)
  const totalAmount = receiptItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Scan Receipt"
        description="Upload a receipt image to extract purchase data"
      />

      {/* Success Message */}
      {confirmSuccess && (
        <Alert className="mb-6 border-accent bg-accent/10">
          <Check className="h-4 w-4 text-accent" />
          <AlertDescription className="text-accent">
            Receipt processed successfully! Stock has been updated.
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      {!uploadedImage && !confirmSuccess && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInputChange}
                className="hidden"
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload" className="cursor-pointer">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Take a photo or upload receipt
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports JPG, PNG, HEIC
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button type="button" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                  <Button type="button" variant="outline" className="gap-2 bg-transparent">
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing State */}
      {isProcessing && (
        <Card className="mb-6">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4" />
              <p className="text-lg font-medium mb-1">Processing Receipt</p>
              <p className="text-sm text-muted-foreground">
                Extracting items from image...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview */}
      {uploadedImage && !isProcessing && !confirmSuccess && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Receipt Image</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveImage}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[3/4] max-h-64 w-full overflow-hidden rounded-lg bg-muted">
              <ImageIcon
                src={uploadedImage || "/placeholder.svg"}
                alt="Receipt"
                className="h-full w-full object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editable Items Table */}
      {receiptItems.length > 0 && !isProcessing && !confirmSuccess && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Review Items</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receiptItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-muted/30 rounded-lg space-y-3"
                >
                  {/* Raw Item Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Receipt Item Name
                    </label>
                    <Input
                      value={item.rawItemName}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "rawItemName", e.target.value)
                      }
                      placeholder="Item name from receipt"
                    />
                  </div>

                  {/* Ingredient Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Map to Ingredient
                    </label>
                    <Select
                      value={item.ingredientId}
                      onValueChange={(value) =>
                        handleUpdateItem(item.id, "ingredientId", value)
                      }
                    >
                      <SelectTrigger>
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
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.id,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Price ($)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.id,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="font-medium">Total Amount</span>
              <span className="text-xl font-bold">${totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Button */}
      {receiptItems.length > 0 && !isProcessing && !confirmSuccess && (
        <div className="flex justify-end">
          <Button
            onClick={handleConfirm}
            disabled={!allItemsMapped || isConfirming}
            className="gap-2"
            size="lg"
          >
            {isConfirming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirm Receipt
              </>
            )}
          </Button>
        </div>
      )}

      {/* Start Over Button */}
      {confirmSuccess && (
        <div className="flex justify-center">
          <Button
            onClick={handleRemoveImage}
            variant="outline"
            className="gap-2 bg-transparent"
            size="lg"
          >
            <Camera className="h-4 w-4" />
            Scan Another Receipt
          </Button>
        </div>
      )}

      {/* Instructions */}
      {!uploadedImage && !confirmSuccess && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">Tips for Best Results</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Ensure good lighting when taking photos</li>
            <li>Keep the receipt flat and fully visible</li>
            <li>Avoid shadows and reflections</li>
            <li>Review and correct extracted data before confirming</li>
          </ul>
        </div>
      )}
    </div>
  )
}
