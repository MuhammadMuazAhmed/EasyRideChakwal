import { useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/config/firebase';
import type { Coordinates } from '@/shared/types';

/**
 * Subscribes to the Firebase Realtime Database path `drivers/{driverId}/location`
 * and calls onLocationUpdate whenever a new position arrives.
 *
 * Returns nothing — the caller handles state updates.
 */
export function useDriverLocationListener(
  driverId: string | null | undefined,
  onLocationUpdate: (coords: Coordinates) => void
) {
  // Keep a stable ref so the effect closure always sees the latest callback
  // without re-running the subscription every render.
  const callbackRef = useRef(onLocationUpdate);
  callbackRef.current = onLocationUpdate;

  useEffect(() => {
    if (!driverId) return;

    const locRef = ref(rtdb, `drivers/${driverId}/location`);

    const unsubscribe = onValue(locRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Firebase stores: { latitude, longitude, updatedAt }
      const latitude = typeof data.latitude === 'number' ? data.latitude : parseFloat(data.latitude);
      const longitude = typeof data.longitude === 'number' ? data.longitude : parseFloat(data.longitude);

      if (!isNaN(latitude) && !isNaN(longitude) && latitude !== 0 && longitude !== 0) {
        callbackRef.current({ latitude, longitude });
      }
    });

    return () => {
      off(locRef);
      unsubscribe();
    };
  }, [driverId]);
}
