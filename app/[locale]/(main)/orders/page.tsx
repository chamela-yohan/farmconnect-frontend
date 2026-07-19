"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useBuyerOrders } from "@/lib/api/orders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Loader2, Package, MapPin, Store, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function OrdersPage() {
  const locale = useLocale();
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [page, setPage] = useState(0);

  // ✅ Only fetch the paginated list of orders here
  const { data, isLoading, isError } = useBuyerOrders(activeStatus, page, 10);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));

  const tabs = ["ALL", "PENDING", "ACCEPTED", "DELIVERED", "REJECTED"];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-1">
          Track your requests and order history.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveStatus(tab);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeStatus === tab
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-destructive">
          Failed to load orders.
        </div>
      ) : data && data.content.length > 0 ? (
        <div className="space-y-6">
          {data.content.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header: Meta Info */}
              <div className="bg-muted/50 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    #{order.orderNumber}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Card Body: Items & Details */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Farmer</p>
                    <p className="font-medium text-foreground">
                      {order.farmerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="font-bold text-lg text-primary">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {item.imageUrls?.[0] && (
                          <Image
                            src={item.imageUrls[0]}
                            alt={item.productTitle}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">
                          {item.productTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.approvedQty}{" "}
                          {item.attributesSnapshot?.unit || "units"}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-muted-foreground pl-15">
                      + {order.items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* Delivery Info */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border">
                  {order.deliveryMethod === "DELIVERY" ? (
                    <>
                      <MapPin className="w-3 h-3" /> Delivery to:{" "}
                      {order.deliveryAddress}
                    </>
                  ) : (
                    <>
                      <Store className="w-3 h-3" /> Pickup from Farm
                    </>
                  )}
                </div>
              </div>

              {/* Card Footer: Action */}
              <div className="bg-muted/30 px-5 py-3 border-t border-border flex justify-end">
                <Link
                  href={`/${locale}/orders/${order.id}`}
                  className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="flex justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={data.first}
              className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {data.number + 1} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={data.last}
              className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            No orders found
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            {activeStatus === "ALL"
              ? "You haven't placed any orders yet. Start shopping to see your orders here!"
              : `You have no orders with the status "${activeStatus}".`}
          </p>
          <Link
            href={`/${locale}/search`}
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}