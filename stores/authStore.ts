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
  role: "BUYER" | "FARMER" | "ADMIN"; //  Added ADMIN
  profilePictureUrl?: string;
  profileComplete: boolean;
  isVerified: boolean,
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  login: (user, accessToken, refreshToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      
      //  Set the user_role cookie for Next.js Middleware to read (expires in 7 days)
      document.cookie = `user_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
    }
    set({ user, isAuthenticated: true, isHydrated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      //  Clear the user_role cookie
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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