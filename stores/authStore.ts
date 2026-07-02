import { create } from "zustand";

interface User {
  id: string;
  name: string;
  mobileNumber: string;
  address: string;
  city: string;
  lat: number;
  lon: number;
  email: string;
  role: "BUYER" | "FARMER";
  profilePictureUrl?: string;
  profileComplete: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;  // Track hydration state
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,  // Start as false

  login: (user, accessToken, refreshToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, isAuthenticated: true, isHydrated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    set({ user: null, isAuthenticated: false, isHydrated: true });
  },

  hydrate: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, isAuthenticated: true, isHydrated: true });
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
          // Clear corrupted data
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({ user: null, isAuthenticated: false, isHydrated: true });
        }
      } else {
        set({ isHydrated: true });
      }
    }
  },
}));