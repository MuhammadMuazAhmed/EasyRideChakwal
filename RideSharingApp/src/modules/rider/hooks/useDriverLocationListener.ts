import { useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/config/firebase';
import type { Coordinates } from '@/shared/types';

/**
 * Subscribes to the Firebase Realtime Database path `drivers/{driverId}/location`
 * and calls onLocationUpdate whenever a new position arrives.
 *
 * Guards against stale / out-of-order updates: if the incoming snapshot's
 * `updatedAt` timestamp is older than (or equal to) the last accepted one,
 * the update is silently discarded.  This prevents the 2–3-second "jump"
 * caused by delayed Firebase writes landing after a newer position was set.
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

  // Monotonic timestamp of the last position we accepted.
  // Initialised to 0 so the very first update is always accepted.
  const lastTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (!driverId) return;

    // Reset per-driver state when the subscribed driver changes.
    lastTimestampRef.current = 0;

    const locRef = ref(rtdb, `drivers/${driverId}/location`);

    const unsubscribe = onValue(locRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // ── Timestamp monotonicity guard ──────────────────────────────────
      // The backend writes `updatedAt: Date.now()` alongside every position.
      // If that value is missing (legacy write) we fall back to 0, which
      // means we accept the update (safe: missing timestamp → unknown order).
      const incomingTs: number =
        typeof data.updatedAt === 'number' ? data.updatedAt : 0;

      if (incomingTs > 0 && incomingTs <= lastTimestampRef.current) {
        // This snapshot is older than or equal to the last accepted one —
        // discard it to prevent backward jumps.
        return;
      }

      // ── Coordinate validation ─────────────────────────────────────────
      const latitude =
        typeof data.latitude === 'number' ? data.latitude : parseFloat(data.latitude);
      const longitude =
        typeof data.longitude === 'number' ? data.longitude : parseFloat(data.longitude);

      if (isNaN(latitude) || isNaN(longitude) || (latitude === 0 && longitude === 0)) {
        return;
      }

      // Accept this update.
      if (incomingTs > 0) {
        lastTimestampRef.current = incomingTs;
      }

      callbackRef.current({ latitude, longitude });
    });

    return () => {
      off(locRef);
      unsubscribe();
    };
  }, [driverId]);
}
