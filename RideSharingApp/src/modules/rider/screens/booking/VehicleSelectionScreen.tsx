import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { VehicleOptionCard } from '@/rider/components/ride/RideComponents';
import { Button } from '@/shared/components/ui/Button';
import { useRideStore } from '@/rider/store/rideStore';
import { vehicleOptions } from '@/shared/constants/mockData';
import { calculateEstimatedFare, formatCurrency } from '@/shared/utils';
import { useQuery } from '@tanstack/react-query';
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

  return (
    <ScreenContainer className="bg-white">
      <TopBar
        title="Choose Vehicle"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 px-3 pt-3">
        <View className="mb-4 rounded-xl bg-surface-muted p-3">
          <View className="mb-1 flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-accent" />
            <Text className="text-xs text-text-primary">{pickup?.name ?? 'Pickup'}</Text>
          </View>
          <View className="ml-[3px] h-2 border-l-2 border-dashed border-border" />
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-success" />
            <Text className="text-xs text-text-primary">{destination?.name ?? 'Destination'}</Text>
          </View>
        </View>

        <Text className="mb-2 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
          Select Ride Type
        </Text>
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

        <View className="mb-4 mt-2 rounded-lg border border-[#F5E090] bg-accent-light p-2.5">
          <Text className="text-[11px] font-bold text-[#7A5800]">Fare Estimate</Text>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-xs text-text-secondary">Base + {distanceText}</Text>
            <Text className="text-base font-extrabold text-text-primary">
              {isLoading ? '...' : formatCurrency(estimatedFare)}
            </Text>
          </View>
        </View>

        <Button title="Continue to Payment" onPress={handleContinue} loading={isLoading} disabled={isLoading} />
      </ScrollView>
    </ScreenContainer>
  );
}
