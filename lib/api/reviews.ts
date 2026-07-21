import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ReviewCreateRequest, ReviewResponse } from '@/types/review';
import { Page } from '@/types/common';
import { toast } from 'sonner';

export const useCreateReview = () => {
  return useMutation({
    mutationFn: async (request: ReviewCreateRequest) => {
      const { data } = await api.post('/reviews', request);
      return data.data as ReviewResponse;
    },
    onSuccess: () => {
      toast.success("Thank you for your review!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    }
  });
};

export const useFarmerReviews = (farmerId: string | null, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['reviews', 'farmer', farmerId, page],
    queryFn: async () => {
      if (!farmerId) throw new Error("Farmer ID is required");
      const { data } = await api.get(`/reviews/farmer/${farmerId}?page=${page}&size=${size}`);
      return data.data as Page<ReviewResponse>;
    },
    enabled: !!farmerId,
  });
};