// lib/api/orders.ts
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { OrderCreateRequest, OrderResponse, OrderStatusUpdateRequest } from '@/types/order';
import { Page } from '@/types/common';

export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: OrderCreateRequest) => {
      const { data } = await api.post('/orders/checkout', request);
      // Backend returns a List of OrderResponse (one for each farmer)
      return data.data as OrderResponse[]; 
    },
    onSuccess: () => {
      // Clear the cart cache so the Cart Drawer shows "Empty"
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      // Invalidate orders list so "My Orders" page updates immediately
      queryClient.invalidateQueries({ queryKey: ['orders'] }); 
    },
  });

};

export const useBuyerOrders = (status?: string, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['orders', 'buyer', status, page, size],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'ALL') params.append('status', status);
      params.append('page', page.toString());
      params.append('size', size.toString());

      const { data } = await api.get(`/orders/my-orders?${params.toString()}`);
      return data.data as Page<OrderResponse>;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })};

  // --- GET FARMER RECEIVED ORDERS ---
export const useFarmerOrders = (status?: string, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['orders', 'farmer', status, page, size],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'ALL') params.append('status', status);
      params.append('page', page.toString());
      params.append('size', size.toString());

      const { data } = await api.get(`/orders/received-orders?${params.toString()}`);
      return data.data as Page<OrderResponse>;
    },
    staleTime: 1000 * 60 * 2,
  });
};

// --- UPDATE ORDER STATUS (Farmer Action) ---
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, request }: { orderId: string; request: OrderStatusUpdateRequest }) => {
      const { data } = await api.put(`/orders/${orderId}/status`, request);
      return data.data as OrderResponse;
    },
    onSuccess: () => {
      // Invalidate both buyer and farmer order caches to keep everything in sync
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};