import { create } from 'zustand';
import type { Admin } from '../types';

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, admin: Admin) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  admin: JSON.parse(localStorage.getItem('admin') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),
  setAuth: (token: string, refreshToken: string, admin: Admin) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('admin', JSON.stringify(admin));
    set({ token, admin, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin');
    set({ token: null, admin: null, isAuthenticated: false });
  },
}));
