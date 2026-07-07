import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// 1. Request Interceptor: Attach Access Token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 2. Response Interceptor: Handle 401 & Refresh Token
let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check if we got a 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('[Axios Interceptor] 🚨 401 Unauthorized detected. Attempting token refresh...');
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      // Check if refresh token exists
      if (!refreshToken) {
        console.error('[Axios Interceptor] No refresh token found in localStorage. Forcing logout.');
        handleLogout();
        return Promise.reject(error);
      }

      try {
        console.log('[Axios Interceptor] Calling /auth/refresh endpoint...');
        
        // Use global axios to avoid triggering this interceptor again
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });

        console.log('[Axios Interceptor] Refresh successful! Processing queue...');
        
        // Extract data (Handles both ApiResponse wrapper and direct object)
        const authData = response.data?.data || response.data; 
        const newAccessToken = authData.accessToken;
        
        if (!newAccessToken) {
           throw new Error('New access token missing from refresh response');
        }

        // Save new tokens
        localStorage.setItem('accessToken', newAccessToken);
        if (authData.refreshToken) localStorage.setItem('refreshToken', authData.refreshToken);
        if (authData.user) localStorage.setItem('user', JSON.stringify(authData.user));

        // Update header for the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry the original request
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('[Axios Interceptor] Refresh failed:', refreshError);
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper to clear session and redirect
const handleLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    if (!window.location.pathname.includes('/login')) {
      const pathParts = window.location.pathname.split('/');
      const locale = pathParts[1] || 'en';
      window.location.href = `/${locale}/login`;
    }
  }
};