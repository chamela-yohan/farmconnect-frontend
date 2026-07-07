import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Province {
  id: number;
  nameEn: string;
  nameSi: string;
  nameTa: string;
}

export interface District {
  id: number;
  provinceId: number;
  nameEn: string;
  nameSi: string;
  nameTa: string;
}

export interface City {
  id: number;
  districtId: number;
  nameEn: string;
  nameSi: string;
  nameTa: string;
  postcode: string;
  latitude: number;
  longitude: number;
  subNames?: {
    en?: string;
    si?: string;
    ta?: string;
  };
}

// Helper to safely extract array data from ApiResponse or direct array
const extractArray = <T>(response: any): T[] => {
  // Try to get data from ApiResponse wrapper (response.data.data)
  // If that fails, check if the response itself is an array (response.data)
  // Otherwise, return an empty array
  const rawData = response.data?.data ?? response.data;
  return Array.isArray(rawData) ? rawData : [];
};

export const useProvinces = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const response = await api.get('/locations/provinces');
      return extractArray<Province>(response);
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useDistricts = (provinceId: number | null) => {
  return useQuery({
    queryKey: ['districts', provinceId],
    queryFn: async () => {
      if (!provinceId) return [];
      const response = await api.get(`/locations/districts?provinceId=${provinceId}`);
      return extractArray<District>(response);
    },
    // Only run if provinceId is a valid number (not null, 0, or undefined)
    enabled: !!provinceId, 
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useCities = (districtId: number | null) => {
  return useQuery({
    queryKey: ['cities', districtId],
    queryFn: async () => {
      if (!districtId) return [];
      const response = await api.get(`/locations/cities?districtId=${districtId}`);
      return extractArray<City>(response);
    },
    // Only run if districtId is a valid number
    enabled: !!districtId, 
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useAllDistricts = () => {
  return useQuery({
    queryKey: ['all-districts'],
    queryFn: async () => {
      const response = await api.get('/locations/all-districts');
      return extractArray<District>(response);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};