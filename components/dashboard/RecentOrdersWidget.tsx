"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";
import { useFarmerRecentOrders } from "@/lib/api/farmer";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600",
  ACCEPTED: "bg-blue-500/10 text-blue-600",
  PREPARING: "bg-indigo-500/10 text-indigo-600",
  OUT_FOR_DELIVERY: "bg-purple-500/10 text-purple-600",
  READY_FOR_PICKUP: "bg-purple-500/10 text-purple-600",
  DELIVERED: "bg-cyan-500/10 text-cyan-600",
  COMPLETED: "bg-green-500/10 text-green-600",
  REJECTED: "bg-red-500/10 text-red-600",
  CANCELLED: "bg-red-500/10 text-red-600",
};

export function RecentOrdersWidget() {
  const locale = useLocale();
  const { data: orders, isLoading, isError } = useFarmerRecentOrders();

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
        <Link
          href={`/${locale}/farmer/orders`}
          className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
        >
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-muted-foreground py-6 text-center">Couldn't load recent orders.</p>
      )}

      {!isLoading && !isError && orders?.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No orders yet — they'll show up here as buyers start ordering.
        </p>
      )}

      {!isLoading && !isError && orders && orders.length > 0 && (
        <ul className="divide-y divide-border">
          {orders.map((order) => (
            <li key={order.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{order.orderNumber}</p>
                {/* adjust order.buyer?.name if your OrderResponse names this field differently */}
                <p className="text-xs text-muted-foreground truncate">{order.buyerName ?? "Buyer"}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold text-foreground">
                  LKR {order.totalAmount.toLocaleString()}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"}`}>
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}