"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useOrder } from "@/lib/api/orders";
import { useConversationByOrder } from "@/lib/api/chat";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { Loader2, Package, MapPin, Store, MessageSquare, Download, ChevronLeft, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const locale = useLocale();
  const router = useRouter();
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Fetch order details
  const { data: order, isLoading, isError } = useOrder(id as string);
  
  // Fetch conversation ID for this order
  const { data: conversationId } = useConversationByOrder(id as string);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", minimumFractionDigits: 0 }).format(price);

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("en-LK", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateString));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-destructive">Order not found</h2>
        <Link href={`/${locale}/orders`} className="text-primary hover:underline mt-4 inline-flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <Link href={`/${locale}/orders`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-muted/50 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              Order #{order.orderNumber}
              <OrderStatusBadge status={order.status} />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-primary">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Items & Delivery */}
          <div className="md:col-span-2 space-y-8">
            {/* Items */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" /> Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.imageUrls?.[0] && (
                        <Image src={item.imageUrls[0]} alt={item.productTitle} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{item.productTitle}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Qty: {item.approvedQty} {item.attributesSnapshot?.unit || "units"} 
                        {item.requestedQty !== item.approvedQty && (
                          <span className="text-amber-600 ml-2">(Requested: {item.requestedQty})</span>
                        )}
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-1">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" /> Delivery Details
              </h2>
              <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                <div className="flex items-start gap-3">
                  {order.deliveryMethod === "DELIVERY" ? (
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  ) : (
                    <Store className="w-5 h-5 text-primary mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {order.deliveryMethod === "DELIVERY" ? "Delivery Address" : "Pickup Location"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.deliveryMethod === "DELIVERY" ? order.deliveryAddress : "Pickup from Farmer's Farm"}
                    </p>
                  </div>
                </div>
                {order.buyerNotes && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-sm font-medium text-foreground">Your Notes to Farmer:</p>
                    <p className="text-sm text-muted-foreground italic mt-1">"{order.buyerNotes}"</p>
                  </div>
                )}
                {order.farmerNotes && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-sm font-medium text-foreground">Farmer's Notes:</p>
                    <p className="text-sm text-muted-foreground italic mt-1">"{order.farmerNotes}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Farmer Info & Actions */}
          <div className="space-y-6">
            <div className="p-5 bg-card border border-border rounded-xl">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Farmer Details</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden flex-shrink-0">
                  {order.farmerName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{order.farmerName}</p>
                  {/* Show mobile only if status is ACCEPTED or higher */}
                  {["ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status) && order.farmerMobile && (
                    <p className="text-sm text-muted-foreground">{order.farmerMobile}</p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (conversationId) {
                    setIsChatOpen(true);
                  } else {
                    toast.info("Chat will be available once the farmer accepts your order.");
                  }
                }}
                disabled={!conversationId}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${
                  conversationId
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {conversationId ? "Contact Farmer" : "Chat Unavailable"}
              </button>
            </div>

            {/* Invoice Download */}
            {order.status !== "PENDING" && order.status !== "REJECTED" && (
              <div className="p-5 bg-card border border-border rounded-xl">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Documents</h3>
                <Link 
                  href={`/${locale}/orders/${order.id}/download`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium border border-border text-foreground hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Invoice
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialConversationId={conversationId}
      />
    </div>
  );
}