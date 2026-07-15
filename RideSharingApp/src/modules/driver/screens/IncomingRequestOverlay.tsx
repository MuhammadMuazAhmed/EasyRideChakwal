import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar, BackButton } from '@/shared/components/common/TopBar';
import { MapBottomSheet } from '@/shared/components/common/SearchBar';
import { RideMap } from '@/rider/components/map/RideMap';
import { Button } from '@/shared/components/ui/Button';
import { DriverService } from '@/modules/driver/services/driverService';
import { RideService } from '@/api/services/rideService';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'IncomingRequest'>;
type RouteProps = RouteProp<DriverStackParamList, 'IncomingRequest'>;

export function IncomingRequestOverlay() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { ride } = route.params;

  const setActiveRide = useDriverStore((s) => s.setActiveRide);
  const [seconds, setSeconds] = useState(15);
  const [loading, setLoading] = useState(false);

  // 15 second countdown timer
  useEffect(() => {
    if (seconds <= 0) {
      navigation.goBack();
      return;
    }
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds, navigation]);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const rideId = ride._id ?? ride.id;
      await DriverService.acceptRide(rideId);
      // acceptRide only returns {rideId, driver} — no pickup/destination.
      // Fetch the full ride so ActiveTripScreen has all fields it needs.
      const fullRide = await RideService.getRideDetails(rideId);
      setActiveRide(fullRide);
      navigation.replace('ActiveTrip', { rideId });
    } catch (err: any) {
      Alert.alert('Unable to Accept', err.response?.data?.message ?? err.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1">
      <TopBar title="Incoming Ride Request" leftAction={<BackButton onPress={handleReject} />} />
      
      <RideMap
        pickup={ride.pickup.coordinates}
        destination={ride.destination.coordinates}
        showRoute
      />

      <MapBottomSheet>
        <View className="items-center py-2">
          {/* Circular Countdown Progress */}
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-full border-4 border-accent bg-accent-light">
            <Text className="text-lg font-black text-primary">{seconds}s</Text>
          </View>

          <Text className="text-xs font-bold text-text-secondary uppercase">Estimated Fare</Text>
          <Text className="my-1 text-2xl font-black text-text-primary">PKR {ride.estimatedFare}</Text>
          <Text className="mb-4 text-[10px] text-text-tertiary">
            Distance: {ride.distance?.toFixed(1) ?? '2.5'} km • {ride.duration?.toFixed(0) ?? '10'} mins
          </Text>
        </View>

        {/* Pickup & Destination Address Card */}
        <View className="mb-5 rounded-xl bg-gray-50 p-4 border border-border">
          <View className="mb-3 flex-row items-center">
            <View className="mr-2 h-2 w-2 rounded-full bg-success" />
            <Text className="flex-1 text-[11px] font-bold text-text-primary numberOfLines={1}">
              {ride.pickup.name}
            </Text>
          </View>
          <View className="flex-row items-center border-t border-gray-200/50 pt-3">
            <View className="mr-2 h-2 w-2 rounded-full bg-danger" />
            <Text className="flex-1 text-[11px] font-bold text-text-primary numberOfLines={1}">
              {ride.destination.name}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <Pressable
            onPress={handleReject}
            disabled={loading}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: '#E5E5E5',
              backgroundColor: 'white',
            }}
          >
            <Text className="text-xs font-bold text-text-secondary">Reject</Text>
          </Pressable>

          <View className="flex-1">
            <Button
              title="Accept Ride"
              variant="yellow"
              loading={loading}
              onPress={() => void handleAccept()}
            />
          </View>
        </View>
      </MapBottomSheet>
    </View>
  );
}
