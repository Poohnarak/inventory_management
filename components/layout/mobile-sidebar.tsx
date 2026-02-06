"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  Upload,
  ScanLine,
  X,
  Users,
  LogOut,
  Store,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingredients", label: "Ingredients", icon: Package },
  { href: "/products", label: "Products & BOM", icon: ShoppingCart },
  { href: "/stock-history", label: "Stock History", icon: History },
  { href: "/import-sales", label: "Import Sales", icon: Upload },
  { href: "/scan-receipt", label: "Scan Receipt", icon: ScanLine },
]

const adminNavItems = [
  { href: "/users", label: "User Management", icon: Users },
]

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-full w-64 border-r border-border bg-sidebar lg:hidden">
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="text-lg font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        <div className="flex h-[calc(100%-3.5rem)] flex-col">
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {user?.role === "ADMIN" && (
              <>
                <div className="my-2 border-t border-border" />
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          {user && (
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 px-3 py-2 text-sm">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.shopName}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {user.role}
                </Badge>
              </div>
              <button
                onClick={() => {
                  onClose()
                  logout()
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
