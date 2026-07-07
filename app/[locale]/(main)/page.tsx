"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useProducts } from '@/lib/api/products';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SearchFilterBar } from '@/components/products/SearchFilterBar';
import { ProductFilter } from '@/types/product';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function HomePage() {
  const t = useTranslations();
  const { location } = useGeolocation();
  
  const [filters, setFilters] = useState<ProductFilter>({
    page: 0,
    size: 12,
    // Don't set lat/lon initially - let user choose
    // latitude: location?.latitude,
    // longitude: location?.longitude,
    radiusKm: 50,
  });

  const { data: productPage, isLoading, refetch, error } = useProducts(filters);

  // Debug logging
  useEffect(() => {
    console.log('Products loaded:', productPage?.content?.length);
    if (productPage?.content?.[0]) {
      console.log('First product:', {
        title: productPage.content[0].title,
        imageUrls: productPage.content[0].imageUrls,
      });
    }
  }, [productPage]);

  const handleFilterChange = (newFilters: ProductFilter) => {
    setFilters({
      ...newFilters,
      // Only add location if user explicitly requested it
      latitude: newFilters.latitude || location?.latitude,
      longitude: newFilters.longitude || location?.longitude,
    });
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading products:', error);
    return (
      <div className="container px-4 py-8">
        <div className="text-destructive">
          Failed to load products. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('home.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('home.subtitle')}
        </p>
      </div>

      <SearchFilterBar 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="mt-8">
        <ProductGrid products={productPage?.content || []} />
      </div>
    </div>
  );
}