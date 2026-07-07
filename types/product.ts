export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  version: number;
  
  // Common fields
  availableStock?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  qtyStep?: number;
  isDeliveryAvailable: boolean;
  deliveryFee?: number;
  expiryDate?: string;
  
  // NEW: Product Type fields
  productType: ProductType;
  unit?: string;
  
  // NEW: Rental fields
  rentalPricePerDay?: number;
  depositAmount?: number;
  minRentalDays?: number;
  maxRentalDays?: number;
  
  // NEW: Service fields
  serviceDurationHours?: number;
  
  // Media
  imageUrls: string[];
  videoUrl?: string;
  
  // Attributes
  attributes?: Record<string, any>;
  
  // Status & Farmer
  status: ProductStatus;
  farmerId: string;
  farmerName: string;
  
  //  NEW: Distance (calculated during location-based search)
  distance?: number;
  
  createdAt: string;
  updatedAt: string;
}

export enum ProductType {
  PHYSICAL_GOOD = 'PHYSICAL_GOOD',
  RENTABLE = 'RENTABLE',
  SERVICE = 'SERVICE',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
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
