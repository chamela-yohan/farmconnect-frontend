"use client";

import { Search, Filter, X, MapPin, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useCategories } from '@/lib/api/products';
import { ProductFilter } from '@/types/product';
import { useGeolocation } from '@/hooks/useGeolocation';

interface SearchFilterBarProps {
  filters: ProductFilter;
  onFilterChange: (filters: ProductFilter) => void;
}

export function SearchFilterBar({ filters, onFilterChange }: SearchFilterBarProps) {
  const t = useTranslations('products');
  const { data: categories = [] } = useCategories();
  const [showFilters, setShowFilters] = useState(false);
  const { location, loading: locationLoading, error: locationError, requestLocation, hasPermission } = useGeolocation();

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value, page: 0 });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category: category || undefined, page: 0 });
  };

  const handleSortChange = (sortBy: string) => {
    onFilterChange({ ...filters, sortBy: sortBy as ProductFilter['sortBy'] || undefined, page: 0 });
  };

  const handleRadiusChange = (radius: number) => {
    onFilterChange({ ...filters, radiusKm: radius || undefined, page: 0 });
  };

  const handleUseMyLocation = () => {
    requestLocation();
  };

  // Update filters when location changes
  useState(() => {
    if (location) {
      onFilterChange({
        ...filters,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  });

  const clearFilters = () => {
    onFilterChange({ 
      page: 0, 
      size: 12,
      latitude: location?.latitude,
      longitude: location?.longitude,
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.sortBy || filters.radiusKm;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-11 px-4 rounded-lg border transition-colors flex items-center gap-2 ${
            showFilters || hasActiveFilters
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-foreground hover:bg-muted'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">{t('filters.button')}</span>
        </button>
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {locationError}
        </div>
      )}

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          {/* Location Section */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('filters.location')}
            </label>
            
            {hasPermission && location ? (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {t('filters.usingCurrentLocation')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                </div>
                <button
                  onClick={handleUseMyLocation}
                  disabled={locationLoading}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {locationLoading ? t('filters.updating') : t('filters.refresh')}
                </button>
              </div>
            ) : (
              <button
                onClick={handleUseMyLocation}
                disabled={locationLoading}
                className="w-full h-11 bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
              >
                <Navigation className="w-5 h-5" />
                <span className="font-medium">
                  {locationLoading ? t('filters.gettingLocation') : t('filters.useMyLocation')}
                </span>
              </button>
            )}

            {/* Radius Filter */}
            {hasPermission && location && (
              <div className="mt-3">
                <label className="text-sm text-muted-foreground mb-2 block">
                  {t('filters.searchRadius')}: {filters.radiusKm || 50} km
                </label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={filters.radiusKm || 50}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 km</span>
                  <span>200 km</span>
                </div>
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('filters.category')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !filters.category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {t('filters.all')}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.category === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('filters.sortBy')}
            </label>
            <select
              value={filters.sortBy || ''}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('filters.default')}</option>
              <option value="price_asc">{t('filters.priceLowToHigh')}</option>
              <option value="price_desc">{t('filters.priceHighToLow')}</option>
              <option value="newest">{t('filters.newest')}</option>
              <option value="distance">{t('filters.nearest')}</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full h-10 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">{t('filters.clear')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}