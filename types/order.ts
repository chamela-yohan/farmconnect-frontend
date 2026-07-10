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
export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  farmerName: string;
}