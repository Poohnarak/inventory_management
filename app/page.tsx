"use client"

import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { dashboardStats, mockStockMovements } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const recentMovements = mockStockMovements.slice(0, 5)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your inventory status"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Products"
          value={dashboardStats.totalProducts}
          icon={ShoppingCart}
          description="Active products in catalog"
        />
        <StatCard
          title="Total Ingredients"
          value={dashboardStats.totalIngredients}
          icon={Package}
          description="Tracked ingredients"
        />
        <StatCard
          title="Stock Value"
          value={`$${dashboardStats.currentStockValue.toFixed(2)}`}
          icon={DollarSign}
          description="Current inventory value"
        />
        <StatCard
          title="Today Sales"
          value={`$${dashboardStats.todaySales.toFixed(2)}`}
          icon={TrendingUp}
          description="Revenue today"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="flex items-end justify-center gap-1 h-24">
                  {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                    <div
                      key={i}
                      className="w-8 bg-primary/80 rounded-t transition-all hover:bg-primary"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-center gap-1 mt-2 text-xs text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <span key={day} className="w-8 text-center">{day}</span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="w-full px-4 space-y-3">
                {[
                  { name: "Flour", level: 75, color: "bg-primary" },
                  { name: "Sugar", level: 60, color: "bg-accent" },
                  { name: "Butter", level: 45, color: "bg-chart-3" },
                  { name: "Eggs", level: 90, color: "bg-chart-4" },
                ].map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{item.name}</span>
                      <span className="text-muted-foreground">{item.level}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMovements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      movement.type === "Purchase"
                        ? "default"
                        : movement.type === "Sale"
                        ? "secondary"
                        : "outline"
                    }
                    className="w-20 justify-center"
                  >
                    {movement.type}
                  </Badge>
                  <span className="font-medium text-foreground">{movement.itemName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={
                      movement.quantityChange > 0
                        ? "text-accent font-medium"
                        : "text-destructive font-medium"
                    }
                  >
                    {movement.quantityChange > 0 ? "+" : ""}
                    {movement.quantityChange}
                  </span>
                  <span className="text-sm text-muted-foreground">{movement.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
