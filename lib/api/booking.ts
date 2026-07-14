import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BookingRequest, Booking } from "@/types/booking";
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
