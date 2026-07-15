import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { DriverService } from '@/modules/driver/services/driverService';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import { useAuthStore } from '@/store/authStore';

export function useDriverLocationSync() {
  const isOnline = useDriverStore((s) => s.isOnline);
  const driverId = useAuthStore((s) => s.driverId);
  const lastLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!isOnline || !driverId) return;

    let subscription: Location.LocationSubscription | null = null;

    async function startWatching() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('[LocationSync] Location permission not granted');
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 4000,
            distanceInterval: 5, // update every 5 meters
          },
          (loc) => {
            const { latitude, longitude } = loc.coords;
            const prev = lastLocationRef.current;
            const dist = prev
              ? Math.abs(prev.latitude - latitude) + Math.abs(prev.longitude - longitude)
              : 999;

            if (dist > 0.00005) {
              lastLocationRef.current = { latitude, longitude };
              void DriverService.updateLocation({ latitude, longitude }).catch((err) => {
                console.error('[LocationSync] Location update failed', err);
              });
            }
          }
        );
      } catch (err) {
        console.error('[LocationSync] Error starting location watch', err);
      }
    }

    void startWatching();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isOnline, driverId]);
}
