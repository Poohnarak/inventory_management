"use client"

import { Menu, Package2, LogOut, Store, User, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex items-center gap-2">
        <Package2 className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">Inventory Manager</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              {user.role === "SUPER_ADMIN" ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Platform Admin</span>
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.shopName}</span>
                </>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{user.username}</span>
              <Badge variant={user.role === "SUPER_ADMIN" ? "default" : "secondary"} className="text-xs">
                {user.role === "SUPER_ADMIN" ? "SUPER ADMIN" : user.role}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
