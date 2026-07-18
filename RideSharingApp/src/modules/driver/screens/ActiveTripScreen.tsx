import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View, BackHandler } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { TopBar } from '@/shared/components/common/TopBar';
import { MapBottomSheet } from '@/shared/components/common/SearchBar';
import { RideMap } from '@/rider/components/map/RideMap';
import { Button } from '@/shared/components/ui/Button';
import { DriverService } from '@/modules/driver/services/driverService';
import { RideService } from '@/api/services/rideService';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import { useCurrentLocation } from '@/shared/hooks';
import { useRoutePolyline } from '@/rider/hooks/useRoutePolyline';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'ActiveTrip'>;
type RouteProps = RouteProp<DriverStackParamList, 'ActiveTrip'>;

export function ActiveTripScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { rideId } = route.params;

  const setActiveRide = useDriverStore((s) => s.setActiveRide);
  const activeRide = useDriverStore((s) => s.activeRide);

  const [loading, setLoading] = useState(false);
  const { location: driverLocation } = useCurrentLocation();

  // Dynamic route calculation:
  // 1. Before pickup: from Driver's live location to Pickup location.
  // 2. After trip starts (in_progress): from Driver's live location to Destination location.
  const routeStart = driverLocation;
  const routeEnd = activeRide?.status === 'in_progress'
    ? activeRide?.destination?.coordinates
    : activeRide?.pickup?.coordinates;

  const { data: routeData } = useRoutePolyline(routeStart, routeEnd);

  // Only block back when this screen is focused.
  useFocusEffect(
    useCallback(() => {
      const backAction = () => true;
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [])
  );

  // Sync / query ride status
  const { data: rideData, refetch } = useQuery({
    queryKey: ['rideDetails', rideId],
    queryFn: () => RideService.getRideDetails(rideId),
    refetchInterval: 5000, // sync every 5s
  });

  useEffect(() => {
    if (rideData) {
      setActiveRide(rideData);
      if (rideData.status === 'completed') {
        navigation.replace('TripCompleted', {
          rideId,
          finalFare: rideData.fare || rideData.estimatedFare,
          driverEarning: Math.round((rideData.fare || rideData.estimatedFare) * 0.85),
          pickupName: rideData.pickup.name,
          destinationName: rideData.destination.name,
          paymentMethod: rideData.paymentMethod ?? 'cash',
          riderName: rideData.riderId?.firstName
            ? `${rideData.riderId.firstName} ${rideData.riderId.lastName ?? ''}`.trim()
            : undefined,
        });
      }
    }
  }, [rideData, setActiveRide, navigation, rideId]);

  if (!activeRide) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F5C400" />
      </View>
    );
  }

  const handleStart = async () => {
    setLoading(true);
    try {
      await DriverService.startRide(rideId);
      Alert.alert('Trip Started', 'Safar shuru ho chuka hai. Ehtiyat se drive karein.');
      void refetch();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    navigation.navigate('Chat', { rideId });
  };

  const showStartButton = activeRide.status === 'driver_arrived';

  return (
    <View className="flex-1">
      <TopBar
        title="Active Trip"
        rightAction={
          <Pressable onPress={handleChat} className="rounded-lg bg-black/10 px-3 py-1.5 active:opacity-80">
            <Text className="text-[10px] font-bold text-text-primary">Chat 💬</Text>
          </Pressable>
        }
      />

      <RideMap
        pickup={activeRide.pickup.coordinates}
        destination={activeRide.destination.coordinates}
        driverLocation={driverLocation}
        routePolyline={routeData?.polyline}
        showRoute
      />

      <MapBottomSheet>
        <View className="items-center py-2">
          <Text className="text-xs font-bold text-accent uppercase">
            {activeRide.status === 'in_progress' ? 'TRIP IN PROGRESS' : 'EN ROUTE TO PICKUP'}
          </Text>
          <Text className="my-1 text-base font-bold text-text-primary">
            Rider: {activeRide.riderId?.firstName ?? 'Customer'}
          </Text>
          <Text className="text-[10px] text-text-secondary mb-4">
            Est. Fare: PKR {activeRide.estimatedFare} • Pay: {activeRide.paymentMethod ?? 'Cash'}
          </Text>
        </View>

        {(activeRide.status === 'driver_assigned' || activeRide.status === 'driver_en_route' || activeRide.status === 'searching') && (
          <View className="items-center py-4 bg-neutral-50 rounded-xl mb-2 border border-neutral-100">
            <Text className="text-xs font-semibold text-text-secondary">
              Driving to pickup location...
            </Text>
            <Text className="text-[10px] text-text-tertiary mt-1">
              Trip starting button will appear automatically upon arrival.
            </Text>
          </View>
        )}

        {showStartButton && (
          <View className="gap-3">
            <View className="items-center py-2 bg-success/10 rounded-xl mb-2 border border-success/20">
              <Text className="text-[10px] font-bold text-success">✓ Arrived at Pickup Location</Text>
            </View>

            <Button
              title="Start Trip ▶"
              variant="yellow"
              loading={loading}
              onPress={() => void handleStart()}
            />
          </View>
        )}

        {activeRide.status === 'in_progress' && (
          <View className="items-center py-4 bg-success/5 rounded-xl border border-success/10">
            <Text className="text-xs font-semibold text-success">
              Trip in Progress...
            </Text>
            <Text className="text-[10px] text-text-tertiary mt-1">
              Trip will complete automatically when you reach the destination.
            </Text>
          </View>
        )}
      </MapBottomSheet>
    </View>
  );
}
