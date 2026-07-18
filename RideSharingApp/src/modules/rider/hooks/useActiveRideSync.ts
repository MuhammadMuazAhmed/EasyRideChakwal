import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RideService } from '@/api/services/rideService';
import { useRideStore } from '@/rider/store/rideStore';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { RiderStackParamList } from '@/navigation/types';
import { Alert } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList>;

const NO_DRIVER_TIMEOUT_MS = 60_000;

export function useActiveRideSync() {
  const navigation = useNavigation<NavigationProp>();

  const currentRide = useRideStore((state) => state.currentRide);
  const setCurrentRide = useRideStore((state) => state.setCurrentRide);
  const setRideStatus = useRideStore((state) => state.setRideStatus);
  const assignDriver = useRideStore((state) => state.assignDriver);
  const completeRide = useRideStore((state) => state.completeRide);
  const cancelRide = useRideStore((state) => state.cancelRide);
  const resetBooking = useRideStore((state) => state.resetBooking);

  const prevStatusRef = useRef<string | null>(null);
  const searchingStartedAtRef = useRef<number | null>(null);
  const noDriverHandledRef = useRef(false);

  const { data: activeRide } = useQuery({
    queryKey: QUERY_KEYS.currentRide,
    queryFn: () => RideService.getCurrentRide(),
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (activeRide) {
      setCurrentRide(activeRide);
    }
  }, [activeRide, setCurrentRide]);

  useEffect(() => {
    if (!activeRide) {
      if (currentRide && ['searching'].includes(currentRide.status)) {
        // Keep local searching state until timeout or explicit cancel.
      }
      prevStatusRef.current = null;
      searchingStartedAtRef.current = null;
      noDriverHandledRef.current = false;
      return;
    }

    const { status } = activeRide;

    if (status === 'searching') {
      if (!searchingStartedAtRef.current) {
        searchingStartedAtRef.current = Date.now();
      }
    } else {
      searchingStartedAtRef.current = null;
      noDriverHandledRef.current = false;
    }

    if (prevStatusRef.current === status && currentRide?.id === activeRide.id) {
      return;
    }

    if (['driver_assigned', 'driver_en_route', 'driver_arrived'].includes(status)) {
      if (activeRide.driver) {
        assignDriver(activeRide.driver);
      } else {
        setRideStatus(status);
      }
      if (prevStatusRef.current === 'searching' || prevStatusRef.current === null) {
        navigation.navigate('DriverTracking');
      }
    } else if (status === 'in_progress') {
      setRideStatus('in_progress');
      if (prevStatusRef.current !== 'in_progress') {
        navigation.navigate('ActiveTrip');
      }
    } else if (status === 'completed') {
      setCurrentRide(activeRide);
      completeRide();
      if (prevStatusRef.current !== 'completed') {
        navigation.navigate('TripCompleted');
      }
    } else if (status === 'cancelled') {
      cancelRide();
      // Only show the "Ride Cancelled" alert if the rider did NOT trigger it
      // themselves — i.e., currentRide is still set in the store, which means
      // the cancellation came from the driver/server side, not from CancelRideScreen.
      // When the rider cancels via CancelRideScreen, resetBooking() is called first,
      // clearing currentRide, so we skip the alert to avoid a double-cancel loop.
      if (prevStatusRef.current !== 'cancelled' && currentRide) {
        Alert.alert('Ride Cancelled', 'Your ride has been cancelled by the driver.', [
          {
            text: 'OK',
            onPress: () => {
              resetBooking();
              navigation.popToTop();
            },
          },
        ]);
      }
    } else if (status === 'no_driver') {
      resetBooking();
      if (prevStatusRef.current !== 'no_driver') {
        navigation.navigate('NoDriver');
      }
    }

    prevStatusRef.current = status;
  }, [
    activeRide,
    assignDriver,
    cancelRide,
    completeRide,
    currentRide?.id,
    currentRide?.status,
    navigation,
    resetBooking,
    setCurrentRide,
    setRideStatus,
  ]);

  useEffect(() => {
    if (!activeRide || activeRide.status !== 'searching' || noDriverHandledRef.current) {
      return;
    }

    const startedAt = searchingStartedAtRef.current ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(NO_DRIVER_TIMEOUT_MS - elapsed, 0);

    const timer = setTimeout(() => {
      if (noDriverHandledRef.current) return;
      noDriverHandledRef.current = true;

      void (async () => {
        try {
          await RideService.cancelRide(activeRide.id, 'No driver found within timeout');
        } catch {
          // Still navigate — local state must recover even if cancel fails.
        } finally {
          resetBooking();
          navigation.navigate('NoDriver');
        }
      })();
    }, remaining);

    return () => clearTimeout(timer);
  }, [activeRide, navigation, resetBooking]);
}
