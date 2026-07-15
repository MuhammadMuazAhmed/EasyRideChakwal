import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '@/shared/components/common/TopBar';
import { RideHistoryCard } from '@/rider/components/ride/RideComponents';
import { LoadingState, EmptyState, ErrorState } from '@/shared/components/common/StateViews';
import { useRideHistory } from '@/shared/hooks/useQueries';
import { useRideStore } from '@/rider/store/rideStore';
import { mockLocations } from '@/shared/constants/mockData';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'MainTabs'>;

export function RideHistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data, isLoading, isError, refetch } = useRideHistory();
  const setPickup = useRideStore((s) => s.setPickup);
  const setDestination = useRideStore((s) => s.setDestination);

  if (isLoading) return <LoadingState message="Loading ride history..." />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const rides = data?.data ?? [];

  return (
    <View className="flex-1 bg-white">
      <TopBar title="My Rides" />
      {rides.length === 0 ? (
        <EmptyState
          icon="🕐"
          title="No rides yet"
          description="Your completed rides will appear here."
          actionLabel="Book a Ride"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        />
      ) : (
        <ScrollView className="flex-1 px-3 pt-3">
          {rides.map((ride) => (
            <RideHistoryCard
              key={ride.id}
              date={ride.date}
              pickup={ride.pickup}
              destination={ride.destination}
              fare={ride.fare}
              driverName={ride.driverName}
              rating={ride.driverRating}
              onPress={() => navigation.navigate('RideDetails', { rideId: ride.id })}
              onRebook={() => {
                setPickup(mockLocations.clockTower);
                setDestination(mockLocations.gctCollege);
                navigation.navigate('VehicleSelection');
              }}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
