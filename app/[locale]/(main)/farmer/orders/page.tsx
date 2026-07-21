"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useFarmerOrders, useUpdateOrderStatus } from "@/lib/api/orders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderActionModal } from "@/components/orders/OrderActionModal";
import {
  Loader2,
  Package,
  MapPin,
  Store,
  CheckCircle2,
  XCircle,
  Truck,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function FarmerOrdersPage() {
  const locale = useLocale();
  const [activeStatus, setActiveStatus] = useState<string>("PENDING");
  const [page, setPage] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    number: string;
  } | null>(null);
  const [actionType, setActionType] = useState<"ACCEPT" | "REJECT">("ACCEPT");

  const { data, isLoading, isError } = useFarmerOrders(activeStatus, page, 10);
  const updateMutation = useUpdateOrderStatus();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(price);

  const tabs = [
    "ALL",
    "PENDING",
    "ACCEPTED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "REJECTED",
  ];

  const handleActionClick = (
    orderId: string,
    orderNumber: string,
    type: "ACCEPT" | "REJECT",
  ) => {
    setSelectedOrder({ id: orderId, number: orderNumber });
    setActionType(type);
    setModalOpen(true);
  };

  const handleConfirmAction = async (notes: string) => {
    if (!selectedOrder) return;
    const newStatus = actionType === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    await updateMutation.mutateAsync({
      orderId: selectedOrder.id,
      request: { newStatus, notes: notes || undefined },
    });
  };

  const getAvailableActions = (status: string, deliveryMethod: string) => {
    switch (status) {
      case "PENDING":
        return ["ACCEPT", "REJECT"];
      case "ACCEPTED":
        return ["PREPARING", "REJECT"];
      case "PREPARING":
        return deliveryMethod === "DELIVERY"
          ? ["OUT_FOR_DELIVERY"]
          : ["READY_FOR_PICKUP"];
      case "OUT_FOR_DELIVERY":
      case "READY_FOR_PICKUP":
        return ["DELIVERED"];
      default:
        return [];
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Received Orders</h1>
        <p className="text-muted-foreground mt-1">
          Manage incoming requests and update order statuses.
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
            {tab.replace("_", " ")}
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
          {data.content.map((order) => {
            const actions = getAvailableActions(
              order.status,
              order.deliveryMethod,
            );

            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="bg-muted/50 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      From: {order.buyerName}{" "}
                      {order.buyerMobile && `(${order.buyerMobile})`}
                    </span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => (
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
                            Requested: {item.requestedQty}{" "}
                            {item.attributesSnapshot?.unit || "units"}
                            {item.requestedQty !== item.approvedQty &&
                              ` | Approved: ${item.approvedQty}`}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border mb-4">
                    {order.deliveryMethod === "DELIVERY" ? (
                      <>
                        <MapPin className="w-3 h-3" /> Deliver to:{" "}
                        {order.deliveryAddress}
                      </>
                    ) : (
                      <>
                        <Store className="w-3 h-3" /> Buyer will pickup from
                        farm
                      </>
                    )}
                    {order.buyerNotes && (
                      <span className="ml-2 italic">
                        | Note: "{order.buyerNotes}"
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {actions.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {actions.includes("ACCEPT") && (
                        <button
                          onClick={() =>
                            handleActionClick(
                              order.id,
                              order.orderNumber,
                              "ACCEPT",
                            )
                          }
                          className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Accept
                        </button>
                      )}
                      {actions.includes("REJECT") && (
                        <button
                          onClick={() =>
                            handleActionClick(
                              order.id,
                              order.orderNumber,
                              "REJECT",
                            )
                          }
                          className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />{" "}
                          {order.status === "PENDING" ? "Reject" : "Cancel"}
                        </button>
                      )}
                      {actions.includes("PREPARING") && (
                        <button
                          onClick={() =>
                            updateMutation.mutateAsync({
                              orderId: order.id,
                              request: { newStatus: "PREPARING" },
                            })
                          }
                          className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Mark Preparing
                        </button>
                      )}
                      {actions.includes("READY_FOR_PICKUP") && (
                        <button
                          onClick={() =>
                            updateMutation.mutateAsync({
                              orderId: order.id,
                              request: { newStatus: "READY_FOR_PICKUP" },
                            })
                          }
                          className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Store className="w-4 h-4" /> Ready for Pickup
                        </button>
                      )}
                      {actions.includes("OUT_FOR_DELIVERY") && (
                        <button
                          onClick={() =>
                            updateMutation.mutateAsync({
                              orderId: order.id,
                              request: { newStatus: "OUT_FOR_DELIVERY" },
                            })
                          }
                          className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Truck className="w-4 h-4" /> Mark Shipped
                        </button>
                      )}
                      {actions.includes("DELIVERED") && (
                        <button
                          onClick={() =>
                            updateMutation.mutateAsync({
                              orderId: order.id,
                              request: { newStatus: "DELIVERED" },
                            })
                          }
                          className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}

                      <Link
                        href={`/${locale}/farmer/orders/${order.id}`}
                        className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                      >
                        View Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <div className="flex justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={data.first}
              className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {data.number + 1} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={data.last}
              className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50"
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
          <p className="text-muted-foreground mt-2">
            You have no{" "}
            {activeStatus === "ALL" ? "" : activeStatus.toLowerCase()} orders at
            the moment.
          </p>
        </div>
      )}

      {/* Action Modal */}
      {selectedOrder && (
        <OrderActionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmAction}
          actionType={actionType}
          orderNumber={selectedOrder.number}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}
