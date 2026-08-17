import { useRef, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { TopBar, BackButton } from '@/shared/components/common/TopBar';
import { MapBottomSheet } from '@/shared/components/common/SearchBar';
import { RideMap } from '@/rider/components/map/RideMap';
import { useRideStore } from '@/rider/store/rideStore';
import { useTheme } from '@/shared/theme';
import { RideService } from '@/api/services/rideService';
import { useRoutePolyline } from '@/rider/hooks/useRoutePolyline';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'DriverSearching'>;

function SearchingPulseIndicator() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.35,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.15,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulseAnim, opacityAnim]);

  return (
    <View className="items-center justify-center h-20 w-20 my-1">
      {/* Outer Pulse Ring */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
          opacity: opacityAnim,
        }}
        className="absolute h-20 w-20 rounded-full bg-accent/20 border-2 border-accent/40"
      />

      {/* Inner Ring with ActivityIndicator */}
      <View className="h-14 w-14 items-center justify-center rounded-full bg-accent/10 border border-accent/60 shadow-md">
        <ActivityIndicator size="large" color="#F5C400" />
      </View>
    </View>
  );
}

export function DriverSearchingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
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

  // Only block back when this screen is focused — so CancelRideScreen
  // (pushed on top) can use the hardware back button normally.
  useFocusEffect(
    useCallback(() => {
      const backAction = () => true; // consume the event
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [])
  );

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
      <TopBar
        variant="light"
        showLogo
        title="Easy Ride Chakwal"
        subtitle="Finding Driver..."
        leftAction={<BackButton onPress={handleCancel} />}
      />
      <RideMap
        pickup={pickup?.coordinates}
        destination={destination?.coordinates}
        routePolyline={routeData?.polyline}
        showRoute
      />
      <MapBottomSheet>
        <View className="px-1 pb-3 pt-1">
          {/* Animated Searching Indicator */}
          <View className="items-center justify-center py-1">
            <SearchingPulseIndicator />
          </View>

          {/* Primary & Secondary Status */}
          <View className="items-center mb-4">
            <Text style={{ color: theme.textPrimary }} className="text-[18px] font-extrabold text-center">
              Driver dhoond rahe hain...
            </Text>
            <Text style={{ color: theme.textSecondary }} className="text-[13px] font-medium text-center mt-0.5">
              Please wait a moment · Searching drivers near you
            </Text>
          </View>

          {/* Compact Route Summary Card */}
          {pickup && destination ? (
            <View
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="mb-4 rounded-2xl border p-3.5 shadow-sm"
            >
              {/* Pickup Row */}
              <View className="flex-row items-center gap-3">
                <View className="h-2.5 w-2.5 rounded-full bg-[#F5C400]" />
                <View className="flex-1">
                  <Text style={{ color: theme.textPrimary }} className="text-[13px] font-bold" numberOfLines={1}>
                    {pickup.name}
                  </Text>
                  {pickup.address && pickup.address !== pickup.name ? (
                    <Text style={{ color: theme.textSecondary }} className="text-[11px] mt-0.5" numberOfLines={1}>
                      {pickup.address}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Connecting Dashed Line */}
              <View style={{ borderColor: theme.border }} className="ml-[4px] my-1 h-3 border-l-2 border-dashed" />

              {/* Destination Row */}
              <View className="flex-row items-center gap-3">
                <View className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                <View className="flex-1">
                  <Text style={{ color: theme.textPrimary }} className="text-[13px] font-bold" numberOfLines={1}>
                    {destination.name}
                  </Text>
                  {destination.address && destination.address !== destination.name ? (
                    <Text style={{ color: theme.textSecondary }} className="text-[11px] mt-0.5" numberOfLines={1}>
                      {destination.address}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Vehicle & Payment Badge Row */}
              {(selectedVehicle || paymentMethod) ? (
                <View className="mt-2.5 flex-row items-center justify-between border-t pt-2" style={{ borderColor: theme.divider }}>
                  <View style={{ backgroundColor: theme.accentLight }} className="rounded-lg px-2.5 py-1">
                    <Text style={{ color: theme.accentText }} className="text-[11px] font-bold capitalize">
                      🚗 {selectedVehicle}
                    </Text>
                  </View>
                  <Text style={{ color: theme.textSecondary }} className="text-[11px] font-semibold capitalize">
                    💳 {paymentMethod} Payment
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Cancel Request Button */}
          <Pressable
            onPress={handleCancel}
            className="h-[50px] w-full rounded-xl items-center justify-center flex-row border border-danger/40 bg-danger/10 active:opacity-80"
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text className="text-[15px] font-bold text-danger">
              Cancel Request
            </Text>
          </Pressable>
        </View>
      </MapBottomSheet>
    </View>
  );
}

