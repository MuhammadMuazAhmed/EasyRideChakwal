import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Allow callers to opt-out of the global 401 → logout behaviour.
// AxiosRequestConfig  → the public type accepted by .get()/.post()/.patch() etc.
// InternalAxiosRequestConfig → what axios converts it to inside interceptors.
// Both must be extended so the flag is valid at call sites AND in the interceptor.
declare module 'axios' {
  interface AxiosRequestConfig {
    _skipLogout?: boolean;
  }
  interface InternalAxiosRequestConfig {
    _skipLogout?: boolean;
  }
}

import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL: env.EXPO_PUBLIC_API_URL || undefined,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Only force-logout when the request that failed didn't explicitly opt out.
    // Background calls (e.g. FCM token sync) set _skipLogout so they never
    // accidentally kick a freshly-authenticated user back to the login screen.
    if (error.response?.status === 401 && !error.config?._skipLogout) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? 'Something went wrong';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}
