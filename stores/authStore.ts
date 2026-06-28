import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'FARMER';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void; // ✅ New function to reload state from localStorage
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user)); // ✅ Save user data too
    }
    set({ user, isAuthenticated: true });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    set({ user: null, isAuthenticated: false });
  },

  // Reload state from localStorage when the app starts
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, isAuthenticated: true });
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }
}));