// types

export enum DeliveryMethod {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY'
}

export interface OrderCreateRequest {
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  buyerNotes?: string;
}

// Simplified response for the checkout success screen
// types/order.ts

export interface OrderItemResponse {
  id: string;
  productId: string;
  productTitleSnapshot: string; // Mapped from productTitleSnapshot
  unitPriceSnapshot: number;    // Mapped from unitPriceSnapshot
  requestedQty: number;
  approvedQty: number;
  subtotal: number;
  deliveryFee: number;
  imageUrls?: string[]; 
  attributesSnapshot?: {
    unit?: string;
    [key: string]: any;
  };
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  
  // Farmer & Buyer Info
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  
  // Delivery Details
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  buyerNotes?: string;
  farmerNotes?: string;
  
  // Items & Timestamps
  items: OrderItemResponse[];
  createdAt: string;
  
  // Conditional Unlocking (Only populated if status >= ACCEPTED)
  buyerMobile?: string | null;
  farmerMobile?: string | null;
}