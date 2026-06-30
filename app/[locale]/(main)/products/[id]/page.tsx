"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useProduct } from '@/lib/api/products';
import { Star, MapPin, ShoppingCart, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const t = useTranslations();
  const { id } = params;
  
  const { data: product, isLoading, error } = useProduct(id as string);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="aspect-square bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container px-4 py-16 text-center">
        <p className="text-destructive">{t('products.detail.notFound')}</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">
          {t('products.detail.backToHome')}
        </Link>
      </div>
    );
  }

  // Combine images and video
  const allMedia = [
    ...(product.imageUrls || []),
    ...(product.videoUrl ? [product.videoUrl] : [])
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const isVideo = (index: number) => {
    return product.videoUrl && product.imageUrls.length + (product.videoUrl ? 1 : 0) - 1 === index;
  };

  return (
    <div className="container px-4 py-6">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-5 h-5" />
        <span>{t('products.detail.back')}</span>
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image/Video */}
          <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
            {allMedia.length > 0 ? (
              isVideo(currentImageIndex) ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <video
                    src={product.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    autoPlay
                  />
                </div>
              ) : (
                <Image
                  src={allMedia[currentImageIndex]}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-6xl">🥬</span>
              </div>
            )}

            {/* Navigation Arrows */}
            {allMedia.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {allMedia.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1} / {allMedia.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {allMedia.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allMedia.map((mediaUrl, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-primary' : 'border-border'
                  }`}
                >
                  {isVideo(index) ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <Image
                      src={mediaUrl}
                      alt={`${product.title} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.title}</h1>
          </div>

          <div className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
            <span className="text-lg text-muted-foreground font-normal"> / kg</span>
          </div>

          <p className="text-foreground leading-relaxed">{product.description}</p>

          {/* Stock Info */}
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('products.detail.availability')}:</span>
              <span className={`font-medium ${product.availableStock && product.availableStock > 0 ? 'text-primary' : 'text-destructive'}`}>
                {product.availableStock && product.availableStock > 0 
                  ? `${product.availableStock} kg ${t('products.detail.inStock')}` 
                  : t('products.detail.outOfStock')}
              </span>
            </div>
          </div>

          {/* Farmer Info */}
          <div className="p-4 bg-card border border-border rounded-lg space-y-3">
            <h3 className="font-semibold text-foreground">{t('products.detail.soldBy')}</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-medium text-primary">
                  {product.farmerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{product.farmerName}</p>
              </div>
            </div>
            {product.distance !== undefined && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                <MapPin className="w-4 h-4" />
                <span>{product.distance.toFixed(1)} km {t('products.detail.away')}</span>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            disabled={!product.availableStock || product.availableStock === 0}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            <ShoppingCart className="w-6 h-6" />
            <span>{t('products.detail.addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}