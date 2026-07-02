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
    latitude: location?.latitude,
    longitude: location?.longitude,
    radiusKm: 50,
  });

  const { data: productPage, isLoading, refetch } = useProducts(filters);

  // ✅ Force refetch on mount to get fresh presigned URLs
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [refetch]);

  const handleFilterChange = (newFilters: ProductFilter) => {
    setFilters({
      ...newFilters,
      latitude: location?.latitude,
      longitude: location?.longitude,
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