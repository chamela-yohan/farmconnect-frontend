"use client";

import { useParams } from "next/navigation";
import { useProduct } from "@/lib/api/products";
import { useLocale, useTranslations } from "next-intl";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductType } from "@/types/product";
import { useAddToCart } from "@/lib/api/cart";
import {
  MapPin,
  Truck,
  Package,
  Calendar,
  Clock,
  Star,
  ShieldCheck,
  Loader2,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams();
  const locale = useLocale();
  const t = useTranslations("products");

  const { data: product, isLoading, error } = useProduct(id as string);
  const addToCartMutation = useAddToCart();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      // Use mutateAsync so we can await it and catch errors
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity: Number(product.minOrderQty || 1),
      });

      // Success!
      toast.success("Item added to cart");
    } catch (error: any) {
      // Extract the exact message from the backend's 400 response
      const errorMessage =
        error.response?.data?.message || "Failed to add item to cart.";

      // Show the specific business rule violation to the user
      toast.error(errorMessage);
    }
  };

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-destructive">
          Product not found
        </h2>
        <Link
          href={`/${locale}/search`}
          className="text-primary hover:underline mt-4 inline-block"
        >
          Back to Search
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(price);

  const getUnitLabel = () => {
    if (product.productType === ProductType.RENTABLE) return "/ day";
    if (product.attributes?.unit) return ` / ${product.attributes.unit}`;
    return "";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href={`/${locale}`} className="hover:text-primary">
          Home
        </Link>{" "}
        /
        <Link href={`/${locale}/search`} className="hover:text-primary ml-1">
          Products
        </Link>{" "}
        /<span className="text-foreground ml-1">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT: Gallery */}
        <ProductGallery
          images={product.imageUrls || []}
          videoUrl={product.videoUrl}
          title={product.title}
        />

        {/* RIGHT: Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md uppercase">
                {product.productType.replace("_", " ")}
              </span>
              <span className="text-sm text-muted-foreground">
                {product.categoryName}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg text-muted-foreground">
                {getUnitLabel()}
              </span>
            </div>
          </div>

          {/* Dynamic Attributes Card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4" /> Product Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.productType === ProductType.PHYSICAL_GOOD && (
                <>
                  {product.attributes?.availableStock && (
                    <div>
                      <p className="text-muted-foreground">Available Stock</p>
                      <p className="font-medium text-foreground">
                        {product.attributes.availableStock}{" "}
                        {product.attributes.unit || "units"}
                      </p>
                    </div>
                  )}
                  {product.attributes?.expiryDate && (
                    <div>
                      <p className="text-muted-foreground">Expiry Date</p>
                      <p className="font-medium text-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(
                          product.attributes.expiryDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Order Quantity</p>
                    <p className="font-medium text-foreground">
                      {product.minOrderQty} - {product.maxOrderQty}{" "}
                      {product.attributes?.unit || "units"}
                    </p>
                  </div>
                </>
              )}

              {product.productType === ProductType.RENTABLE && (
                <>
                  <div>
                    <p className="text-muted-foreground">Security Deposit</p>
                    <p className="font-medium text-foreground">
                      {formatPrice(product.attributes?.depositAmount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rental Duration</p>
                    <p className="font-medium text-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{" "}
                      {product.attributes?.minRental} -{" "}
                      {product.attributes?.maxRental} days
                    </p>
                  </div>
                </>
              )}

              {product.productType === ProductType.SERVICE && (
                <div>
                  <p className="text-muted-foreground">Service Duration</p>
                  <p className="font-medium text-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />{" "}
                    {product.attributes?.minRental} -{" "}
                    {product.attributes?.maxRental}{" "}
                    {product.attributes?.unit || "hours"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Location & Delivery */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location & Delivery
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Available in:</p>
                <div className="flex flex-wrap gap-2">
                  {/* FIX: Handle null districtName gracefully */}
                  {product.locations?.map((loc, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-muted rounded-md text-foreground"
                    >
                      {loc.cityName}
                      {loc.districtName && `, ${loc.districtName}`}
                    </span>
                  ))}
                </div>
              </div>

              {product.isDeliveryAvailable && (
                <div className="flex items-start gap-2 pt-2 border-t border-border">
                  <Truck className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Delivery Available
                    </p>
                    <p className="text-muted-foreground">
                      Delivery fee:{" "}
                      {product.deliveryFee
                        ? formatPrice(product.deliveryFee)
                        : "Contact Farmer"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Farmer Info */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden flex-shrink-0">
              {product.farmerProfilePictureUrl ? (
                <Image
                  src={product.farmerProfilePictureUrl}
                  alt={product.farmerName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{product.farmerName?.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {product.farmerName}
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                <span className="truncate">
                  {product.farmerAverageRating
                    ? `${product.farmerAverageRating.toFixed(1)} (${product.farmerTotalReviews || 0} reviews)`
                    : "New Seller"}
                </span>
              </div>
            </div>

            <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={
                addToCartMutation.isPending ||
                product.productType === ProductType.RENTABLE
              } // Disable for rentals in V1
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {addToCartMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                </>
              ) : addToCartMutation.isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  {product.productType === ProductType.RENTABLE
                    ? "Request Booking"
                    : "Add to Cart"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Description</h2>
        <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
          {product.description || "No description provided."}
        </p>
      </div>
    </div>
  );
}
