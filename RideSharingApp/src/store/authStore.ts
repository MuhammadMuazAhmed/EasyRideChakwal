import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiClient } from '@/api/axios';
import { API_ENDPOINTS } from '@/api/endpoints';
import { decodeJwt } from '@/shared/utils';

interface AuthStore {
  token: string | null;
  refreshToken: string | null;
  phone: string | null;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  activeRole: 'rider' | 'driver' | null;
  driverId: string | null;
  setPhone: (phone: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setActiveRole: (role: 'rider' | 'driver' | null) => void;
  setDriverId: (id: string | null) => void;
  login: (accessToken: string, refreshToken: string, phone: string, role?: 'rider' | 'driver') => void;
  logout: () => void;
  completeOnboarding: () => void;
  switchRole: (role: 'rider' | 'driver') => Promise<{ success: boolean; needsRegistration?: boolean; message?: string }>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      phone: null,
      isAuthenticated: false,
      hasSeenOnboarding: false,
      activeRole: null,
      driverId: null,
      setPhone: (phone) => set({ phone }),
      setTokens: (accessToken, refreshToken) =>
        set({ token: accessToken, refreshToken, isAuthenticated: true }),
      setActiveRole: (activeRole) => set({ activeRole }),
      setDriverId: (driverId) => set({ driverId }),
      login: (accessToken, refreshToken, phone, role = 'rider') => {
        const decoded = decodeJwt(accessToken);
        const driverId = role === 'driver' && decoded?.userId && !decoded.userId.startsWith('temp_') 
          ? decoded.userId 
          : null;
        set({
          token: accessToken,
          refreshToken,
          phone,
          isAuthenticated: true,
          activeRole: role,
          driverId,
        });
      },
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          phone: null,
          isAuthenticated: false,
          activeRole: null,
          driverId: null,
        }),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      switchRole: async (role) => {
        try {
          const { data } = await apiClient.post(
            API_ENDPOINTS.auth.switchRole,
            { role }
          );
          if (data.success) {
            if (data.data.needsRegistration) {
              return { success: true, needsRegistration: true };
            }
            const decoded = decodeJwt(data.data.token!);
            const driverId = role === 'driver' && decoded?.userId && !decoded.userId.startsWith('temp_') 
              ? decoded.userId 
              : null;
            set({
              token: data.data.token,
              activeRole: role,
              driverId,
            });
            // NOTE: callers are responsible for calling syncFcmTokenWithBackend()
            // after a successful role switch to avoid a require cycle.
            return { success: true };
          }
          return { success: false, message: data.message };
        } catch (err: any) {
          return {
            success: false,
            message: err.response?.data?.message ?? err.message,
          };
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        phone: state.phone,
        isAuthenticated: state.isAuthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
        activeRole: state.activeRole,
        driverId: state.driverId,
      }),
    },
  ),
);
