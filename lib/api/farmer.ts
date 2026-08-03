import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

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