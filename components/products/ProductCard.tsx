"use client";

import { Product, ProductType } from "@/types/product";
import { Star, MapPin, ShoppingCart, Play, Edit, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
  onDelete?: () => void;
}

export function ProductCard({ product, showActions = false, onDelete }: ProductCardProps) {
  const t = useTranslations("products");
  const locale = useLocale();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Extract stock and unit from the new attributes JSONB structure
  const stock = product.attributes?.availableStock;
  const unit = product.attributes?.unit;

  const primaryImage = product.imageUrls?.[0];
  const hasVideo = !!product.videoUrl;
  const totalMediaCount = (product.imageUrls?.length || 0) + (hasVideo ? 1 : 0);

  const getProductTypeBadge = () => {
    switch (product.productType) {
      case ProductType.PHYSICAL_GOOD:
        return { label: "Product", color: "bg-blue-500" };
      case ProductType.RENTABLE:
        return { label: "Rental", color: "bg-purple-500" };
      case ProductType.SERVICE:
        return { label: "Service", color: "bg-green-500" };
      default:
        return { label: "Product", color: "bg-blue-500" };
    }
  };

  const typeBadge = getProductTypeBadge();

  // Dynamic unit label based on product type and attributes
  const getUnitLabel = () => {
    if (product.productType === ProductType.RENTABLE) return "/ day";
    if (unit) return ` / ${unit}`;
    return "";
  };

  return (
    <div className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/${locale}/products/${product.id}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const placeholder = document.createElement("div");
                placeholder.className = "w-full h-full bg-muted flex items-center justify-center";
                placeholder.innerHTML = '<span class="text-6xl">🥬</span>';
                target.parentElement?.appendChild(placeholder);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🥬</span>
            </div>
          )}

          {/* Product Type Badge */}
          <div className={`absolute top-2 left-2 ${typeBadge.color} text-white text-xs font-medium px-2 py-1 rounded-full`}>
            {typeBadge.label}
          </div>

          {/* Video Badge */}
          {hasVideo && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <Play className="w-3 h-3" />
              <span>Video</span>
            </div>
          )}

          {/* Media Count Badge */}
          {totalMediaCount > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full">
              {totalMediaCount}
            </div>
          )}

          {/* Stock Badge (Reads from attributes) */}
          {product.productType === ProductType.PHYSICAL_GOOD && 
           stock && stock < 10 && stock > 0 && (
            <div className="absolute top-12 left-2 bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full">
              {t("card.lowStock")}
            </div>
          )}

          {product.productType === ProductType.PHYSICAL_GOOD &&
           (!stock || stock === 0) && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-destructive font-semibold">
                {t("card.outOfStock")}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
          </div>

          {/* Price with Dynamic Unit */}
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted-foreground">
              {getUnitLabel()}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-primary">
                {product.farmerName?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {product.farmerName || "Unknown Farmer"}
              </p>
            </div>
            {product.distance !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{product.distance.toFixed(1)} km</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons (Only for farmer's own products) */}
      {showActions && (
        <div className="flex gap-2 p-3 pt-0">
          <Link
            href={`/${locale}/products/${product.id}/edit`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm font-medium">Edit</span>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete?.();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}