import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface KycResponse {
  id: string;
  nicNumber: string;
  nicImageUrl: string; // Presigned URL
  livePhotoUrl: string; // Presigned URL
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// 1. FARMER: Submit KYC
export const useSubmitKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Note: Do NOT set Content-Type header manually for FormData. 
      // Axios will automatically set the correct multipart boundary.
      const { data } = await api.post('/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data as KycResponse;
    },
    onSuccess: () => {
      toast.success("KYC documents submitted successfully! Pending admin review.");
      queryClient.invalidateQueries({ queryKey: ['kyc', 'my-status'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit KYC.");
    },
  });
};

// 2. FARMER: Get My KYC Status
export const useMyKycStatus = () => {
  return useQuery({
    queryKey: ['kyc', 'my-status'],
    queryFn: async () => {
      const { data } = await api.get('/kyc/my-status');
      return data.data as KycResponse;
    },
    retry: false, // Don't retry if they haven't submitted yet
  });
};

// 3. ADMIN: Get Pending KYCs
export const useAdminPendingKycs = () => {
  return useQuery({
    queryKey: ['admin', 'kyc', 'pending'],
    queryFn: async () => {
      const { data } = await api.get('/kyc/admin/pending');
      return data.data as KycResponse[];
    },
  });
};

// 4. ADMIN: Review KYC (Approve/Reject)
export const useReviewKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ kycId, status, rejectionReason }: { kycId: string; status: string; rejectionReason?: string }) => {
      const { data } = await api.put(`/kyc/admin/${kycId}/review?status=${status}&rejectionReason=${encodeURIComponent(rejectionReason || '')}`);
      return data.data;
    },
    onSuccess: () => {
      toast.success("KYC reviewed successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin', 'kyc', 'pending'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to review KYC.");
    },
  });
};