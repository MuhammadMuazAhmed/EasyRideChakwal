import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import type { ApiEnvelope } from '@/types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Attach the admin bearer token to every outgoing request.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

/**
 * Normalized error shape used throughout the app so components never have
 * to reach into axios internals.
 */
export class ApiError extends Error {
  status?: number;
  /** True when the request never reached the backend (network/DNS/CORS). */
  isNetworkError: boolean;
  /** True when the backend responded but the route doesn't exist (404) —
   *  used to render "this endpoint isn't available yet" states instead of
   *  a generic failure, since several dashboard features intentionally
   *  outrun the current backend (see BACKEND_REQUIREMENTS.md). */
  isMissingEndpoint: boolean;

  constructor(message: string, status?: number, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
    this.isMissingEndpoint = status === 404;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown> | { message?: string }>) => {
    if (!error.response) {
      return Promise.reject(new ApiError('Cannot reach the EasyRide backend. Check your connection or API URL.', undefined, true));
    }

    const status = error.response.status;
    const backendMessage = (error.response.data as { message?: string } | undefined)?.message;

    if (status === 401) {
      // Token missing / expired / invalid — drop the session and send the
      // operator back to login. Don't do this for the login request itself.
      const isLoginRequest = error.config?.url?.includes('/admin/auth/login');
      if (!isLoginRequest) {
        useAuthStore.getState().logout();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(new ApiError(backendMessage ?? 'Something went wrong. Please try again.', status));
  }
);

/** Unwraps the { success, data, message } envelope every backend route uses. */
export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}
