import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  setToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isLoading: false,
      setToken: (token: string) => set({ accessToken: token }),
      setUser: (user: AuthUser) => set({ user }),
      clearAuth: () => set({ accessToken: null, user: null }),
      isTokenExpired: () => {
        const { accessToken } = get();
        if (!accessToken) return true;
        try {
          const parts = accessToken.split('.');
          if (parts.length !== 3) return true;
          const payload = JSON.parse(atob(parts[1])) as { exp?: number };
          if (typeof payload.exp !== 'number') return true;
          return Date.now() / 1000 > payload.exp;
        } catch {
          return true;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    }
  )
);
