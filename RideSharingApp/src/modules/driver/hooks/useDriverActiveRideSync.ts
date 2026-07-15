import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RideService } from '@/api/services/rideService';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList>;

export function useDriverActiveRideSync() {
  const navigation = useNavigation<NavigationProp>();
  const setActiveRide = useDriverStore((s) => s.setActiveRide);
  const activeRide = useDriverStore((s) => s.activeRide);
  const prevStatusRef = useRef<string | null>(null);

  const { data: currentRide } = useQuery({
    queryKey: QUERY_KEYS.currentRide,
    queryFn: () => RideService.getCurrentRide(),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!currentRide) {
      if (activeRide && prevStatusRef.current && !['completed', 'cancelled'].includes(prevStatusRef.current)) {
        setActiveRide(null);
      }
      prevStatusRef.current = null;
      return;
    }

    setActiveRide(currentRide);

    const { status, id: rideId } = currentRide;
    if (prevStatusRef.current === status && activeRide?.id === rideId) {
      return;
    }

    if (['driver_assigned', 'driver_en_route', 'driver_arrived', 'in_progress'].includes(status)) {
      if (prevStatusRef.current !== status || activeRide?.id !== rideId) {
        navigation.navigate('ActiveTrip', { rideId });
      }
    } else if (status === 'cancelled') {
      setActiveRide(null);
      if (prevStatusRef.current !== 'cancelled') {
        Alert.alert('Ride Cancelled', 'Yeh ride cancel ho chuki hai.', [
          { text: 'OK', onPress: () => navigation.navigate('DriverTabs', { screen: 'Dashboard' }) },
        ]);
      }
    }

    prevStatusRef.current = status;
  }, [activeRide?.id, currentRide, navigation, setActiveRide]);
}
