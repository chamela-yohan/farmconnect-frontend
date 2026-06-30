"use client";

import { Product } from '@/types/product';
import { Star, MapPin, ShoppingCart, Play } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('products');
  const locale = useLocale();  // ✅ Get current locale

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get first image or use placeholder
  const primaryImage = product.imageUrls?.[0];
  const hasVideo = !!product.videoUrl;
  const totalMediaCount = (product.imageUrls?.length || 0) + (hasVideo ? 1 : 0);

  return (
    <Link
      href={`/${locale}/products/${product.id}`}  // ✅ Add locale to URL
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-4xl">🥬</span>
          </div>
        )}

        {/* Video Badge */}
        {hasVideo && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
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

        {/* Stock Badge */}
        {product.availableStock && product.availableStock < 10 && product.availableStock > 0 && (
          <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full">
            {t('card.lowStock')}
          </div>
        )}

        {(!product.availableStock || product.availableStock === 0) && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-destructive font-semibold">{t('card.outOfStock')}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
          <span className="text-xs text-muted-foreground">/ kg</span>
        </div>

        {/* Farmer Info */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-primary">
              {product.farmerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {product.farmerName}
            </p>
          </div>
          {product.distance !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{product.distance.toFixed(1)} km</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            console.log('Add to cart:', product.id);
          }}
          disabled={!product.availableStock || product.availableStock === 0}
          className="w-full mt-2 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-sm font-medium">{t('card.addToCart')}</span>
        </button>
      </div>
    </Link>
  );
}