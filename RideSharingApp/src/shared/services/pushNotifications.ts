import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { apiClient } from '@/api/axios';
import { useAuthStore } from '@/store/authStore';
import { decodeJwt } from '@/shared/utils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getDeviceFcmToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('easy_ride_channel', {
      name: 'Easy Ride',
      importance: Notifications.AndroidImportance.MAX,
      sound: null, // null = system default; 'default' is wrongly treated as a custom file
    });
  }

  try {
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    return deviceToken.data;
  } catch {
    return null;
  }
}

export async function syncFcmTokenWithBackend(): Promise<void> {
  const token = await getDeviceFcmToken();
  if (!token) return;

  const authToken = useAuthStore.getState().token;
  if (!authToken) return;

  const decoded = decodeJwt(authToken);
  const role = useAuthStore.getState().activeRole ?? decoded?.role;
  let userId = decoded?.userId;

  if (role === 'driver') {
    const driverId = useAuthStore.getState().driverId;
    if (!driverId) return;
    userId = driverId;
  } else if (!userId || userId.startsWith('temp_')) {
    return;
  }

  const path = role === 'driver' ? `/drivers/${userId}` : `/riders/${userId}`;

  try {
    // _skipLogout: true ensures a 401 here never triggers the global logout
    // interceptor and accidentally kicks the user back to the login screen.
    await apiClient.patch(path, { fcmToken: token }, { _skipLogout: true });
  } catch {
    // Non-blocking — polling remains the fallback for ride updates.
  }
}
