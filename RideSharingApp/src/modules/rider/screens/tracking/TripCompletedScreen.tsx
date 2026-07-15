import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';

import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { ScreenContainer, TopBar } from '@/shared/components/common/TopBar';
import { useRideStore } from '@/rider/store/rideStore';
import { formatCurrency } from '@/shared/utils';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'TripCompleted'>;

export function TripCompletedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentRide = useRideStore((s) => s.currentRide);
  const completeRide = useRideStore((s) => s.completeRide);
  const driver = currentRide?.driver;

  useEffect(() => {
    completeRide();
  }, [completeRide]);

  return (
    <ScreenContainer className="bg-white">
      <TopBar title="Trip Complete!" />
      <View className="flex-1 items-center justify-center px-6">
        <Badge label="Trip Complete!" variant="green" className="mb-4 px-3 py-1" />
        <Avatar initials={driver?.avatarInitials ?? 'AR'} size="xl" className="mb-2" />
        <Text className="text-[15px] font-bold text-text-primary">
          {driver ? `${driver.firstName} ${driver.lastName}` : 'Abdul Rehman'}
        </Text>
        <Text className="mb-6 text-[11px] text-text-tertiary">
          {currentRide?.pickup.name} → {currentRide?.destination.name}
        </Text>

        <View className="mb-6 w-full rounded-xl bg-surface-muted p-4">
          <Text className="text-center text-[10px] font-bold uppercase text-text-tertiary">
            Total Fare
          </Text>
          <Text className="text-center text-3xl font-extrabold text-text-primary">
            {formatCurrency(currentRide?.fare ?? 185)}
          </Text>
          <Text className="mt-1 text-center text-xs text-text-secondary">Paid via Cash</Text>
        </View>

        <Button
          title="Rate Your Driver ★"
          className="mb-2 w-full"
          onPress={() => navigation.navigate('Rating', { rideId: currentRide?.id })}
        />
        <Button
          title="View Receipt"
          variant="outline"
          className="mb-2 w-full"
          onPress={() => navigation.navigate('TripReceipt', { rideId: currentRide?.id })}
        />
        <Button
          title="Back to Home"
          variant="ghost"
          onPress={() => {
            useRideStore.getState().resetBooking();
            navigation.navigate('MainTabs', { screen: 'Home' });
          }}
        />
      </View>
    </ScreenContainer>
  );
}
