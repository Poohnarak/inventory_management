"use client"

import { useState } from "react"
import { Search, Calendar } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockStockMovements, type StockMovement } from "@/lib/mock-data"

export default function StockHistoryPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMovements = mockStockMovements.filter((movement) => {
    const matchesType = typeFilter === "all" || movement.type === typeFilter
    const matchesDate = !dateFilter || movement.date === dateFilter
    const matchesSearch = movement.itemName
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesType && matchesDate && matchesSearch
  })

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (item: StockMovement) => (
        <span className="text-sm">{item.date}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item: StockMovement) => (
        <Badge
          variant={
            item.type === "Purchase"
              ? "default"
              : item.type === "Sale"
              ? "secondary"
              : "outline"
          }
        >
          {item.type}
        </Badge>
      ),
    },
    {
      key: "itemName",
      header: "Item",
      render: (item: StockMovement) => (
        <span className="font-medium">{item.itemName}</span>
      ),
    },
    {
      key: "quantityChange",
      header: "Quantity",
      render: (item: StockMovement) => (
        <span
          className={
            item.quantityChange > 0
              ? "text-accent font-medium"
              : "text-destructive font-medium"
          }
        >
          {item.quantityChange > 0 ? "+" : ""}
          {item.quantityChange}
        </span>
      ),
    },
  ]

  // Get unique dates for the date filter
  const uniqueDates = Array.from(
    new Set(mockStockMovements.map((m) => m.date))
  ).sort((a, b) => b.localeCompare(a))

  return (
    <div>
      <PageHeader
        title="Stock Movement History"
        description="View all stock changes and transactions"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Purchase">Purchase</SelectItem>
            <SelectItem value="Sale">Sale</SelectItem>
            <SelectItem value="Adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {uniqueDates.map((date) => (
              <SelectItem key={date} value={date}>
                {date}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {mockStockMovements.filter((m) => m.type === "Purchase").length}
          </p>
          <p className="text-sm text-muted-foreground">Purchases</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {mockStockMovements.filter((m) => m.type === "Sale").length}
          </p>
          <p className="text-sm text-muted-foreground">Sales</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {mockStockMovements.filter((m) => m.type === "Adjustment").length}
          </p>
          <p className="text-sm text-muted-foreground">Adjustments</p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredMovements}
        emptyMessage="No stock movements found"
      />
    </div>
  )
}
