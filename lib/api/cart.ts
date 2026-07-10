// lib/api/cart.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api'; // Your configured axios instance
import { CartResponse, AddToCartRequest } from '@/types/cart';

// --- GET CART ---
export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data.data as CartResponse;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// --- ADD TO CART ---
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AddToCartRequest) => {
      const { data } = await api.post('/cart/items', request);
      return data.data as CartResponse;
    },
    onSuccess: () => {
      // Invalidate cart query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// --- REMOVE FROM CART ---
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// --- UPDATE CART ITEM QUANTITY ---
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
      return data.data as CartResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => {
      // If backend rejects (e.g., max stock reached), refetch to reset UI to valid state
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};