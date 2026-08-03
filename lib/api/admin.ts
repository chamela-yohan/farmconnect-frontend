import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { MonthlyStat } from "@/types/analytics";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isAccountNonLocked: boolean;
}

export interface AdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
}

export const useAdminUsers = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['admin', 'users', page, size],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users?page=${page}&size=${size}`);
      return data.data; // This will be a Page<AdminUser>
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.put(`/admin/users/${userId}/status`);
      return data.data;
    },
    onSuccess: () => {
      toast.success("User status updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  });
};

export const useVerifyFarmer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.put(`/admin/users/${userId}/verify`);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Farmer verified successfully");
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};


export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "analytics", "dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/admin/analytics/dashboard");
      return data.data as AdminDashboardStats;
    },
    retry: 1, // fail fast if unauthorized, same as before
  });
};

export const useAdminMonthlyStats = () => {
  return useQuery({
    queryKey: ["admin", "analytics", "monthly-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/analytics/monthly-stats");
      return data.data as MonthlyStat[];
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};