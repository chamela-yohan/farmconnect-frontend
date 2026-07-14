export interface BookingRequest {
  productId: string;
  startDate: string;
  endDate: string;
  quantity: number; 
  notes?: string;
}

export interface Booking {
  id: string;
  productId: string;
  productTitle: string;
  buyerName: string;
  farmerName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  rentalAmount: number;
  depositAmount: number;
  totalAmount: number;
  status: string;
  buyerNotes?: string;
  createdAt: string;
}