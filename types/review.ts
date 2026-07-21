export interface ReviewCreateRequest {
  orderId: string;
  rating: number; // 1 to 5
  comment?: string;
}

export interface ReviewResponse {
  id: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}