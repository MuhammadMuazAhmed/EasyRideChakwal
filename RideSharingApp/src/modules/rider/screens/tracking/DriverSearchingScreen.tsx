import { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';

import { TopBar } from '@/shared/components/common/TopBar';
import { MapBottomSheet } from '@/shared/components/common/SearchBar';
import { RideMap } from '@/rider/components/map/RideMap';
import { useRideStore } from '@/rider/store/rideStore';
import { RideService } from '@/api/services/rideService';
import { useRoutePolyline } from '@/rider/hooks/useRoutePolyline';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'DriverSearching'>;

export function DriverSearchingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const pickup = useRideStore((s) => s.pickup);
  const destination = useRideStore((s) => s.destination);
  const selectedVehicle = useRideStore((s) => s.selectedVehicle);
  const paymentMethod = useRideStore((s) => s.paymentMethod);
  const currentRide = useRideStore((s) => s.currentRide);
  const setCurrentRide = useRideStore((s) => s.setCurrentRide);

  const { data: routeData } = useRoutePolyline(pickup?.coordinates, destination?.coordinates);

  const hasRequested = useRef(false);

  const requestMutation = useMutation({
    mutationFn: () => {
      if (!pickup || !destination) throw new Error('Missing location details');
      return RideService.requestRide({
        pickup,
        destination,
        vehicleType: selectedVehicle,
        paymentMethod,
      });
    },
    onSuccess: (ride) => {
      setCurrentRide(ride);
    },
    onError: (err: any) => {
      Alert.alert('Booking Failed', err.response?.data?.message ?? err.message);
      navigation.popToTop();
    },
  });

  useEffect(() => {
    if (!hasRequested.current) {
      hasRequested.current = true;
      requestMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => {
    if (currentRide?.id) {
      navigation.navigate('CancelRide');
      return;
    }
    navigation.popToTop();
  };

  return (
    <View className="flex-1">
      <TopBar showLogo title="Finding Driver..." />
      <RideMap 
        pickup={pickup?.coordinates} 
        destination={destination?.coordinates} 
        routePolyline={routeData?.polyline}
        showRoute 
      />
      <MapBottomSheet>
        <View className="items-center py-4">
          <ActivityIndicator size="large" color="#F5C400" />
          <Text className="mt-3 text-sm font-bold text-text-primary">Driver dhoond rahe hain...</Text>
          <Text className="mt-1 text-xs text-text-tertiary">Please wait a moment</Text>
        </View>
        <Pressable onPress={handleCancel}>
          <Text className="py-2 text-center text-xs font-semibold text-danger">Cancel Request</Text>
        </Pressable>
      </MapBottomSheet>
    </View>
  );
}
