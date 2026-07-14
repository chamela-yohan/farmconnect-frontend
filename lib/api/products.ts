// lib/api/products.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Product,
  ProductPage,
  ProductFilter,
  ProductSearchCriteria,
} from "@/types/product";
import { Category } from "@/types/product";

// // --- FETCH PRODUCTS WITH FILTERS (Search API) ---
// export const useProducts = (filters: ProductFilter) => {
//   return useQuery({
//     queryKey: ["products", filters],
//     queryFn: async () => {
//       // Build query string from filters
//       const params = new URLSearchParams();

//       if (filters.page !== undefined)
//         params.append("page", filters.page.toString());
//       if (filters.size !== undefined)
//         params.append("size", filters.size.toString());
//       if (filters.search) params.append("keyword", filters.search);
//       if (filters.category) params.append("category", filters.category);
//       if (filters.productType)
//         params.append("productType", filters.productType); // NEW
//       if (filters.latitude) params.append("lat", filters.latitude.toString());
//       if (filters.longitude) params.append("lon", filters.longitude.toString());
//       if (filters.radiusKm)
//         params.append("radiusKm", filters.radiusKm.toString());
//       if (filters.minPrice)
//         params.append("minPrice", filters.minPrice.toString());
//       if (filters.maxPrice)
//         params.append("maxPrice", filters.maxPrice.toString());
//       if (filters.sortBy) params.append("sortBy", filters.sortBy);
//       if (filters.isDeliveryAvailable !== undefined) {
//         params.append(
//           "isDeliveryAvailable",
//           filters.isDeliveryAvailable.toString(),
//         );
//       }

//       const { data } = await api.get(`/products/search?${params.toString()}`);
//       return data.data as ProductPage;
//     },
//     staleTime: 1000 * 60 * 25, // 25 minutes
//     gcTime: 1000 * 60 * 60, // 1 hour
//     refetchOnWindowFocus: true,
//   });
// };

// --- FETCH SINGLE PRODUCT ---
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
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
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/products/categories");
      return data.data as Category[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// --- FETCH FARMER'S PRODUCTS ---
export const useFarmerProducts = (page = 0, size = 12) => {
  return useQuery({
    queryKey: ["farmer-products", page, size],
    queryFn: async () => {
      const { data } = await api.get(
        `/products/farmer/my-products?page=${page}&size=${size}`,
      );
      return data.data as ProductPage;
    },
  });
};

// --- CREATE PRODUCT (Multipart Form Data) ---
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-products"] });
    },
  });
};

// --- UPDATE PRODUCT ---
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      const { data } = await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-products"] });
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
      queryClient.invalidateQueries({ queryKey: ["farmer-products"] });
    },
  });
};

// --- HELPER: Prepare FormData for API ---
// This is crucial for matching your backend's @RequestParam("product") String productJson
// lib/api/products.ts

import { ProductFormData, ProductType } from "@/types/product";

