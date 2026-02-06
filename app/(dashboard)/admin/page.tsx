"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  ShieldAlert,
  Activity,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

interface Overview {
  totalShops: number;
  activeShops: number;
  disabledShops: number;
  totalSuperAdmins: number;
}

export default function SuperAdminOverviewPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "SUPER_ADMIN") {
      router.replace("/");
      return;
    }

    async function fetchOverview() {
      try {
        const res = await apiFetch<{ success: boolean; data: Overview }>(
          "/api/superadmin/overview",
          { token: token ?? undefined }
        );
        setOverview(res.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load overview"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchOverview();
  }, [user, token, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Shops",
      value: overview?.totalShops ?? 0,
      icon: Building2,
      description: "Registered on the platform",
    },
    {
      label: "Active Shops",
      value: overview?.activeShops ?? 0,
      icon: Activity,
      description: "Currently operational",
    },
    {
      label: "Disabled Shops",
      value: overview?.disabledShops ?? 0,
      icon: ShieldAlert,
      description: "Temporarily suspended",
    },
    {
      label: "Super Admins",
      value: overview?.totalSuperAdmins ?? 0,
      icon: Users,
      description: "Platform administrators",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground text-balance">
          Platform Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          System-wide metrics and shop health at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <CardDescription className="text-xs mt-1">
                {stat.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
