"use client";

import { useCart, useRemoveFromCart, useUpdateCartItem } from "@/lib/api/cart";
import { ShoppingCart, X, Trash2, Loader2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { toast } from "sonner"; // toast

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const locale = useLocale();
  const { data: cart, isLoading } = useCart();
  const removeMutation = useRemoveFromCart();
  const updateMutation = useUpdateCartItem();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", minimumFractionDigits: 0 }).format(price);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Your Cart ({cart?.totalItems || 0})
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-180px)]">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : cart && cart.items.length > 0 ? (
            cart.items.map((item) => {
              // Calculate step size (default to 1 if not set)
              const step = item.qtyStep && item.qtyStep > 0 ? Number(item.qtyStep) : 1;
              const currentQty = Number(item.quantity);

              return (
                <div key={item.id} className="flex gap-4 p-3 bg-card border border-border rounded-lg">
                  {/* PRODUCT IMAGE */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {item.imageUrls?.[0] ? (
                      <Image src={item.imageUrls[0]} alt={item.productTitle} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingCart className="w-8 h-8 opacity-30" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link href={`/${locale}/products/${item.productId}`} onClick={onClose}>
                        <h3 className="font-medium text-sm text-foreground truncate hover:text-primary">{item.productTitle}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {item.productType ? item.productType.replace(/_/g, ' ') : 'Product'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold text-primary text-sm">{formatPrice(item.subtotal)}</span>
                      
                      <div className="flex items-center gap-2">
                        {/* SMART QUANTITY STEPPER */}
                        <div className="flex items-center border border-border rounded-md overflow-hidden">
                          <button 
                            onClick={async () => {
                              const newQty = currentQty - step;
                              if (newQty <= 0) {
                                removeMutation.mutate(item.id);
                                return;
                              }
                              if (item.minOrderQty && newQty < Number(item.minOrderQty)) {
                                toast.error(`Minimum order is ${item.minOrderQty}`);
                                return;
                              }
                              try {
                                await updateMutation.mutateAsync({ itemId: item.id, quantity: newQty });
                              } catch (error: any) {
                                toast.error(error.response?.data?.message || "Failed to update.");
                              }
                            }}
                            disabled={updateMutation.isPending}
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className="w-10 text-center text-sm font-medium">{currentQty}</span>
                          
                          <button 
                            onClick={async () => {
                              const newQty = currentQty + step;
                              
                              // Frontend Validation (Prevents unnecessary API calls)
                              if (item.maxOrderQty && newQty > Number(item.maxOrderQty)) {
                                toast.error(`Maximum order is ${item.maxOrderQty}`);
                                return;
                              }
                              if (item.availableStock && newQty > Number(item.availableStock)) {
                                toast.error("Insufficient stock available.");
                                return;
                              }

                              try {
                                await updateMutation.mutateAsync({ itemId: item.id, quantity: newQty });
                              } catch (error: any) {
                                toast.error(error.response?.data?.message || "Failed to update.");
                              }
                            }}
                            disabled={updateMutation.isPending}
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeMutation.mutate(item.id)}
                          className="text-destructive hover:text-destructive/80 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-50" />
              <p>Your cart is empty.</p>
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-bold">{formatPrice(cart.totalAmount)}</span>
            </div>
            <Link href={`/${locale}/checkout`} onClick={onClose} className="block w-full bg-primary text-primary-foreground text-center py-3 rounded-lg font-semibold hover:bg-primary/90">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}