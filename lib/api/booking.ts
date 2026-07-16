import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BookingRequest, Booking, BookingStatus } from "@/types/booking";
import { Page } from '@/types/common';
import { toast } from "sonner";

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: async (request: BookingRequest) => {

      const params = new URLSearchParams({
        productId: request.productId,
        startDate: request.startDate,
        endDate: request.endDate,
        quantity: request.quantity.toString(), 
      });
      if (request.notes) params.append("notes", request.notes);

      const { data } = await api.post(`/bookings?${params.toString()}`);
      return data.data as Booking;
    },
    onSuccess: () => {
      toast.success("Booking request sent to farmer!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create booking request.",
      );
    },
  });
};

export const useFarmerBookings = (status?: string, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['bookings', 'farmer', status, page, size],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'ALL') params.append('status', status);
      params.append('page', page.toString());
      params.append('size', size.toString());

      const { data } = await api.get(`/bookings/farmer?${params.toString()}`);
      return data.data as Page<Booking>;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, newStatus, notes }: { bookingId: string; newStatus: BookingStatus; notes?: string }) => {
      
      const payload = {
        newStatus: newStatus,
        notes: notes || null // Send null instead of undefined to ensure clean JSON
      };

      const { data } = await api.put(`/bookings/${bookingId}/status`, payload);
      return data.data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success("Booking status updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update booking.");
    }
  });
};

export const useBuyerBookings = (status?: string, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['bookings', 'buyer', status, page, size],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'ALL') params.append('status', status);
      params.append('page', page.toString());
      params.append('size', size.toString());

      const { data } = await api.get(`/bookings/buyer?${params.toString()}`);
      return data.data as Page<Booking>;
    },
    staleTime: 1000 * 60 * 2,
  });
};