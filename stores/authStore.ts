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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
    set({ user, isAuthenticated: true });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    set({ user: null, isAuthenticated: false });
  },
}));