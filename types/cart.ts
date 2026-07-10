export interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  productType: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrls: string[]; // Added
  
  // Trading Rules for Frontend Validation
  qtyStep?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  availableStock?: number;
}

export interface CartResponse {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}