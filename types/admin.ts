export interface AdminProductSummary {
  id: string;
  title: string;
  price: number;
  status: "ACTIVE" | "SOLD_OUT" | "INACTIVE";
  isDeleted: boolean;
  farmerName: string;
  categoryName: string;
}