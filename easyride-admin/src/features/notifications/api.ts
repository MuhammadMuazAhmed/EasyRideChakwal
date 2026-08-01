import { apiClient, unwrap } from '@/lib/api-client';

export type NotificationTarget = 'all_riders' | 'all_drivers' | 'everyone' | 'specific';

export interface SendNotificationPayload {
  target: NotificationTarget;
  userId?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/** POST /api/notifications — works today, admin-only. */
export async function sendNotification(payload: SendNotificationPayload): Promise<{ sentCount: number; target: string }> {
  return unwrap(apiClient.post('/notifications', payload));
}
