"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Loader2,
  AlertCircle,
  Search,
  MoreHorizontal,
  Power,
  PowerOff,
  KeyRound,
  Trash2,
  BarChart3,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

interface Shop {
  id: number;
  shopCode: string;
  shopName: string;
  userDbName: string;
  appDbName: string;
  isActive: boolean;
  createdAt: string;
}

interface ShopStats {
  shop: { id: number; shopCode: string; shopName: string; isActive: boolean };
  users: { total: number; active: number };
  data: {
    products: number;
    ingredients: number;
    salesRecords: number;
    purchases: number;
  };
  error?: string;
}

export default function ShopManagementPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create shop dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    shopCode: "",
    shopName: "",
    adminUsername: "admin",
    adminPassword: "admin123",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Stats dialog
  const [statsShop, setStatsShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Reset admin dialog
  const [resetShop, setResetShop] = useState<Shop | null>(null);
  const [resetForm, setResetForm] = useState({
    username: "admin",
    password: "admin123",
  });
  const [isResetting, setIsResetting] = useState(false);

  // Delete confirm
  const [deleteShop, setDeleteShop] = useState<Shop | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchShops = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch<{
        success: boolean;
        data: Shop[];
        pagination: { total: number };
      }>(`/api/superadmin/shops?search=${encodeURIComponent(searchQuery)}&limit=100`, {
        token,
      });
      setShops(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shops");
    } finally {
      setIsLoading(false);
    }
  }, [token, searchQuery]);

  useEffect(() => {
    if (user?.role !== "SUPER_ADMIN") {
      router.replace("/");
      return;
    }
    fetchShops();
  }, [user, router, fetchShops]);

  async function handleCreateShop(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);
    try {
      await apiFetch("/api/superadmin/shops", {
        method: "POST",
        token: token ?? undefined,
        body: JSON.stringify(createForm),
      });
      setIsCreateOpen(false);
      setCreateForm({
        shopCode: "",
        shopName: "",
        adminUsername: "admin",
        adminPassword: "admin123",
      });
      fetchShops();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create shop"
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleShop(shop: Shop) {
    const endpoint = shop.isActive ? "disable" : "enable";
    try {
      await apiFetch(`/api/superadmin/shops/${shop.id}/${endpoint}`, {
        method: "POST",
        token: token ?? undefined,
      });
      fetchShops();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${endpoint} shop`
      );
    }
  }

  async function handleDeleteShop() {
    if (!deleteShop) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/superadmin/shops/${deleteShop.id}`, {
        method: "DELETE",
        token: token ?? undefined,
      });
      setDeleteShop(null);
      fetchShops();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete shop");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleResetAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!resetShop) return;
    setIsResetting(true);
    try {
      await apiFetch(`/api/superadmin/shops/${resetShop.id}/reset-admin`, {
        method: "POST",
        token: token ?? undefined,
        body: JSON.stringify(resetForm),
      });
      setResetShop(null);
      setResetForm({ username: "admin", password: "admin123" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset admin"
      );
    } finally {
      setIsResetting(false);
    }
  }

  async function handleViewStats(shop: Shop) {
    setStatsShop(shop);
    setStats(null);
    setIsLoadingStats(true);
    try {
      const res = await apiFetch<{ success: boolean; data: ShopStats }>(
        `/api/superadmin/shops/${shop.id}/stats`,
        { token: token ?? undefined }
      );
      setStats(res.data);
    } catch {
      setStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  }

  if (user?.role !== "SUPER_ADMIN") return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground text-balance">
            Shop Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, configure, and monitor tenant shops.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Shop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Shop</DialogTitle>
              <DialogDescription>
                This will create the shop record, provision two databases (users
                + app), run migrations, and seed a default admin user.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateShop} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="shopCode">Shop Code</Label>
                <Input
                  id="shopCode"
                  placeholder="e.g. BAKERY01"
                  value={createForm.shopCode}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      shopCode: e.target.value.toUpperCase(),
                    }))
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Alphanumeric, uppercase. Used as the login identifier.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  placeholder="e.g. Downtown Bakery"
                  value={createForm.shopName}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, shopName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminUser">Admin Username</Label>
                  <Input
                    id="adminUser"
                    value={createForm.adminUsername}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        adminUsername: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminPass">Admin Password</Label>
                  <Input
                    id="adminPass"
                    type="password"
                    value={createForm.adminPassword}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        adminPassword: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {createError && (
                <div
                  role="alert"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {createError}
                </div>
              )}

              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Provisioning...
                    </>
                  ) : (
                    "Create & Provision"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search shops..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Shops Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Registered Shops</CardTitle>
          <CardDescription>
            {shops.length} shop{shops.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : shops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No shops found. Create your first shop above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop Code</TableHead>
                    <TableHead>Shop Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      User DB
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      App DB
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="w-10">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {shop.shopCode}
                      </TableCell>
                      <TableCell>{shop.shopName}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                        {shop.userDbName}
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                        {shop.appDbName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={shop.isActive ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {shop.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {new Date(shop.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewStats(shop)}
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Stats
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleShop(shop)}
                            >
                              {shop.isActive ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  Enable
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setResetShop(shop)}
                            >
                              <KeyRound className="h-4 w-4 mr-2" />
                              Reset Admin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteShop(shop)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Dialog */}
      <Dialog
        open={!!statsShop}
        onOpenChange={(open) => !open && setStatsShop(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statsShop?.shopName} ({statsShop?.shopCode})
            </DialogTitle>
            <DialogDescription>
              Usage statistics for this shop.
            </DialogDescription>
          </DialogHeader>
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Users className="h-3.5 w-3.5" />
                  Users
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {stats.users.total}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.users.active} active
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Products
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {stats.data.products}
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Ingredients
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {stats.data.ingredients}
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Sales Records
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {stats.data.salesRecords}
                </div>
              </div>
              {stats.error && (
                <div className="col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {stats.error}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-muted-foreground">
                Failed to load stats.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Admin Dialog */}
      <Dialog
        open={!!resetShop}
        onOpenChange={(open) => !open && setResetShop(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Admin - {resetShop?.shopName}</DialogTitle>
            <DialogDescription>
              Reset or create the admin user for this shop.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetAdmin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reset-username">Admin Username</Label>
              <Input
                id="reset-username"
                value={resetForm.username}
                onChange={(e) =>
                  setResetForm((p) => ({ ...p, username: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reset-password">New Password</Label>
              <Input
                id="reset-password"
                type="password"
                value={resetForm.password}
                onChange={(e) =>
                  setResetForm((p) => ({ ...p, password: e.target.value }))
                }
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Admin"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteShop}
        onOpenChange={(open) => !open && setDeleteShop(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteShop?.shopName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the shop record from the system database. The
              underlying PostgreSQL databases ({deleteShop?.userDbName},{" "}
              {deleteShop?.appDbName}) will NOT be dropped automatically and
              must be removed manually if desired.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteShop}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Shop"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
