import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { ScreenContainer, TopBar } from '@/shared/components/common/TopBar';
import { DriverService } from '@/modules/driver/services/driverService';
import { useDriverStore } from '@/modules/driver/store/driverStore';
import { formatCurrency } from '@/shared/utils';
import type { DriverStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<DriverStackParamList, 'TripCompleted'>;
type RouteProps = RouteProp<DriverStackParamList, 'TripCompleted'>;

export function TripCompletedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { rideId, finalFare, driverEarning, pickupName, destinationName, paymentMethod, riderName } =
    route.params;
  const setDriverProfile = useDriverStore((s) => s.setDriverProfile);
  const setActiveRide = useDriverStore((s) => s.setActiveRide);

  useEffect(() => {
    setActiveRide(null);
    void DriverService.getProfile()
      .then(setDriverProfile)
      .catch(() => {});
  }, [setActiveRide, setDriverProfile]);

  return (
    <ScreenContainer className="bg-white">
      <TopBar title="Trip Complete!" />
      <View className="flex-1 items-center justify-center px-6">
        <Badge label="Trip Complete!" variant="green" className="mb-4 px-3 py-1" />
        <Text className="mb-1 text-4xl">🏁</Text>
        <Text className="mb-6 text-center text-[11px] text-text-tertiary">
          {pickupName} → {destinationName}
        </Text>

        <View className="mb-4 w-full rounded-xl bg-surface-muted p-4">
          <Text className="text-center text-[10px] font-bold uppercase text-text-tertiary">
            Total Fare
          </Text>
          <Text className="text-center text-3xl font-extrabold text-text-primary">
            {formatCurrency(finalFare)}
          </Text>
          <Text className="mt-1 text-center text-xs text-text-secondary capitalize">
            Paid via {paymentMethod}
          </Text>
        </View>

        <View className="mb-8 w-full rounded-xl border border-success/30 bg-success/5 p-4">
          <Text className="text-center text-[10px] font-bold uppercase text-success">
            Your Earning
          </Text>
          <Text className="text-center text-2xl font-extrabold text-success">
            +{formatCurrency(driverEarning)}
          </Text>
        </View>

        <Button
          title="Rate Rider ★"
          className="mb-2 w-full"
          onPress={() => navigation.replace('RateRider', { rideId, riderName })}
        />
        <Button
          title="Back to Dashboard"
          variant="outline"
          className="w-full"
          onPress={() => navigation.replace('DriverTabs', { screen: 'Dashboard' })}
        />
      </View>
    </ScreenContainer>
  );
}
