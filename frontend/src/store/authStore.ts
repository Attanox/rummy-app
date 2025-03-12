import { create } from 'zustand';
import { persist } from 'zustand/middleware'
import type {components} from '../api/schema'

type User = components['schemas']['User'];

type AuthStore = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (user && token) {
          localStorage.setItem('auth_token', token);
          set({
            user: user,
            token: token,
            isAuthenticated: true,
          });
        }
      },
      clearAuth: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
