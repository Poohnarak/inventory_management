"use client"

import React from "react"

import { useState, useCallback } from "react"
import { Upload, FileSpreadsheet, X, Check, AlertCircle } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockProducts } from "@/lib/mock-data"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CSVRow {
  id: string
  productName: string
  quantity: number
  date: string
  mappedProductId: string
}

const mockCSVData: CSVRow[] = [
  { id: "1", productName: "Choco Cake Large", quantity: 5, date: "2026-02-05", mappedProductId: "" },
  { id: "2", productName: "Vanilla Cup 12pc", quantity: 3, date: "2026-02-05", mappedProductId: "" },
  { id: "3", productName: "Butter Cookies Box", quantity: 10, date: "2026-02-05", mappedProductId: "" },
  { id: "4", productName: "Fresh Croissant", quantity: 25, date: "2026-02-04", mappedProductId: "" },
  { id: "5", productName: "Cream Puff Set", quantity: 8, date: "2026-02-04", mappedProductId: "" },
]

export default function ImportSalesPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

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
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      setIsUploading(true)
      setUploadedFile(file)
      // Simulate parsing CSV
      setTimeout(() => {
        setCsvData(mockCSVData)
        setIsUploading(false)
      }, 1000)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setCsvData([])
    setImportSuccess(false)
  }

  const handleProductMapping = (rowId: string, productId: string) => {
    setCsvData(
      csvData.map((row) =>
        row.id === rowId ? { ...row, mappedProductId: productId } : row
      )
    )
  }

  const handleImport = () => {
    setIsImporting(true)
    // Simulate import
    setTimeout(() => {
      setIsImporting(false)
      setImportSuccess(true)
    }, 1500)
  }

  const allMapped = csvData.length > 0 && csvData.every((row) => row.mappedProductId)

  return (
    <div>
      <PageHeader
        title="Import Sales"
        description="Upload CSV files to import sales data"
      />

      {/* Upload Area */}
      {!uploadedFile && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop your CSV file here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <Button type="button" variant="outline">
                  Select File
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded File Info */}
      {uploadedFile && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-base">{uploadedFile.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Loading State */}
      {isUploading && (
        <Card className="mb-6">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
              <p className="text-muted-foreground">Parsing CSV file...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {importSuccess && (
        <Alert className="mb-6 border-accent bg-accent/10">
          <Check className="h-4 w-4 text-accent" />
          <AlertDescription className="text-accent">
            Sales data imported successfully! {csvData.length} records processed.
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Table */}
      {csvData.length > 0 && !isUploading && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Preview & Map Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>CSV Product Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Map to Product</TableHead>
                      <TableHead className="w-12">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-sm">{row.date}</TableCell>
                        <TableCell className="font-medium">{row.productName}</TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>
                          <Select
                            value={row.mappedProductId}
                            onValueChange={(value) => handleProductMapping(row.id, value)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {row.mappedProductId ? (
                            <Check className="h-5 w-5 text-accent" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {csvData.length > 0 && !importSuccess && (
        <div className="flex justify-end">
          <Button
            onClick={handleImport}
            disabled={!allMapped || isImporting}
            className="gap-2"
            size="lg"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                Importing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirm Import ({csvData.length} records)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Help Text */}
      {!uploadedFile && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">CSV Format Requirements</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Column headers: product_name, quantity, date</li>
            <li>Date format: YYYY-MM-DD</li>
            <li>Quantity must be a positive number</li>
          </ul>
        </div>
      )}
    </div>
  )
}
