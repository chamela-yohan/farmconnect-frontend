export enum ProductType {
  PHYSICAL_GOOD = 'PHYSICAL_GOOD',
  RENTABLE = 'RENTABLE',
  SERVICE = 'SERVICE',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  SUSPENDED = 'SUSPENDED',
}


// Matches backend District entity (simplified for delivery areas)
export interface District {
  id: number;
  nameEn: string;
  nameSi?: string;
  nameTa?: string;
}

// 1. Fix the Location interface to match the JSON
export interface ProductLocation {
  cityId: number;
  cityName: string;
  districtId: number;
  districtName: string | null; // Allow null so TypeScript doesn't complain
}

// 2. Update the main Product interface
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  productType: ProductType;
  status: ProductStatus;
  version: number;

  minOrderQty?: number;
  maxOrderQty?: number;
  qtyStep?: number;

  isDeliveryAvailable: boolean;
  deliveryFee?: number;

  categoryId?: string;
  categoryName?: string;

  attributes?: Record<string, any>;

  imageUrls: string[];
  videoUrl?: string | null;

  // Match the exact JSON keys
  locations?: ProductLocation[];
  deliveryDistrictIds?: number[]; // It's an array of numbers, not District objects

  farmerId: string;
  farmerName: string;
  farmerAverageRating: number;
  farmerTotalReviews: number;
  farmerProfilePictureUrl?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ProductFilter {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  productType?: ProductType; // NEW: Filter by product type
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price_asc' | 'price_desc' | 'distance' | 'newest';
  isDeliveryAvailable?: boolean;
}

export interface ProductPage {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface ProductFormData {
  // Basic Information
  title: string;
  description: string;
  price: number;
  productType: ProductType;
  
  // Common Trading Rules (Apply to all types)
  minOrderQty?: number;
  maxOrderQty?: number;
  qtyStep?: number;
  
  // Delivery
  isDeliveryAvailable: boolean;
  deliveryFee?: number;
  
  // Physical Good Specifics (Stored in JSONB 'attributes')
  availableStock?: number;
  unit?: string;
  expiryDate?: string; // ISO Date string (YYYY-MM-DD)
  
  // Rentable Specifics (Stored in JSONB 'attributes')
  rentalPricePerDay?: number;
  depositAmount?: number;
  
  // Unified Rental/Service Bounds (Stored in JSONB 'attributes')
  // Replaces old minRentalDays, maxRentalDays, and serviceDurationHours
  minRental?: number; // e.g., Min 1 day for tractor, Min 2 hours for service
  maxRental?: number; // e.g., Max 30 days for tractor, Max 8 hours for service
  
  // Flexible JSON Data (Holds 'category' and other custom attributes)
  attributes?: Record<string, any>; 

  categoryId?: string; 
  
  selectedProvinceId?: number;
  selectedDistrictId?: number;
  locationCityIds?: number[]; // Array of city IDs
  
  // Delivery Areas (Multiple Districts)
  deliveryDistrictIds?: number[]
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}


export interface ProductSearchCriteria {
  keyword?: string;
  categoryId?: string;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lon?: number;
  radiusKm?: number;
  isDeliveryAvailable?:boolean
  deliveryDistrictId?: number;
  locationDistrictId?:number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}