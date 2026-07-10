"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/api/cart";
import { useCheckout } from "@/lib/api/orders";
import { DeliveryMethod } from "@/types/order";
import { 
  Loader2, 
  MapPin, 
  Store, 
  ArrowLeft, 
  Package,
  CheckCircle2 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const checkoutMutation = useCheckout();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.PICKUP);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Redirect to home if cart is empty
  useEffect(() => {
    if (!isCartLoading && cart && cart.items.length === 0) {
      router.replace(`/${locale}/search`);
    }
  }, [isCartLoading, cart, router, locale]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", minimumFractionDigits: 0 }).format(price);

  const handleCheckout = async () => {
    setError(null);

    if (deliveryMethod === DeliveryMethod.DELIVERY && address.trim().length < 5) {
      setError("Please enter a valid delivery address.");
      return;
    }

    try {
      await checkoutMutation.mutateAsync({
        deliveryMethod,
        deliveryAddress: deliveryMethod === DeliveryMethod.DELIVERY ? address : undefined,
        buyerNotes: notes.trim() || undefined,
      });
      
      // Redirect to a success page or orders page
      router.push(`/${locale}/orders?success=true`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    }
  };

  if (isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) return null; // Handled by useEffect redirect

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/${locale}/search`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Shopping
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Checkout Form (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Delivery Method */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> How do you want to get your items?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryMethod(DeliveryMethod.PICKUP)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  deliveryMethod === DeliveryMethod.PICKUP 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <Store className={`w-6 h-6 mb-2 ${deliveryMethod === DeliveryMethod.PICKUP ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-semibold">Pickup from Farmer</p>
                <p className="text-xs text-muted-foreground mt-1">Collect directly from the farm</p>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod(DeliveryMethod.DELIVERY)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  deliveryMethod === DeliveryMethod.DELIVERY 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <MapPin className={`w-6 h-6 mb-2 ${deliveryMethod === DeliveryMethod.DELIVERY ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-semibold">Delivery to My Address</p>
                <p className="text-xs text-muted-foreground mt-1">Fees calculated per farmer</p>
              </button>
            </div>

            {/* Address Input (Conditional) */}
            {deliveryMethod === DeliveryMethod.DELIVERY && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-medium mb-1 block">Delivery Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="No. 123, Main Street, Colombo..."
                  rows={3}
                  className="w-full p-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            )}
          </div>

          {/* 2. Buyer Notes */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Add a Note for the Farmer (Optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Please call me 30 mins before arriving, or leave at the gate."
              rows={3}
              className="w-full p-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT: Order Summary (1 Column) */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {item.imageUrls?.[0] && (
                      <Image src={item.imageUrls[0]} alt={item.productTitle} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productTitle}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(cart.totalAmount)}</span>
              </div>
              {deliveryMethod === DeliveryMethod.DELIVERY && (
                <p className="text-xs text-muted-foreground italic">
                  * Delivery fees will be added by the farmer upon acceptance.
                </p>
              )}
              <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border mt-2">
                <span>Total</span>
                <span>{formatPrice(cart.totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending}
              className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {checkoutMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Place Order Request
                </>
              )}
            </button>
            
            <p className="text-[10px] text-center text-muted-foreground mt-3">
              By placing this order, you agree to our terms. The farmer will review and confirm your request shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}