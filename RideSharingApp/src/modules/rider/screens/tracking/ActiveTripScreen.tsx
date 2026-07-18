import { Pressable, Text, View, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { TopBar } from '@/shared/components/common/TopBar';
import { MapBottomSheet } from '@/shared/components/common/SearchBar';
import { RideMap } from '@/rider/components/map/RideMap';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { useRideStore } from '@/rider/store/rideStore';
import { useRoutePolyline } from '@/rider/hooks/useRoutePolyline';
import { formatCurrency, calculateDistance } from '@/shared/utils';
import { RideService } from '@/api/services/rideService';
import { useDriverLocationListener } from '@/rider/hooks/useDriverLocationListener';
import type { RiderStackParamList } from '@/navigation/types';
import type { Coordinates } from '@/shared/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'ActiveTrip'>;

export function ActiveTripScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentRide = useRideStore((s) => s.currentRide);
  const setRideStatus = useRideStore((s) => s.setRideStatus);
  const updateCurrentFare = useRideStore((s) => s.updateCurrentFare);
  const updateDriverCoordinates = useRideStore((s) => s.updateDriverCoordinates);
  const driver = currentRide?.driver;

  // Only block back when this screen is focused.
  useFocusEffect(
    useCallback(() => {
      const backAction = () => true;
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [])
  );

  // Stream live driver coordinates from Firebase RTDB during the active trip
  const handleLiveLocation = useCallback(
    (coords: Coordinates) => {
      updateDriverCoordinates(coords);
    },
    [updateDriverCoordinates]
  );

  const firebaseDriverId = driver?.id ?? null;
  useDriverLocationListener(firebaseDriverId, handleLiveLocation);

  const { data: routeData } = useRoutePolyline(currentRide?.pickup?.coordinates, currentRide?.destination?.coordinates);

  const { data: rideData } = useQuery({
    queryKey: ['rideDetails', currentRide?.id],
    queryFn: () => RideService.getRideDetails(currentRide!.id),
    enabled: !!currentRide?.id,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (rideData && rideData.status === 'completed') {
      useRideStore.setState({ currentRide: rideData });
      navigation.navigate('TripCompleted');
    }
  }, [rideData, navigation]);

  useEffect(() => {
    setRideStatus('in_progress');
  }, [setRideStatus]);

  if (!currentRide || !driver) return null;

  const displayFare = currentRide.fare || currentRide.estimatedFare || 0;

  const driverCoord = driver.coordinates;
  const destCoord = currentRide.destination.coordinates;

  const hasLiveFix = driverCoord && (driverCoord.latitude !== 0 || driverCoord.longitude !== 0) &&
                     destCoord && (destCoord.latitude !== 0 || destCoord.longitude !== 0);

  let distanceKm = currentRide.distance || 2.4;
  let etaMinutes = currentRide.duration || 8;

  if (hasLiveFix) {
    distanceKm = calculateDistance(
      driverCoord.latitude,
      driverCoord.longitude,
      destCoord.latitude,
      destCoord.longitude
    );
    etaMinutes = Math.max(1, Math.ceil((distanceKm / 25) * 60));
  }

  return (
    <View className="flex-1">
      <TopBar
        title="Trip in Progress"
        leftAction={<View className="h-2 w-2 rounded-full bg-success" />}
        rightAction={
          <View className="rounded-full bg-accent px-2.5 py-0.5">
            <Text className="text-[11px] font-extrabold text-primary">{formatCurrency(displayFare)}</Text>
          </View>
        }
      />
      <RideMap
        pickup={currentRide.pickup.coordinates}
        destination={currentRide.destination.coordinates}
        driverLocation={driver.coordinates}
        routePolyline={routeData?.polyline}
        showRoute
      />

      <View className="absolute left-2 right-2 top-14">
        <View className="rounded-lg bg-[rgba(0,0,0,0.8)] p-2.5">
          <Text className="text-[10px] text-[#AAAAAA]">Destination</Text>
          <Text className="text-sm font-bold text-white">{currentRide.destination.name}</Text>
          <Text className="text-[11px] text-accent">
            Arriving in {etaMinutes} min · {distanceKm.toFixed(1)} km left
          </Text>
        </View>
      </View>

      <MapBottomSheet>
        <View className="mb-2.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <Avatar initials={driver.avatarInitials} size="md" />
            <View>
              <Text className="text-sm font-bold text-text-primary">
                {driver.firstName} {driver.lastName}
              </Text>
              <Text className="text-[11px] text-text-tertiary">
                {driver.vehicleModel} · {driver.vehiclePlate}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-[11px] text-text-tertiary">Fare so far</Text>
            <Text className="text-lg font-extrabold text-text-primary">{formatCurrency(displayFare)}</Text>
          </View>
        </View>

        <View className="mb-2 flex-row gap-2">
          <View className="flex-1 items-center rounded-lg bg-surface-muted p-2">
            <Text className="text-[10px] text-text-tertiary">Distance</Text>
            <Text className="text-sm font-bold text-text-primary">{distanceKm.toFixed(1)} km</Text>
          </View>
          <View className="flex-1 items-center rounded-lg bg-surface-muted p-2">
            <Text className="text-[10px] text-text-tertiary">Time</Text>
            <Text className="text-sm font-bold text-text-primary">{etaMinutes} min</Text>
          </View>
        </View>

        <Pressable className="mb-2 rounded-lg border-[1.5px] border-green-200 bg-green-50 py-2.5">
          <Text className="text-center text-xs font-bold text-success">
            📤 Share Trip with Family
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('SOS')}>
          <Badge label="🚨 SOS Emergency" variant="red" className="self-center px-3 py-1" />
        </Pressable>
      </MapBottomSheet>
    </View>
  );
}
