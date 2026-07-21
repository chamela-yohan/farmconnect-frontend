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
  productTitle: string;
  unitPrice: number;
  requestedQty: number;
  approvedQty: number;
  subtotal: number;
  imageUrls?: string[]; 
  attributesSnapshot?: {
    unit?: string; 
    [key: string]: any; // Allow other custom attributes
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

// types/order.ts

// Define the exact states from your backend enum
export type OrderStatus = 
 | 'PENDING'
 | 'ACCEPTED'
 | 'PREPARING'
 | 'OUT_FOR_DELIVERY'
 | 'READY_FOR_PICKUP'
 | 'DELIVERED'
 | 'COMPLETED'
 | 'REJECTED'
 | 'CANCELLED'
;

// The payload sent to the backend when a farmer updates an order
export interface OrderStatusUpdateRequest {
  newStatus: OrderStatus;
  notes?: string; // Optional: Used for rejection reasons or delivery updates
}