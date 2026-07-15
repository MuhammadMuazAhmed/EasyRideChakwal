import { apiClient } from '@/api/axios';
import { API_ENDPOINTS } from '@/api/endpoints';
import { useAuthStore } from '@/store/authStore';
import type { ApiResponse, LoginRequest, VerifyOtpRequest } from '@/shared/types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  message: string;
  otpSent: boolean;
}

export interface VerifyOtpResponse {
  tokens: AuthTokens;
  isNewUser: boolean;
  needsRegistration?: boolean;
  phone?: string;
}

export const AuthService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiResponse<{ phone: string }>>(
      API_ENDPOINTS.auth.login,
      { phone: payload.phone, role: payload.role ?? 'rider' }
    );
    return {
      message: data.message ?? 'OTP sent successfully',
      otpSent: data.success,
    };
  },

  async verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const { data } = await apiClient.post<ApiResponse<{ token: string; isNewUser: boolean; role: string; needsRegistration?: boolean; phone?: string }>>(
      API_ENDPOINTS.auth.verifyOtp,
      {
        phone: payload.phone,
        otp: payload.otp,
        role: payload.role ?? 'rider',
        ...(payload.fcmToken ? { fcmToken: payload.fcmToken } : {}),
      }
    );
    return {
      tokens: {
        accessToken: data.data.token,
        refreshToken: '',
      },
      isNewUser: data.data.isNewUser,
      needsRegistration: data.data.needsRegistration,
      phone: data.data.phone,
    };
  },

  async switchRole(role: 'rider' | 'driver'): Promise<{ success: boolean; token?: string; needsRegistration?: boolean; message?: string }> {
    try {
      const { data } = await apiClient.post<ApiResponse<{ token?: string; needsRegistration?: boolean; role: string }>>(
        API_ENDPOINTS.auth.switchRole,
        { role }
      );
      if (data.success) {
        return {
          success: true,
          token: data.data.token,
          needsRegistration: data.data.needsRegistration,
        };
      }
      return { success: false, message: data.message };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message ?? err.message,
      };
    }
  },

  async logout(): Promise<void> {
    // No backend logout API. We just perform local state clear.
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Backend lacks refresh token support (JWT signed with 30d expiry).
    // We return the current token to keep the store architecture intact.
    return {
      accessToken: useAuthStore.getState().token ?? '',
      refreshToken: refreshToken,
    };
  },
};
