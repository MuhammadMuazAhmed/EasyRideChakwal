import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { VehicleOptionCard } from '@/rider/components/ride/RideComponents';
import { useRideStore } from '@/rider/store/rideStore';
import { useTheme } from '@/shared/theme';
import { vehicleOptions } from '@/shared/constants/mockData';
import { calculateEstimatedFare, formatCurrency } from '@/shared/utils';
import { RideService } from '@/api/services/rideService';
import type { VehicleType } from '@/shared/types';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'VehicleSelection'>;

export function VehicleSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const pickup = useRideStore((s) => s.pickup);
  const destination = useRideStore((s) => s.destination);
  const selectedVehicle = useRideStore((s) => s.selectedVehicle);
  const setSelectedVehicle = useRideStore((s) => s.setSelectedVehicle);
  const setFareEstimate = useRideStore((s) => s.setFareEstimate);

  const { data: fareData, isLoading } = useQuery({
    queryKey: ['fareEstimate', pickup?.coordinates, destination?.coordinates],
    queryFn: async () => {
      if (!pickup?.coordinates || !destination?.coordinates) return null;
      return await RideService.getFareEstimate(pickup.coordinates, destination.coordinates);
    },
    enabled: !!(pickup?.coordinates && destination?.coordinates),
  });

  const estimatedFare = fareData?.estimates?.[selectedVehicle] ?? 0;
  const distanceText = fareData?.distance ? `${fareData.distance.toFixed(1)}km` : '—';

  useEffect(() => {
    if (fareData?.estimates?.[selectedVehicle] != null) {
      setFareEstimate(fareData.estimates[selectedVehicle], fareData.distance ?? 0);
    }
  }, [fareData, selectedVehicle, setFareEstimate]);

  const handleContinue = () => {
    navigation.navigate('PaymentMethod');
  };

  const { theme } = useTheme();

  return (
    <ScreenContainer>
      {/* Header with Logo, Title, and Subtitle */}
      <TopBar
        variant="light"
        showLogo
        title="Easy Ride Chakwal"
        subtitle="Choose Vehicle"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />

      <ScrollView
        className="flex-1 px-4 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Compact Route Summary Card */}
        <View
          style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
          className="mb-5 rounded-2xl border p-3.5 shadow-sm"
        >
          {/* Pickup Row */}
          <View className="flex-row items-center gap-3">
            <View className="h-2.5 w-2.5 rounded-full bg-[#F5C400]" />
            <View className="flex-1">
              <Text style={{ color: theme.textPrimary }} className="text-[13px] font-bold" numberOfLines={1}>
                {pickup?.name ?? 'Pickup Location'}
              </Text>
              {pickup?.address && pickup.address !== pickup.name ? (
                <Text style={{ color: theme.textSecondary }} className="text-[11px] mt-0.5" numberOfLines={1}>
                  {pickup.address}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Dashed Connecting Line */}
          <View style={{ borderColor: theme.border }} className="ml-[4px] my-1 h-3.5 border-l-2 border-dashed" />

          {/* Destination Row */}
          <View className="flex-row items-center gap-3">
            <View className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
            <View className="flex-1">
              <Text style={{ color: theme.textPrimary }} className="text-[13px] font-bold" numberOfLines={1}>
                {destination?.name ?? 'Destination'}
              </Text>
              {destination?.address && destination.address !== destination.name ? (
                <Text style={{ color: theme.textSecondary }} className="text-[11px] mt-0.5" numberOfLines={1}>
                  {destination.address}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Section Heading */}
        <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold uppercase tracking-wider mb-2.5">
          Select Ride Type
        </Text>

        {/* Vehicle Options List */}
        <View className="mb-3">
          {vehicleOptions.map((vehicle) => (
            <VehicleOptionCard
              key={vehicle.type}
              type={vehicle.type as VehicleType}
              fare={fareData?.estimates?.[vehicle.type] ?? calculateEstimatedFare(3.2, vehicle.baseFare, vehicle.perKmRate)}
              eta={vehicle.eta}
              selected={selectedVehicle === vehicle.type}
              onSelect={() => setSelectedVehicle(vehicle.type as VehicleType)}
            />
          ))}
        </View>

        {/* Fare Estimate Card */}
        <View
          style={{ backgroundColor: theme.accentLight, borderColor: theme.accentBorder }}
          className="mb-6 rounded-2xl border p-4 shadow-sm"
        >
          <Text style={{ color: theme.accentText }} className="text-[11px] font-bold uppercase tracking-wider mb-1">
            Fare Estimate
          </Text>
          <View className="flex-row items-center justify-between">
            <Text style={{ color: theme.textSecondary }} className="text-[13px] font-medium">
              Base + {distanceText}
            </Text>
            {isLoading ? (
              <ActivityIndicator color={theme.textPrimary} size="small" />
            ) : (
              <Text style={{ color: theme.textPrimary }} className="text-[18px] font-extrabold">
                {formatCurrency(estimatedFare)}
              </Text>
            )}
          </View>
        </View>

        {/* Continue Button */}
        <Pressable
          onPress={handleContinue}
          disabled={isLoading}
          className="h-[54px] rounded-xl items-center justify-center flex-row active:opacity-90 bg-accent"
          style={{
            opacity: isLoading ? 0.6 : 1,
            width: '100%',
          }}
        >
          {isLoading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#111111" size="small" />
              <Text className="text-[16px] font-bold text-primary">Calculating...</Text>
            </View>
          ) : (
            <Text className="text-[16px] font-bold text-primary tracking-wide">
              Continue to Payment →
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}