export const prepareProductFormData = (
  productData: ProductFormData,
  images: File[],
  video?: File
): FormData => {
  const formData = new FormData();
  const attributes: Record<string, any> = {};

  // ==========================================
  // 1. BUILD ATTRIBUTES BASED ON PRODUCT TYPE
  // ==========================================
  if (productData.productType === ProductType.PHYSICAL_GOOD) {
    if (productData.availableStock) attributes.availableStock = Number(productData.availableStock);
    if (productData.unit) attributes.unit = productData.unit;
    if (productData.expiryDate) attributes.expiryDate = productData.expiryDate;
  } 
  else if (productData.productType === ProductType.RENTABLE) {
    // Map the UI's 'availableStock' input to 'availableUnits' for backend capacity checks
    if (productData.availableStock) attributes.availableUnits = Number(productData.availableStock);
    
    if (productData.rentalPricePerDay) attributes.rentalPricePerDay = Number(productData.rentalPricePerDay);
    if (productData.depositAmount) attributes.depositAmount = Number(productData.depositAmount);
    if (productData.minRental) attributes.minRental = Number(productData.minRental);
    if (productData.maxRental) attributes.maxRental = Number(productData.maxRental);
    
    attributes.unit = "pcs"; // Locked per your UI design
  } 
  else if (productData.productType === ProductType.SERVICE) {
    // Map the UI's 'availableStock' input to 'availableUnits' for backend capacity checks
    if (productData.availableStock) attributes.availableUnits = Number(productData.availableStock);
    
    if (productData.minRental) attributes.minRental = Number(productData.minRental);
    if (productData.maxRental) attributes.maxRental = Number(productData.maxRental);
    if (productData.unit) attributes.unit = productData.unit;
  }

  // ==========================================
  // 2. BUILD CORE PRODUCT PAYLOAD (Sanitized)
  // ==========================================
  const productPayload = {
    title: productData.title.trim(),
    description: productData.description.trim(),
    price: Number(productData.price),
    productType: productData.productType,
    categoryId: productData.categoryId,
    
    // Ensure numbers are actually numbers, or undefined if empty
    minOrderQty: productData.minOrderQty ? Number(productData.minOrderQty) : undefined,
    maxOrderQty: productData.maxOrderQty ? Number(productData.maxOrderQty) : undefined,
    qtyStep: productData.qtyStep ? Number(productData.qtyStep) : undefined,
    deliveryFee: productData.deliveryFee ? Number(productData.deliveryFee) : undefined,
    
    isDeliveryAvailable: Boolean(productData.isDeliveryAvailable),
    locationCityIds: productData.locationCityIds || [],
    deliveryDistrictIds: productData.deliveryDistrictIds || [],
    attributes: attributes,
  };

  // ==========================================
  // 3. APPEND TO FORMDATA (Best Practices)
  // ==========================================
  
  // Append JSON payload
  formData.append("product", JSON.stringify(productPayload));
  
  // Append images with explicit filenames (prevents backend parsing issues)
  images.forEach((image) => {
    formData.append("images", image, image.name);
  });
  
  // Append video if it exists
  if (video) {
    formData.append("video", video, video.name);
  }

  return formData;
};

// Add 'enabled' parameter with a default value of true
export const useSearchProducts = (
  criteria: ProductSearchCriteria,
) => {
  return useQuery({
    queryKey: ["products", "search", JSON.stringify(criteria)],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (criteria.keyword) params.append("keyword", criteria.keyword);
      if (criteria.categoryId) params.append("categoryId", criteria.categoryId);
      if (criteria.productType)
        params.append("productType", criteria.productType);
      if (criteria.minPrice)
        params.append("minPrice", criteria.minPrice.toString());
      if (criteria.maxPrice)
        params.append("maxPrice", criteria.maxPrice.toString());

      if (criteria.lat) params.append("lat", criteria.lat.toString());
      if (criteria.lon) params.append("lon", criteria.lon.toString());
      if (criteria.radiusKm)
        params.append("radiusKm", criteria.radiusKm.toString());

      if (criteria.locationDistrictId)
        params.append(
          "locationDistrictId",
          criteria.locationDistrictId.toString(),
        );
      if (criteria.deliveryDistrictId)
        params.append(
          "deliveryDistrictId",
          criteria.deliveryDistrictId.toString(),
        );
      if (criteria.isDeliveryAvailable)
        params.append("isDeliveryAvailable", "true");

      if (criteria.sortBy) params.append("sortBy", criteria.sortBy);
      if (criteria.sortDir) params.append("sortDir", criteria.sortDir);

      params.append("page", String(criteria.page || 0));
      params.append("size", String(criteria.size || 20));

      const { data } = await api.get(`/products/search?${params.toString()}`);
      return data.data as ProductPage;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useKeywordSuggestions = (query: string) => {
  return useQuery({
    queryKey: ["keyword-suggestions", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const { data } = await api.get(
        `/products/keyword-suggestions?query=${encodeURIComponent(query)}`,
      );
      return data.data as string[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
