export interface BookingRequest {
  productId: string;
  startDate: string;
  endDate: string;
  quantity: number; 
  notes?: string;
}

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface Booking {
  id: string;
  productTitle: string;
  buyerName: string;
  buyerMobile?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  quantity: number;
  rentalAmount: number;
  depositAmount: number;
  totalAmount: number;
  status: BookingStatus;
  buyerNotes?: string;
  farmerNotes?: string;
  createdAt: string;
}