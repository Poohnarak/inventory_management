"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package2, LogIn, Loader2, Store, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

interface Shop {
  id: number;
  shopCode: string;
  shopName: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isSuperAdmin } = useAuth();

  const [shops, setShops] = useState<Shop[]>([]);
  const [shopCode, setShopCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingShops, setIsLoadingShops] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (isSuperAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [user, isSuperAdmin, router]);

  // Fetch shops for the dropdown
  useEffect(() => {
    async function fetchShops() {
      try {
        const res = await apiFetch<{ success: boolean; data: Shop[] }>(
          "/api/auth/shops"
        );
        setShops(res.data);
        if (res.data.length === 1) {
          setShopCode(res.data[0].shopCode);
        }
      } catch {
        // Non-blocking: shops might fail but super admin login still works
      } finally {
        setIsLoadingShops(false);
      }
    }
    fetchShops();
  }, []);

  async function handleShopLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!shopCode) {
      setError("Please select a shop");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password, shopCode);
      router.replace("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSuperAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(username, password);
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground">
            <Package2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground text-balance text-center">
            Inventory Manager
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Sign in to manage your shop inventory
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>
              Choose your login type below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="shop"
              onValueChange={() => {
                setError("");
                setUsername("");
                setPassword("");
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="shop" className="flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5" />
                  Shop Login
                </TabsTrigger>
                <TabsTrigger value="super" className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Super Admin
                </TabsTrigger>
              </TabsList>

              {/* Shop Login Tab */}
              <TabsContent value="shop">
                <form onSubmit={handleShopLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="shop">Shop</Label>
                    {isLoadingShops ? (
                      <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading shops...</span>
                      </div>
                    ) : shops.length === 0 ? (
                      <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground">
                        <Store className="h-4 w-4" />
                        <span>No shops available</span>
                      </div>
                    ) : (
                      <Select value={shopCode} onValueChange={setShopCode}>
                        <SelectTrigger id="shop">
                          <SelectValue placeholder="Select a shop" />
                        </SelectTrigger>
                        <SelectContent>
                          {shops.map((shop) => (
                            <SelectItem key={shop.id} value={shop.shopCode}>
                              <span className="flex items-center gap-2">
                                <Store className="h-4 w-4 text-muted-foreground" />
                                {shop.shopName}
                                <span className="text-muted-foreground">
                                  ({shop.shopCode})
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="shop-username">Username</Label>
                    <Input
                      id="shop-username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="shop-password">Password</Label>
                    <Input
                      id="shop-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || isLoadingShops}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Super Admin Tab */}
              <TabsContent value="super">
                <form onSubmit={handleSuperAdminLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="super-username">Username</Label>
                    <Input
                      id="super-username"
                      type="text"
                      placeholder="Super admin username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="super-password">Password</Label>
                    <Input
                      id="super-password"
                      type="password"
                      placeholder="Super admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Sign In as Super Admin
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
