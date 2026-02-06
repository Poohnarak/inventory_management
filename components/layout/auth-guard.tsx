"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated -> login
    if (!user) {
      router.replace("/login");
      return;
    }

    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const isAdminRoute = pathname.startsWith("/admin");

    // SUPER_ADMIN visiting a shop page -> redirect to /admin
    if (isSuperAdmin && !isAdminRoute) {
      router.replace("/admin");
      return;
    }

    // Shop user visiting an admin page -> redirect to /
    if (!isSuperAdmin && isAdminRoute) {
      router.replace("/");
      return;
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
