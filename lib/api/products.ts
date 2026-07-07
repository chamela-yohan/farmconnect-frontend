// lib/api/products.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {api} from '@/lib/api';
import { Product, ProductPage, ProductFilter } from '@/types/product';
import { Category } from '@/types/product'; 

// --- FETCH PRODUCTS WITH FILTERS (Search API) ---
export const useProducts = (filters: ProductFilter) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      // Build query string from filters
      const params = new URLSearchParams();
      
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
      if (filters.search) params.append('keyword', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.productType) params.append('productType', filters.productType); // NEW
      if (filters.latitude) params.append('lat', filters.latitude.toString());
      if (filters.longitude) params.append('lon', filters.longitude.toString());
      if (filters.radiusKm) params.append('radiusKm', filters.radiusKm.toString());
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.isDeliveryAvailable !== undefined) {
        params.append('isDeliveryAvailable', filters.isDeliveryAvailable.toString());
      }

      const { data } = await api.get(`/products/search?${params.toString()}`);
      return data.data as ProductPage;
    },
    staleTime: 1000 * 60 * 25, // 25 minutes
    gcTime: 1000 * 60 * 60,    // 1 hour
    refetchOnWindowFocus: true,
  });
};

// --- FETCH SINGLE PRODUCT ---
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data.data as Product;
    },
    enabled: !!id,
  });
};

// --- FETCH CATEGORIES ---
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/products/categories');
      return data.data as Category[]; 
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};


// --- FETCH FARMER'S PRODUCTS ---
export const useFarmerProducts = (page = 0, size = 12) => {
  return useQuery({
    queryKey: ['farmer-products', page, size],
    queryFn: async () => {
      const { data } = await api.get(`/products/farmer/my-products?page=${page}&size=${size}`);
      return data.data as ProductPage;
    },
  });
};

// --- CREATE PRODUCT (Multipart Form Data) ---
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-products'] });
    },
  });
};

// --- UPDATE PRODUCT ---
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-products'] });
    },
  });
};

// --- DELETE PRODUCT ---
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-products'] });
    },
  });
};

// --- HELPER: Prepare FormData for API ---
// This is crucial for matching your backend's @RequestParam("product") String productJson
// lib/api/products.ts

export const prepareProductFormData = (productData: any, images: File[], video?: File) => {
  const formData = new FormData();
  
  const attributes: any = {};

  if (productData.productType === 'PHYSICAL_GOOD') {
    attributes.availableStock = productData.availableStock;
    attributes.unit = productData.unit;
    attributes.expiryDate = productData.expiryDate;
  } else if (productData.productType === 'RENTABLE') {
    attributes.rentalPricePerDay = productData.rentalPricePerDay;
    attributes.depositAmount = productData.depositAmount;
    attributes.minRental = productData.minRental;
    attributes.maxRental = productData.maxRental;
    attributes.unit = 'pcs';
  } else if (productData.productType === 'SERVICE') {
    attributes.minRental = productData.minRental;
    attributes.maxRental = productData.maxRental;
    attributes.unit = productData.unit;
  }

  const productPayload = {
    title: productData.title,
    description: productData.description,
    price: productData.price,
    productType: productData.productType,
    categoryId: productData.categoryId,
    minOrderQty: productData.minOrderQty,
    maxOrderQty: productData.maxOrderQty,
    qtyStep: productData.qtyStep,
    isDeliveryAvailable: productData.isDeliveryAvailable,
    deliveryFee: productData.deliveryFee,
    
    //  Locations and Delivery
    locationCityIds: productData.locationCityIds || [],
    deliveryDistrictIds: productData.deliveryDistrictIds || [],
    
    attributes: attributes,
  };

  formData.append('product', JSON.stringify(productPayload));
  images.forEach((image) => formData.append('images', image));
  if (video) formData.append('video', video);

  return formData;
};