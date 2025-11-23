import { create } from 'zustand';
import type { UserDetails } from '@/api/user/user.type';

type AuthState = {
  user: UserDetails | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserDetails | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}));
