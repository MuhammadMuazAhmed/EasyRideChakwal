import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DriverService } from '@/modules/driver/services/driverService';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;

/**
 * Polls /rides/incoming every 5 seconds when the driver is online.
 * When a new ride request arrives, navigates to IncomingRequest overlay.
 * This is the primary delivery mechanism since FCM may not always reach
 * the driver while the app is foregrounded or on background-limited devices.
 */
export function useIncomingRidesPoller() {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const isOnline = useDriverStore((s) => s.isOnline);
  const activeRide = useDriverStore((s) => s.activeRide);
  const setIncomingRequests = useDriverStore((s) => s.setIncomingRequests);

  // Track which ride IDs we've already shown to avoid re-displaying on each poll
  const shownRideIdsRef = useRef<Set<string>>(new Set());
  // Track whether IncomingRequest overlay is currently open to avoid duplicate navigation
  const isShowingOverlayRef = useRef(false);

  const { data: incomingRides } = useQuery({
    queryKey: QUERY_KEYS.incomingRequests(isOnline),
    queryFn: () => DriverService.getIncomingRequests(),
    // Only poll when driver is online and has no active accepted ride
    enabled: isOnline && !activeRide,
    refetchInterval: 5000,
    // Don't refetch on window focus — rely only on the interval
    refetchOnWindowFocus: false,
    // Silent errors — offline driver won't receive 401s that crash the screen
    retry: false,
  });

  // Sync latest results into the store (so DashboardScreen count can be displayed later if needed)
  useEffect(() => {
    if (incomingRides) {
      setIncomingRequests(incomingRides);
    }
  }, [incomingRides, setIncomingRequests]);

  // When we go offline or gain an active ride, clear the shown-set so we start fresh next time online
  useEffect(() => {
    if (!isOnline || activeRide) {
      shownRideIdsRef.current = new Set();
      isShowingOverlayRef.current = false;
      // Clear stale cached results so next online session fetches fresh
      void queryClient.removeQueries({ queryKey: QUERY_KEYS.incomingRequests(isOnline) });
    }
  }, [isOnline, activeRide, queryClient]);

  // Navigate to IncomingRequest when a new ride appears
  useEffect(() => {
    if (!incomingRides || incomingRides.length === 0) return;
    if (!isOnline || activeRide) return;
    // Don't push another overlay if one is already showing
    if (isShowingOverlayRef.current) return;

    // Find the first ride we haven't shown yet (newest first — backend sorts by createdAt desc)
    const nextRide = incomingRides.find((ride: any) => {
      const rideId: string = ride._id ?? ride.id;
      return !shownRideIdsRef.current.has(rideId);
    });

    if (!nextRide) return;

    const rideId: string = nextRide._id ?? nextRide.id;
    shownRideIdsRef.current.add(rideId);
    isShowingOverlayRef.current = true;

    navigation.navigate('IncomingRequest', { ride: nextRide });

    // After 20 seconds (15s countdown + 5s buffer), allow next request to be shown
    const timer = setTimeout(() => {
      isShowingOverlayRef.current = false;
    }, 20_000);

    return () => clearTimeout(timer);
  }, [incomingRides, isOnline, activeRide, navigation]);
}
