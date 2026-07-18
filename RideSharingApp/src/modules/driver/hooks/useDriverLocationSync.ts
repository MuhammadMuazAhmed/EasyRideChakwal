import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { DriverService } from '@/modules/driver/services/driverService';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';

/**
 * Maximum GPS horizontal accuracy (in metres) to accept.
 * Fixes with a reported accuracy radius above this are discarded as noise.
 */
const MAX_ACCURACY_METRES = 25;

/**
 * Minimum change in degrees before we treat a new fix as a real movement.
 * ~0.00001° ≈ 1.1 m at the equator — anything smaller is GPS dither, not
 * actual movement, and we skip it to avoid marker flutter while stationary.
 */
const MIN_MOVEMENT_DEGREES = 0.00001;

export function useDriverLocationSync() {
  const isOnline = useDriverStore((s) => s.isOnline);
  const driverId = useAuthStore((s) => s.driverId);

  /** Last accepted { latitude, longitude, timestamp } */
  const lastRef = useRef<{ latitude: number; longitude: number; timestamp: number } | null>(null);

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
            /**
             * BestForNavigation: GPS chip at full power — most accurate fix
             * available. This eliminates the Wi-Fi/cell offset that Balanced
             * introduces when the GPS chip is idle.
             */
            accuracy: Location.Accuracy.BestForNavigation,
            /**
             * 2-second interval keeps the marker fluid during active driving
             * without hammering the battery/API.
             */
            timeInterval: 2000,
            /**
             * 3-metre distance gate: skip callbacks when device is stationary,
             * so we never send noise that causes the marker to drift in place.
             */
            distanceInterval: 3,
          },
          (loc) => {
            const { latitude, longitude, accuracy } = loc.coords;
            // timestamp is on the LocationObject itself, not on coords
            const fixTime: number = loc.timestamp ?? Date.now();

            // ── 1. Accuracy filter ────────────────────────────────────────
            // Reject fixes whose reported horizontal-error radius exceeds the
            // threshold.  A high value means the GPS chip hasn't locked yet
            // (e.g., cold start, poor sky view, heavy indoor signal) and the
            // coordinate could be off by tens of metres.
            if (accuracy != null && accuracy > MAX_ACCURACY_METRES) {
              return;
            }

            // ── 2. Timestamp monotonicity guard ──────────────────────────
            // Android's fused provider occasionally delivers buffered / cached
            // fixes whose timestamp is older than the last accepted fix.
            // Accepting them would temporarily move the marker backward.
            const prev = lastRef.current;
            if (prev && fixTime <= prev.timestamp) {
              return;
            }

            // ── 3. Movement threshold ─────────────────────────────────────
            // Ignore updates that represent GPS dither while stationary.
            // We compare Manhattan distance in degrees; MIN_MOVEMENT_DEGREES
            // (~1 m) is the minimum displacement we consider meaningful.
            const moved = prev
              ? Math.abs(prev.latitude - latitude) + Math.abs(prev.longitude - longitude)
              : Infinity;

            if (moved < MIN_MOVEMENT_DEGREES) {
              return;
            }

            // ── 4. Accept & propagate ─────────────────────────────────────
            lastRef.current = { latitude, longitude, timestamp: fixTime };

            // Mirror into local store → driver's own map marker updates live.
            useLocationStore.getState().setCurrentLocation({ latitude, longitude });

            // Push to backend (→ MongoDB + Firebase RTDB).
            void DriverService.updateLocation({ latitude, longitude }).catch((err) => {
              console.error('[LocationSync] Location update failed', err);
            });
          }
        );
      } catch (err) {
        console.error('[LocationSync] Error starting location watch', err);
      }
    }

    void startWatching();

    return () => {
      subscription?.remove();
    };
  }, [isOnline, driverId]);
}
