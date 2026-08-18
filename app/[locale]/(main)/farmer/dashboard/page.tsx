"use client";

import {
  useFarmerDashboardStats,
  useFarmerMonthlyStats,
} from "@/lib/api/farmer";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Star,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { OrderVolumeChart } from "@/components/charts/OrderVolumeChart";
import { RecentOrdersWidget } from "@/components/dashboard/RecentOrdersWidget";
import { TopProductsWidget } from "@/components/dashboard/TopProductsWidget";
import { useAuthStore } from "@/stores/authStore";

export default function FarmerDashboardPage() {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  const isFarmer = user?.role === "FARMER";

  const {
    data: stats,
    isLoading,
    isError,
  } = useFarmerDashboardStats({
    enabled: isHydrated && isFarmer,
  });

  const {
    data: monthlyStats,
    isLoading: isMonthlyStatsLoading,
    isError: isMonthlyStatsError,
  } = useFarmerMonthlyStats({
    enabled: isHydrated && isFarmer,
  });

  // Wait until auth state has been restored.
  if (!isHydrated) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "FARMER") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="w-full max-w-md rounded-2xl bg-background border border-border shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-8 w-8 text-primary" />
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Farmer Registration Required
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This dashboard is available only to registered farmers. Please
            register as a farmer to continue.
          </p>

          {/* Actions */}
          <div className="mt-7 flex gap-3">
            <Link
              href={`/${locale}/register`}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Register as Farmer
            </Link>

            <Link
              href={`/${locale}`}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-foreground">
          Failed to load dashboard
        </h2>
        <p className="text-muted-foreground mt-2">
          Please check your connection and try again.
        </p>
      </div>
    );
  }

  // Stat Cards Configuration
  const statCards = [
    {
      title: "Total Revenue",
      value: `LKR ${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Lifetime earnings",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "All time orders",
    },
    {
      title: "Action Required",
      value: stats?.pendingOrders || 0,
      icon: TrendingUp,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Pending/Preparing",
    },
    {
      title: "Active Products",
      value: stats?.activeProducts || 0,
      icon: Package,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Currently listed",
    },
    {
      title: "Average Rating",
      value: stats?.averageRating
        ? `${stats.averageRating.toFixed(1)} / 5.0`
        : "N/A",
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      description: "Based on reviews",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Farmer Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your farm today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/en/farmer/products"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Manage Products
          </Link>
          <Link
            href="/en/farmer/orders"
            className="px-4 py-2 border border-border bg-background text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              {card.title}
            </h3>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder for Future Charts / Recent Activity */}
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Revenue Overview
          </h3>
          <RevenueChart
            data={monthlyStats ?? []}
            isLoading={isMonthlyStatsLoading}
            isError={isMonthlyStatsError}
          />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Order Volume
          </h3>
          <OrderVolumeChart
            data={monthlyStats ?? []}
            isLoading={isMonthlyStatsLoading}
            isError={isMonthlyStatsError}
          />
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersWidget />
        <TopProductsWidget />
      </div>
    </div>
  );
}
