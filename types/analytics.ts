export interface MonthlyStat {
  month: string;
  revenue: number;
  orderCount: number;
}

export interface TopProductSummary {
  productId: string;
  title: string;
  totalRevenue: number;
  totalQuantitySold: number;
}