import { apiClient } from '@/api/axios';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  ApiResponse,
  EmergencyContact,
  SavedPlace,
  UpdateProfilePayload,
  User,
} from '@/shared/types';

import { useAuthStore } from '@/store/authStore';
import { decodeJwt } from '@/shared/utils';

function getUserId(): string {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not authenticated');
  const decoded = decodeJwt(token);
  if (!decoded?.userId) throw new Error('Invalid JWT payload');
  return decoded.userId;
}

const mapUser = (backendUser: any): User => ({
  id: backendUser._id ?? backendUser.id,
  firstName: backendUser.firstName,
  lastName: backendUser.lastName,
  phone: backendUser.phone,
  email: backendUser.email,
  avatarInitials: backendUser.avatarInitials ?? `${backendUser.firstName[0]}${backendUser.lastName[0] ?? ''}`.toUpperCase(),
  rating: backendUser.rating ?? 5.0,
  totalRides: backendUser.totalRides ?? 0,
  referralCode: backendUser.referralCode ?? '',
  language: backendUser.language ?? 'ur',
  badge: backendUser.badge,
});

export const UserService = {
  async getProfile(): Promise<User> {
    const userId = getUserId();
    const { data } = await apiClient.get<ApiResponse<any>>(`/riders/${userId}`);
    return mapUser(data.data);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const userId = getUserId();
    const { data } = await apiClient.patch<ApiResponse<any>>(`/riders/${userId}`, payload);
    return mapUser(data.data);
  },

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const profile = await UserService.getProfile();
    return (profile as any).emergencyContacts?.map((c: any, index: number) => ({
      id: c._id ?? String(index),
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
    })) ?? [];
  },

  async updateEmergencyContacts(contacts: EmergencyContact[]): Promise<EmergencyContact[]> {
    const userId = getUserId();
    const emergencyContacts = contacts.map(c => ({
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
    }));
    const { data } = await apiClient.patch<ApiResponse<any>>(`/riders/${userId}`, { emergencyContacts });
    return data.data.emergencyContacts?.map((c: any, index: number) => ({
      id: c._id ?? String(index),
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
    })) ?? [];
  },

  async getSavedPlaces(): Promise<SavedPlace[]> {
    const userId = getUserId();
    const { data } = await apiClient.get<ApiResponse<any>>(`/riders/${userId}`);
    return data.data.savedPlaces?.map((p: any) => ({
      id: p._id ?? p.label,
      label: p.label,
      icon: p.icon,
      address: p.address,
      coordinates: p.coordinates,
    })) ?? [];
  },

  async getReferralInfo(): Promise<{ code: string; credits: number; referrals: number }> {
    const userId = getUserId();
    const { data } = await apiClient.get<ApiResponse<any>>(`/riders/${userId}`);
    return {
      code: data.data.referralCode ?? '',
      credits: data.data.walletBalance ?? 0,
      referrals: Math.floor((data.data.walletBalance ?? 0) / 50),
    };
  },
};
