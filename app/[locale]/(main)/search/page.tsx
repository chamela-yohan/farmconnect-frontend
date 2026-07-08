"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import {
  useSearchProducts,
  useKeywordSuggestions,
  useCategories,
} from "@/lib/api/products";
import { useAllDistricts, useCities } from "@/lib/api/locations";
import { ProductCard } from "@/components/products/ProductCard";
import { Pagination } from "@/components/ui/Pagination";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { ProductType } from "@/types/product";
import {
  Search,
  SlidersHorizontal,
  Loader2,
  PackageOpen,
  MapPin,
  Truck,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";

export default function SearchPage() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  // --- BASIC FILTERS ---
  const [keyword, setKeyword] = useState("");
  const [productType, setProductType] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // --- LOCATION FILTERS ---
  const [locationMode, setLocationMode] = useState<"browse" | "gps">("browse");
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lon, setLon] = useState<number | undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [locationDistrictId, setLocationDistrictId] = useState<
    number | undefined
  >(undefined);
  const [locationDistrictName, setLocationDistrictName] = useState<string>("");
  const [locationCityName, setLocationCityName] = useState<string>("");

  // --- DELIVERY FILTERS ---
  const [isDeliveryAvailable, setIsDeliveryAvailable] =
    useState<boolean>(false);
  const [deliveryDistrictId, setDeliveryDistrictId] = useState<
    number | undefined
  >(undefined);
  const [deliveryDistrictName, setDeliveryDistrictName] = useState<string>("");

  // Pagination
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(0);

  // Fetch Data
  const { data: categories = [] } = useCategories();
  const { data: allDistricts = [] } = useAllDistricts();
  const { data: locationCities = [] } = useCities(locationDistrictId || null);

  // Keyword Suggestions
  const { data: suggestions = [] } = useKeywordSuggestions(keyword);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounce inputs
  const debouncedKeyword = useDebounce(keyword, 500);
  const debouncedLocationCityName = useDebounce(locationCityName, 500);

  // Handle City Selection -> Get Lat/Lon
  useEffect(() => {
    if (useMyLocation) {
      setIsLocating(true);
      // Clear old location data so UI doesn't show old products while fetching GPS
      queryClient.removeQueries({ queryKey: ["products", "search"] });
    } else {
      setIsLocating(false);
      setLat(undefined);
      setLon(undefined);
      setLocationError(null);
    }
  }, [useMyLocation, queryClient]);

  // Handle City Selection -> Get Lat/Lon
  useEffect(() => {
    if (debouncedLocationCityName) {
      const city = locationCities.find((c) => {
        const displayName = c.subNames?.en
          ? `${c.nameEn} - ${c.subNames.en}`
          : c.nameEn;
        return displayName === debouncedLocationCityName;
      });
      if (city) {
        setLat(city.latitude);
        setLon(city.longitude);
      }
    } else {
      // Only clear if we are not in GPS mode
      if (locationMode !== "gps") {
        setLat(undefined);
        setLon(undefined);
      }
    }
  }, [debouncedLocationCityName, locationCities, locationMode]);

  // Handle GPS Logic
  useEffect(() => {
    if (locationMode === "gps" && useMyLocation) {
      if (!navigator.geolocation) {
        setLocationError("Geolocation not supported");
        setIsLocating(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLon(position.coords.longitude);
          setLocationDistrictId(undefined);
          setLocationError(null);
          setIsLocating(false); //  GPS finished
        },
        (error) => {
          console.error("GPS Error:", error);
          setLocationError("Unable to retrieve location");
          setIsLocating(false); //  GPS failed, stop loading
          // Optional: Fallback to Colombo for testing
          // setLat(6.9271); setLon(79.8612);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }
  }, [locationMode, useMyLocation]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build Search Criteria
  const criteria = {
    keyword: debouncedKeyword || undefined,
    productType: productType || undefined,
    categoryId: categoryId || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    locationDistrictId: locationDistrictId,
    lat: lat,
    lon: lon,
    radiusKm: lat && lon ? radiusKm : undefined,
    isDeliveryAvailable: isDeliveryAvailable === true ? true : undefined,
    deliveryDistrictId: deliveryDistrictId,
    page,
    size: pageSize,
  };

  // FIX: Pass isLocationReady as the second argument
  const { data, isLoading, isError } = useSearchProducts(criteria);

  useEffect(() => {
    setPage(0);
  }, [
    debouncedKeyword,
    productType,
    categoryId,
    minPrice,
    maxPrice,
    locationDistrictId,
    debouncedLocationCityName,
    isDeliveryAvailable,
    deliveryDistrictId,
    pageSize,
    locationMode,
    lat,
    lon,
    radiusKm,
  ]);

  const handleClearFilters = () => {
    setKeyword("");
    setProductType("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
    setLocationMode("browse");
    setLocationDistrictId(undefined);
    setLocationDistrictName("");
    setLocationCityName("");
    setIsDeliveryAvailable(false);
    setDeliveryDistrictId(undefined);
    setDeliveryDistrictName("");
    setUseMyLocation(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Search Products
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* --- LEFT SIDEBAR: FILTERS --- */}
        <aside className="lg:col-span-1 space-y-6 bg-card p-4 rounded-xl border border-border h-fit sticky top-24">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" /> Filters
            </h2>
            <button
              onClick={handleClearFilters}
              className="text-xs text-primary hover:underline"
            >
              Clear All
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative" ref={searchContainerRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search keywords..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-9 pr-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-md max-h-60 overflow-auto">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setKeyword(s);
                      setShowSuggestions(false);
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Type & Category */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Product Type
            </label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value={ProductType.PHYSICAL_GOOD}>Physical Goods</option>
              <option value={ProductType.RENTABLE}>Rentals</option>
              <option value={ProductType.SERVICE}>Services</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Price Range (LKR)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* LOCATION FILTER (TABBED: BROWSE vs GPS) */}
          <div className="border-t border-border pt-4 space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Find Products In Area
            </label>

            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setLocationMode("browse")}
                className={`py-2 text-xs font-medium rounded-md transition-colors ${locationMode === "browse" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                🗺️ Browse Area
              </button>
              <button
                onClick={() => setLocationMode("gps")}
                className={`py-2 text-xs font-medium rounded-md transition-colors ${locationMode === "gps" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                {" "}
                Near Me (GPS)
              </button>
            </div>

            {locationMode === "browse" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    District
                  </label>
                  <SearchableCombobox
                    options={allDistricts.map((d) => d.nameEn)}
                    value={locationDistrictName}
                    onChange={(val) => {
                      setLocationDistrictName(val);
                      setLocationCityName("");
                      const district = allDistricts.find(
                        (d) => d.nameEn === val,
                      );
                      // CRITICAL: Set the ID directly from the found district
                      setLocationDistrictId(district ? district.id : undefined);
                    }}
                    placeholder="Search district..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    City (Optional for precise search)
                  </label>
                  <SearchableCombobox
                    options={locationCities.map((c) =>
                      c.subNames?.en
                        ? `${c.nameEn} - ${c.subNames.en}`
                        : c.nameEn,
                    )}
                    value={locationCityName}
                    onChange={setLocationCityName}
                    placeholder="Search city..."
                  />
                </div>
              </div>
            )}

            {locationMode === "gps" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useMyLocation}
                    onChange={(e) => setUseMyLocation(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Use my current location</span>
                </label>
                
                {/* Show loading state while GPS is fetching */}
                {isLocating && (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Acquiring GPS coordinates...</span>
                  </div>
                )}

                {useMyLocation && !isLocating && (
                  <>
                    {locationError ? (
                      <p className="text-xs text-destructive">{locationError}</p>
                    ) : (
                      <select
                        value={radiusKm}
                        onChange={(e) => setRadiusKm(Number(e.target.value))}
                        className="w-full h-9 px-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={5}>Within 5 km</option>
                        <option value={10}>Within 10 km</option>
                        <option value={25}>Within 25 km</option>
                        <option value={50}>Within 50 km</option>
                      </select>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* DELIVERY FILTER */}
          <div className="border-t border-border pt-4 space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Truck className="w-4 h-4" /> Delivery Options
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDeliveryAvailable}
                onChange={(e) => setIsDeliveryAvailable(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">
                Show only Delivery Available
              </span>
            </label>

            {isDeliveryAvailable && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Deliver TO this District
                </label>
                <SearchableCombobox
                  options={allDistricts.map((d) => d.nameEn)}
                  value={deliveryDistrictName}
                  onChange={(val) => {
                    setDeliveryDistrictName(val);
                    const district = allDistricts.find((d) => d.nameEn === val);
                    setDeliveryDistrictId(district ? district.id : undefined);
                  }}
                  placeholder="Select your district..."
                />
              </div>
            )}
          </div>
        </aside>

        {/* --- RIGHT CONTENT: PRODUCT GRID --- */}
        <main className="lg:col-span-3">
          {isLocating || isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-destructive">
              Failed to load products.
            </div>
          ) : data && data.content.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing {data.content.length} of {data.totalElements} results
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">
                    Results per page:
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="h-8 px-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={2}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {data &&
                  data.content.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>

              <div className="mt-8 pb-8">
                <Pagination
                  currentPage={data.number}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <PackageOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground">
                No products found
              </h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
