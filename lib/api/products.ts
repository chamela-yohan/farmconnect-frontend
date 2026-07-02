import { api } from '../api';
import { Product, ProductFilter, ProductPage } from '@/types/product';
import { useQuery } from '@tanstack/react-query';

// Fetch products with filters
export const fetchProducts = async (filters: ProductFilter = {}): Promise<ProductPage> => {
  const params = new URLSearchParams();
  
  // Map frontend filter names to backend parameter names
  if (filters.search) params.append('keyword', filters.search);  // keyword, not search
  if (filters.category) params.append('category', filters.category);
  if (filters.sortBy) {
    // Map sortBy to backend format
    const sortField = filters.sortBy.replace(/_(asc|desc)/, ''); // Remove _asc/_desc suffix
    params.append('sortBy', sortField);
    
    // Extract sort direction
    const sortDirMatch = filters.sortBy.match(/_(asc|desc)$/);
    if (sortDirMatch) {
      params.append('sortDir', sortDirMatch[1].toUpperCase());
    } else {
      params.append('sortDir', 'DESC');
    }
  } else {
    params.append('sortBy', 'createdAt');
    params.append('sortDir', 'DESC');
  }
  
  // Add location params
  if (filters.latitude) params.append('lat', filters.latitude.toString());
  if (filters.longitude) params.append('lon', filters.longitude.toString());
  if (filters.radiusKm) params.append('radiusKm', filters.radiusKm.toString());
  
  // Pagination
  params.append('page', String(filters.page || 0));
  params.append('size', String(filters.size || 20));

  // Call the /search endpoint
  const response = await api.get(`/products/search?${params.toString()}`);
  return response.data.data;
};

// Fetch single product
export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data.data;
};

// Fetch categories
export const fetchCategories = async (): Promise<string[]> => {
  const response = await api.get('/products/categories');
  return response.data.data;
};

// React Query Hooks
export const useProducts = (filters: ProductFilter = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 1000 * 60 * 30, // Refresh every 30 minutes (before URLs expire)
    gcTime: 1000 * 60 * 60,    // Keep in cache for 1 hour
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};