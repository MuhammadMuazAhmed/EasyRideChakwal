import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminProfile {
  name: string;
  role: 'super_admin' | 'admin' | 'support';
}

interface AuthState {
  token: string | null;
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  setSession: (token: string, admin: AdminProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      setSession: (token, admin) => set({ token, admin, isAuthenticated: true }),
      logout: () => set({ token: null, admin: null, isAuthenticated: false }),
    }),
    {
      name: 'easyride-admin-session',
      partialize: (state) => ({ token: state.token, admin: state.admin, isAuthenticated: state.isAuthenticated }),
    }
  )
);
