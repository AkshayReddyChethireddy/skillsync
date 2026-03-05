import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';
import type { User, LoginRequest, RegisterRequest } from '../types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const tokenRes = await authApi.login(data);
          localStorage.setItem('skillsync_token', tokenRes.access_token);
          const user = await authApi.getMe();
          set({ token: tokenRes.access_token, user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Login failed';
          set({ isLoading: false, error: typeof msg === 'string' ? msg : 'Login failed' });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register({ ...data, full_name: data.full_name || undefined });
          await get().login({ email: data.email, password: data.password });
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed';
          set({ isLoading: false, error: typeof msg === 'string' ? msg : 'Registration failed' });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('skillsync_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },

      updateProfile: async (data) => {
        const user = await authApi.updateMe(data);
        set({ user });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'skillsync-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
