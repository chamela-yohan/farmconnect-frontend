export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  availableStock: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  qtyStep?: number;
  isDeliveryAvailable: boolean;
  deliveryFee?: number;
  expiryDate?: string;
  attributes?: Record<string, any>;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  farmerId: string;
  farmerName: string;
  imageUrls: string[];  
  videoUrl?: string;    
  lat?: number;
  lon?: number;
  distance?: number;
  createdAt: string;
  version: number;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'distance';
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  size?: number;
}

export interface ProductPage {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}