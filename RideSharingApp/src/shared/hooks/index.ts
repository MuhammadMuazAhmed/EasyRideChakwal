import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { useLocationStore } from '@/store/locationStore';
import { CHAKWAL_REGION } from '@/shared/theme';

export function useCurrentLocation() {
  const {
    currentLocation,
    hasPermission,
    isLoading,
    error,
    setCurrentLocation,
    setPermission,
    setLoading,
    setError,
  } = useLocationStore();

  // Track whether we've already initiated a request this mount so the
  // useEffect never fires more than once, even when isLoading or
  // hasPermission change as a result of the async callback.
  const hasRequested = useRef(false);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermission(granted);

      if (!granted) {
        setError('Location permission denied');
        setCurrentLocation({
          latitude: CHAKWAL_REGION.latitude,
          longitude: CHAKWAL_REGION.longitude,
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch {
      setError('Unable to get location');
      setCurrentLocation({
        latitude: CHAKWAL_REGION.latitude,
        longitude: CHAKWAL_REGION.longitude,
      });
    } finally {
      setLoading(false);
    }
  }, [setCurrentLocation, setError, setLoading, setPermission]);

  useEffect(() => {
    // Only request once per mount. Do not include hasPermission or
    // isLoading in dependencies — those change inside the async
    // callback which would re-trigger this effect and loop forever.
    if (!hasRequested.current && !hasPermission) {
      hasRequested.current = true;
      void requestLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount only

  return {
    location: currentLocation,
    hasPermission,
    isLoading,
    error,
    refresh: requestLocation,
  };
}

export * from './useQueries';

export function useCountdown(initialSeconds: number, onComplete?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || seconds <= 0) {
      if (seconds <= 0) onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, isRunning, onComplete]);

  const reset = useCallback(
    (newSeconds = initialSeconds) => {
      setSeconds(newSeconds);
      setIsRunning(true);
    },
    [initialSeconds],
  );

  const formatted = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return { seconds, formatted, isRunning, reset, pause: () => setIsRunning(false) };
}

export function useOtpTimer(initialSeconds = 30) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    setCanResend(false);
  }, [initialSeconds]);

  const formatted = `00:${String(seconds).padStart(2, '0')}`;

  return { seconds, formatted, canResend, reset };
}
