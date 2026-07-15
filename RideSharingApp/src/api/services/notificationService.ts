import { apiClient } from '@/api/axios';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { ApiResponse, Notification } from '@/shared/types';

export const NotificationService = {
  async getNotifications(): Promise<Notification[]> {
    return [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    // No-op. Backend only supports FCM push notifications.
  },

  async markAllAsRead(): Promise<void> {
    // No-op.
  },
};
