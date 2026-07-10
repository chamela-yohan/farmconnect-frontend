// lib/api/orders.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { OrderCreateRequest, OrderResponse } from '@/types/order';

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