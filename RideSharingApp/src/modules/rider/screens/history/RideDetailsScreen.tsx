import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { BackButton, TopBar, ScreenContainer } from '@/shared/components/common/TopBar';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { RideService } from '@/api/services/rideService';
import { formatCurrency } from '@/shared/utils';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'RideDetails'>;
type RouteProps = RouteProp<RiderStackParamList, 'RideDetails'>;

export function RideDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { rideId } = route.params;

  const { data: ride, isLoading, isError } = useQuery({
    queryKey: ['rideDetails', rideId],
    queryFn: () => RideService.getRideDetails(rideId),
  });

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center bg-surface-background">
        <ActivityIndicator size="large" color="#F5C400" />
      </ScreenContainer>
    );
  }

  if (isError || !ride) {
    return (
      <ScreenContainer className="bg-surface-background">
        <TopBar
          title="Ride Details"
          leftAction={<BackButton onPress={() => navigation.goBack()} />}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-text-secondary">Ride details load nahi ho saki.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const driverName = ride.driver
    ? `${ride.driver.firstName} ${ride.driver.lastName}`
    : 'No Driver';
  const driverRating = ride.driver?.rating ?? 5.0;
  const fare = ride.fare > 0 ? ride.fare : ride.estimatedFare;
  const dateLabel = ride.completedAt
    ? new Date(ride.completedAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date(ride.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  return (
    <ScreenContainer className="bg-surface-background">
      <TopBar
        title="Ride Details"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <ScrollView className="flex-1 p-3">
        <Card className="mb-3">
          <Text className="mb-2 text-[11px] text-text-tertiary">{dateLabel}</Text>
          <View className="mb-1 flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-accent" />
            <Text className="text-sm font-semibold text-text-primary">{ride.pickup.name}</Text>
          </View>
          <View className="ml-[3px] h-3 border-l-2 border-dashed border-border" />
          <View className="mb-3 flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-success" />
            <Text className="text-sm font-semibold text-text-primary">{ride.destination.name}</Text>
          </View>
          <View className="flex-row items-center justify-between border-t border-border pt-3">
            <View className="flex-row items-center gap-2">
              <Avatar initials={driverName.slice(0, 2).toUpperCase()} size="sm" />
              <View>
                <Text className="text-xs font-bold text-text-primary">{driverName}</Text>
                <Text className="text-[10px] text-accent">★ {driverRating.toFixed(1)}</Text>
              </View>
            </View>
            <Text className="text-lg font-extrabold text-text-primary">{formatCurrency(fare)}</Text>
          </View>
        </Card>
        <Button title="Re-book This Ride" onPress={() => navigation.navigate('VehicleSelection')} />
        <Button
          title="View Receipt"
          variant="outline"
          className="mt-2"
          onPress={() => navigation.navigate('TripReceipt', { rideId: ride.id })}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
