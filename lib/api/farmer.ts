import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { OrderResponse } from "@/types/order";
import { TopProductSummary } from "@/types/analytics";

export interface FarmerDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  activeProducts: number;
  averageRating: number;
}

export const useFarmerDashboardStats = () => {
  return useQuery({
    queryKey: ['farmer', 'analytics', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/farmer/analytics/dashboard');
      return data.data as FarmerDashboardStats;
    },
    // Cache for 5 minutes on the client side to match backend caching
    staleTime: 1000 * 60 * 5, 
  });
};

import { MonthlyStat } from "@/types/analytics";

export const useFarmerMonthlyStats = () => {
  return useQuery({
    queryKey: ["farmer", "analytics", "monthly-stats"],
    queryFn: async () => {
      const { data } = await api.get("/farmer/analytics/monthly-stats");
      return data.data as MonthlyStat[];
    },
    staleTime: 1000 * 60 * 5,
  });
};


export const useFarmerRecentOrders = () => {
  return useQuery({
    queryKey: ["farmer", "analytics", "recent-orders"],
    queryFn: async () => {
      const { data } = await api.get("/farmer/analytics/recent-orders");
      return data.data as OrderResponse[];
    },
    staleTime: 1000 * 60 * 2, // shorter than the stats queries — status changes more often
  });
};

export const useFarmerTopProducts = () => {
  return useQuery({
    queryKey: ["farmer", "analytics", "top-products"],
    queryFn: async () => {
      const { data } = await api.get("/farmer/analytics/top-products");
      return data.data as TopProductSummary[];
    },
    staleTime: 1000 * 60 * 5,
  });
};