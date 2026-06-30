"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SearchFilterBar } from '@/components/products/SearchFilterBar';
import { useProducts } from '@/lib/api/products';
import { ProductFilter } from '@/types/product';

export default function HomePage() {
  const t = useTranslations('home');
  const [filters, setFilters] = useState<ProductFilter>({
    page: 0,
    size: 12,
  });

  const { data, isLoading, error } = useProducts(filters);

  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Search & Filter */}
      <SearchFilterBar filters={filters} onFilterChange={setFilters} />

      {/* Product Grid */}
      {error ? (
        <div className="text-center py-16">
          <p className="text-destructive">{t('error')}</p>
        </div>
      ) : (
        <ProductGrid products={data?.content || []} isLoading={isLoading} />
      )}

      {/* Pagination (Future Enhancement) */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={filters.page === 0}
            onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
            className="px-4 py-2 bg-card border border-border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-muted-foreground">
            Page {(filters.page || 0) + 1} of {data.totalPages}
          </span>
          <button
            disabled={filters.page! >= data.totalPages - 1}
            onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
            className="px-4 py-2 bg-card border border-border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}