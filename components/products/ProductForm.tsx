"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ProductType, ProductFormData } from "@/types/product";
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Package,
  Wrench,
  Users,
  Calendar,
  Truck,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { useCategories } from "@/lib/api/products";
import {
  useProvinces,
  useDistricts,
  useCities,
  useAllDistricts,
} from "@/lib/api/locations";

interface ProductFormProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  images: File[];
  setImages: (images: File[]) => void;
  video: File | undefined;
  setVideo: (video: File | undefined) => void;
  onNext: () => void;
}

export function ProductForm({
  formData,
  setFormData,
  images,
  setImages,
  video,
  setVideo,
  onNext,
}: ProductFormProps) {
  const t = useTranslations("products");
  const locale = useLocale(); // Added missing locale hook
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data Fetching Hooks
  const { data: categories = [] } = useCategories();
  const { data: provinces = [] } = useProvinces();
  const { data: allDistricts = [] } = useAllDistricts();
  const { data: districts = [] } = useDistricts(formData.selectedProvinceId || null); // Added missing districts hook
  const { data: cities = [] } = useCities(formData.selectedDistrictId || null);

  // Helper: Get context-aware labels based on product type
  const getLabels = () => {
    switch (formData.productType) {
      case ProductType.PHYSICAL_GOOD:
        return {
          minOrderQty: "Minimum Order Quantity",
          maxOrderQty: "Maximum Order Quantity",
          qtyStep: "Quantity Increment",
          unit: "Unit of Measurement",
          deliveryFee: "Delivery Fee",
          price: "Price per Unit",
          stock: "Available Stock",
          minRental: null,
          maxRental: null,
        };
      case ProductType.RENTABLE:
        return {
          minOrderQty: "Minimum Items per Order",
          maxOrderQty: "Maximum Items per Order",
          qtyStep: "Item Increment",
          unit: "Unit (Locked to pcs)",
          deliveryFee: "Equipment Transport Fee",
          price: "Base Price (Optional)",
          stock: "Number of Units Available",
          minRental: "Minimum Rental Period (Days)",
          maxRental: "Maximum Rental Period (Days)",
        };
      case ProductType.SERVICE:
        return {
          minOrderQty: "Minimum Booking Qty",
          maxOrderQty: "Maximum Booking Qty",
          qtyStep: "Booking Increment",
          unit: "Service Unit (hours, acres)",
          deliveryFee: "Travel / Site Visit Fee",
          price: "Price per Service",
          stock: "Available Capacity / Slots",
          minRental: "Minimum Booking Duration",
          maxRental: "Maximum Booking Duration",
        };
      default:
        return {};
    }
  };

  const formatLocationName = (
    nameEn: string,
    nameSi: string,
    nameTa: string,
    currentLocale: string,
  ) => {
    if (currentLocale === "si") return nameSi;
    if (currentLocale === "ta") return nameTa;
    return nameEn;
  };

  const labels = getLabels();

  const handleAttributeChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        [key]: value,
      },
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 3)
      newErrors.title = "Title must be at least 3 characters";
    if (!formData.description || formData.description.length < 10)
      newErrors.description = "Description must be at least 10 characters";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Price must be greater than 0";

    if (!formData.availableStock || formData.availableStock <= 0) {
      newErrors.availableStock = "Available capacity/stock is required";
    }

    if (formData.productType === ProductType.PHYSICAL_GOOD) {
      if (!formData.unit) newErrors.unit = "Unit is required";
      if (formData.expiryDate && new Date(formData.expiryDate) < new Date()) {
        newErrors.expiryDate = "Expiry date cannot be in the past";
      }
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a valid category";
    }

    if (formData.productType === ProductType.RENTABLE) {
      if (!formData.rentalPricePerDay || formData.rentalPricePerDay <= 0) {
        newErrors.rentalPricePerDay = "Rental price per day is required";
      }
      if (!formData.minRental || formData.minRental < 1) {
        newErrors.minRental = "Minimum rental days is required";
      }
    }

    if (formData.productType === ProductType.SERVICE) {
      if (!formData.minRental || formData.minRental < 1) {
        newErrors.minRental = "Minimum booking duration is required";
      }
    }

    // Moved location/delivery validation inside the function
    if (!formData.locationCityIds || formData.locationCityIds.length === 0) {
      newErrors.locationCityIds = "At least one product location is required";
    }

    if (
      formData.isDeliveryAvailable &&
      (!formData.deliveryDistrictIds || formData.deliveryDistrictIds.length === 0)
    ) {
      newErrors.deliveryDistrictIds = "Select at least one delivery district";
    }

    if (images.length === 0) newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) onNext();
  };

  return (
    <div className="space-y-8">
      {/* 1. PRODUCT TYPE SELECTION */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b pb-2">1. Product Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button type="button" onClick={() => setFormData({ ...formData, productType: ProductType.PHYSICAL_GOOD, unit: "" })} className={`p-6 rounded-lg border-2 transition-all ${formData.productType === ProductType.PHYSICAL_GOOD ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-muted-foreground/50 text-muted-foreground"}`}>
            <Package className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium text-center">Physical Good</div>
          </button>
          <button type="button" onClick={() => setFormData({ ...formData, productType: ProductType.RENTABLE, unit: "pcs" })} className={`p-6 rounded-lg border-2 transition-all ${formData.productType === ProductType.RENTABLE ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-muted-foreground/50 text-muted-foreground"}`}>
            <Wrench className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium text-center">Rentable</div>
          </button>
          <button type="button" onClick={() => setFormData({ ...formData, productType: ProductType.SERVICE, unit: "hour" })} className={`p-6 rounded-lg border-2 transition-all ${formData.productType === ProductType.SERVICE ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-muted-foreground/50 text-muted-foreground"}`}>
            <Users className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium text-center">Service</div>
          </button>
        </div>
      </section>

      {/* 2. BASIC INFORMATION */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b pb-2">2. Basic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Fresh Organic Mangoes" />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description *</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" rows={3} placeholder="Describe your product..." />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Category *</label>
            <SearchableCombobox
              options={categories.map((c) => c.name)}
              value={categories.find((c) => c.id === formData.categoryId)?.name || ""}
              onChange={(selectedName) => {
                const selectedCategory = categories.find((c) => c.name === selectedName);
                if (selectedCategory) setFormData({ ...formData, categoryId: selectedCategory.id });
              }}
              placeholder="Search or select a category..."
            />
            {errors.categoryId && <p className="text-sm text-destructive mt-1">{errors.categoryId}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">{labels.unit}</label>
            <select
              value={formData.productType === ProductType.RENTABLE ? "pcs" : (formData.unit || "")}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              disabled={formData.productType === ProductType.RENTABLE}
              className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
            >
              <option value="">Select unit</option>
              {formData.productType === ProductType.PHYSICAL_GOOD && (<><option value="kg">Kilogram (kg)</option><option value="pcs">Pieces (pcs)</option><option value="liter">Liter</option><option value="box">Box/Crate</option></>)}
              {formData.productType === ProductType.RENTABLE && (<option value="pcs">Pieces / Items (pcs)</option>)}
              {formData.productType === ProductType.SERVICE && (<><option value="hour">Hour</option><option value="day">Day</option><option value="acre">Acre</option><option value="session">Session</option></>)}
            </select>
            {errors.unit && <p className="text-sm text-destructive mt-1">{errors.unit}</p>}
          </div>
        </div>
      </section>

      {/* 3. PRICING & AVAILABILITY */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b pb-2">3. Pricing & Availability</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{labels.price} *</label>
            <input type="number" step="0.01" min="0" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
            {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">{labels.stock} *</label>
            <input type="number" step="0.01" min="0" value={formData.availableStock || ""} onChange={(e) => setFormData({ ...formData, availableStock: Number(e.target.value) })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder={formData.productType === ProductType.PHYSICAL_GOOD ? "100" : "5"} />
            {errors.availableStock && <p className="text-sm text-destructive mt-1">{errors.availableStock}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {formData.productType === ProductType.PHYSICAL_GOOD && "Total quantity available (e.g., 100 kg)."}
              {formData.productType === ProductType.RENTABLE && "How many items do you have to rent out? (e.g., 5 tractors)."}
              {formData.productType === ProductType.SERVICE && "How many technicians or slots are available?"}
            </p>
          </div>

          {formData.productType === ProductType.PHYSICAL_GOOD && (
            <div>
              <label className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> Expiry Date</label>
              <input type="date" value={formData.expiryDate || ""} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              {errors.expiryDate && <p className="text-sm text-destructive mt-1">{errors.expiryDate}</p>}
            </div>
          )}

          {formData.productType === ProductType.RENTABLE && (
            <>
              <div>
                <label className="text-sm font-medium">Rental Price / Day *</label>
                <input type="number" step="0.01" min="0" value={formData.rentalPricePerDay || ""} onChange={(e) => setFormData({ ...formData, rentalPricePerDay: Number(e.target.value) })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
                {errors.rentalPricePerDay && <p className="text-sm text-destructive mt-1">{errors.rentalPricePerDay}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Security Deposit</label>
                <input type="number" step="0.01" min="0" value={formData.depositAmount || ""} onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
              </div>
            </>
          )}

          {(formData.productType === ProductType.RENTABLE || formData.productType === ProductType.SERVICE) && (
            <>
              <div>
                <label className="text-sm font-medium">{labels.minRental} *</label>
                <input type="number" min="1" value={formData.minRental || ""} onChange={(e) => setFormData({ ...formData, minRental: Number(e.target.value) })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder={formData.productType === ProductType.RENTABLE ? "1" : "2"} />
                {errors.minRental && <p className="text-sm text-destructive mt-1">{errors.minRental}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">{labels.maxRental}</label>
                <input type="number" min="1" value={formData.maxRental || ""} onChange={(e) => setFormData({ ...formData, maxRental: Number(e.target.value) })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder={formData.productType === ProductType.RENTABLE ? "30" : "8"} />
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4. TRADING RULES */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b pb-2">4. Trading Rules (Optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">{labels.minOrderQty}</label>
            <input type="number" step="0.01" value={formData.minOrderQty || ""} onChange={(e) => setFormData({ ...formData, minOrderQty: Number(e.target.value) })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="1" />
          </div>
          <div>
            <label className="text-sm font-medium">{labels.maxOrderQty}</label>
            <input type="number" step="0.01" value={formData.maxOrderQty || ""} onChange={(e) => setFormData({ ...formData, maxOrderQty: Number(e.target.value) })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="50" />
          </div>
          <div>
            <label className="text-sm font-medium">{labels.qtyStep}</label>
            <input type="number" step="0.01" value={formData.qtyStep || ""} onChange={(e) => setFormData({ ...formData, qtyStep: Number(e.target.value) })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="1" />
          </div>
        </div>
      </section>

      {/* 5. DELIVERY OPTIONS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
          <Truck className="w-5 h-5" /> 5. {formData.productType === ProductType.SERVICE ? "Travel" : "Delivery"}
        </h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={formData.isDeliveryAvailable} onChange={(e) => setFormData({ ...formData, isDeliveryAvailable: e.target.checked })} className="w-4 h-4 rounded border-border" />
          <span className="text-sm font-medium text-foreground">
            {formData.productType === ProductType.SERVICE ? "I can travel to the customer location" : formData.productType === ProductType.RENTABLE ? "I can deliver/transport this equipment" : "I can deliver this product"}
          </span>
        </label>
        {formData.isDeliveryAvailable && (
          <div>
            <label className="text-sm font-medium">{labels.deliveryFee}</label>
            <input type="number" step="0.01" min="0" value={formData.deliveryFee || ""} onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
          </div>
        )}
      </section>

      {/* 6. PRODUCT LOCATIONS (Cascading Dropdowns) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5" /> 6. Product Availability Locations
        </h2>
        <p className="text-sm text-muted-foreground">Where is this product available? Add multiple locations if needed.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Province *</label>
            <select value={formData.selectedProvinceId || ""} onChange={(e) => setFormData({ ...formData, selectedProvinceId: Number(e.target.value) || undefined, selectedDistrictId: undefined })} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>{formatLocationName(province.nameEn, province.nameSi, province.nameTa, locale)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">District *</label>
            <select value={formData.selectedDistrictId || ""} onChange={(e) => setFormData({ ...formData, selectedDistrictId: Number(e.target.value) || undefined })} disabled={!formData.selectedProvinceId} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed">
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>{formatLocationName(district.nameEn, district.nameSi, district.nameTa, locale)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">City *</label>
            <select value="" onChange={(e) => { const cityId = Number(e.target.value); if (cityId && !formData.locationCityIds?.includes(cityId)) { setFormData({ ...formData, locationCityIds: [...(formData.locationCityIds || []), cityId] }); } e.target.value = ""; }} disabled={!formData.selectedDistrictId} className="w-full h-11 px-3 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed">
              <option value="">Select City to Add</option>
              {cities.map((city) => {
                const subName = city.subNames?.en || "";
                const displayName = subName ? `${city.nameEn} - ${subName}` : city.nameEn;
                return <option key={city.id} value={city.id}>{formatLocationName(displayName, city.nameSi, city.nameTa, locale)}</option>;
              })}
            </select>
          </div>
        </div>

        {formData.locationCityIds && formData.locationCityIds.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Locations:</label>
            <div className="flex flex-wrap gap-2">
              {formData.locationCityIds.map((cityId) => {
                const city = cities.find((c) => c.id === cityId);
                if (!city) return null;
                const subName = city.subNames?.en || "";
                const displayName = subName ? `${city.nameEn} - ${subName}` : city.nameEn;
                return (
                  <div key={cityId} className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{formatLocationName(displayName, city.nameSi, city.nameTa, locale)}</span>
                    <button type="button" onClick={() => setFormData({ ...formData, locationCityIds: formData.locationCityIds?.filter((id) => id !== cityId) || [] })} className="text-destructive hover:text-destructive/80">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {errors.locationCityIds && <p className="text-sm text-destructive mt-1">{errors.locationCityIds}</p>}
      </section>

      {/* 7. DELIVERY AREAS (District Checkboxes) */}
      {formData.isDeliveryAvailable && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
            <Truck className="w-5 h-5" /> 7. Delivery Coverage Areas
          </h2>
          <p className="text-sm text-muted-foreground">Select all districts where you can deliver this product.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allDistricts.map((district) => (
              <label key={district.id} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <input type="checkbox" checked={formData.deliveryDistrictIds?.includes(district.id) || false} onChange={(e) => {
                  if (e.target.checked) setFormData({ ...formData, deliveryDistrictIds: [...(formData.deliveryDistrictIds || []), district.id] });
                  else setFormData({ ...formData, deliveryDistrictIds: formData.deliveryDistrictIds?.filter((id) => id !== district.id) || [] });
                }} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                <span className="text-sm font-medium">{formatLocationName(district.nameEn, district.nameSi, district.nameTa, locale)}</span>
              </label>
            ))}
          </div>
          {formData.deliveryDistrictIds && formData.deliveryDistrictIds.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">Selected: {formData.deliveryDistrictIds.length} district(s)</p>
          )}
          {errors.deliveryDistrictIds && <p className="text-sm text-destructive mt-1">{errors.deliveryDistrictIds}</p>}
        </section>
      )}

      {/* 8. MEDIA UPLOAD */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground border-b pb-2">8. Media</h2>
        <div>
          <label className="text-sm font-medium mb-2 block">Product Images * (Max 5)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {images.map((file, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                <Image src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} fill className="object-cover" />
                <button type="button" onClick={() => setImages(images.filter((_, i) => i !== index))} className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="relative aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground text-center px-2">{images.length === 0 ? "Add Images" : "Add More"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { const files = Array.from(e.target.files || []); setImages([...images, ...files].slice(0, 5)); }} className="hidden" />
              </label>
            )}
          </div>
          {errors.images && <p className="text-sm text-destructive mt-1">{errors.images}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Product Video (Optional)</label>
          {video ? (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Video className="w-8 h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{video.name}</p>
                <p className="text-xs text-muted-foreground">{(video.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" onClick={() => setVideo(undefined)} className="p-2 hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Upload Video</p>
                <p className="text-xs text-muted-foreground">MP4, MOV. Max 50MB</p>
              </div>
              <input type="file" accept="video/mp4,video/quicktime" onChange={(e) => { const file = e.target.files?.[0]; if (file) { if (file.size > 50 * 1024 * 1024) { alert("Video must be less than 50MB"); return; } setVideo(file); } }} className="hidden" />
            </label>
          )}
        </div>
      </section>

      <button type="button" onClick={handleNext} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors">
        Continue to Review
      </button>
    </div>
  );
}