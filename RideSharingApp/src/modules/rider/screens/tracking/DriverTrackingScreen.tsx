import { useCallback } from 'react';
import { View, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar, BackButton } from '@/shared/components/common/TopBar';
import { MapBottomSheet } from '@/shared/components/common/SearchBar';
import { RideMap } from '@/rider/components/map/RideMap';
import { DriverInfoCard } from '@/rider/components/ride/RideComponents';
import { Badge } from '@/shared/components/ui/Badge';
import { useRideStore } from '@/rider/store/rideStore';
import { useRoutePolyline } from '@/rider/hooks/useRoutePolyline';
import { useDriverLocationListener } from '@/rider/hooks/useDriverLocationListener';
import { calculateDistance } from '@/shared/utils';
import type { RiderStackParamList } from '@/navigation/types';
import type { Coordinates } from '@/shared/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'DriverTracking'>;

/** Returns true only when coords are a real GPS fix (not the null-island fallback). */
function isMeaningfulCoord(c: Coordinates | null | undefined): c is Coordinates {
  return !!c && (c.latitude !== 0 || c.longitude !== 0);
}

export function DriverTrackingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentRide = useRideStore((s) => s.currentRide);
  const updateDriverCoordinates = useRideStore((s) => s.updateDriverCoordinates);
  const driver = currentRide?.driver;

  // Only block back when this screen is focused — so CancelRideScreen
  // (pushed on top) can use the hardware back button normally.
  useFocusEffect(
    useCallback(() => {
      const backAction = () => true;
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [])
  );

  // Subscribe to Firebase RTDB and stream live driver coordinates into the store.
  const handleLiveLocation = useCallback(
    (coords: Coordinates) => {
      updateDriverCoordinates(coords);
    },
    [updateDriverCoordinates]
  );

  // Extract the driver's MongoDB _id from the ride. The backend populate puts the
  // driver doc under `driverId` on the raw ride; after mapping it becomes `driver`.
  // The Firebase path is keyed by that same _id.
  const firebaseDriverId = driver?.id ?? null;
  useDriverLocationListener(firebaseDriverId, handleLiveLocation);

  const { data: routeData } = useRoutePolyline(
    currentRide?.pickup?.coordinates,
    currentRide?.destination?.coordinates
  );

  if (!driver || !currentRide) return null;

  const driverCoord = driver.coordinates;
  const pickupCoord = currentRide.pickup.coordinates;

  // Only compute ETA / distance when we have a real live fix.
  // Without this guard, a { lat:0, lng:0 } fallback produces ~8400 km.
  const hasLiveFix = isMeaningfulCoord(driverCoord) && isMeaningfulCoord(pickupCoord);

  let distanceKm = 0;
  let etaMinutes = 0;

  if (hasLiveFix) {
    distanceKm = calculateDistance(
      driverCoord.latitude,
      driverCoord.longitude,
      pickupCoord.latitude,
      pickupCoord.longitude
    );
    // Assume average urban speed of 25 km/h → minutes = (km / 25) * 60
    etaMinutes = Math.max(1, Math.ceil((distanceKm / 25) * 60));
  }

  const isArrived = currentRide.status === 'driver_arrived';

  const etaBadgeLabel = isArrived
    ? 'Arrived'
    : hasLiveFix
    ? `ETA ${etaMinutes} min`
    : 'Locating…';

  const etaInfoText = isArrived
    ? 'Driver is here!'
    : hasLiveFix
    ? `${etaMinutes} min · ${distanceKm.toFixed(2)} km away`
    : 'Locating driver…';

  const handleCancel = () => {
    navigation.navigate('CancelRide');
  };

  return (
    <View className="flex-1">
      <TopBar
        showLogo
        title={isArrived ? 'Driver Arrived!' : 'Driver Coming…'}
        leftAction={<BackButton onPress={handleCancel} />}
        rightAction={<Badge label={etaBadgeLabel} variant="green" />}
      />
      <RideMap
        pickup={currentRide.pickup.coordinates}
        destination={currentRide.destination.coordinates}
        driverLocation={isMeaningfulCoord(driverCoord) ? driverCoord : null}
        routePolyline={routeData?.polyline}
        showRoute
      />
      <MapBottomSheet>
        <DriverInfoCard
          name={`${driver.firstName} ${driver.lastName}`}
          initials={driver.avatarInitials}
          rating={driver.rating}
          totalTrips={driver.totalTrips}
          vehicleModel={driver.vehicleModel}
          vehiclePlate={driver.vehiclePlate}
          pickup={currentRide.pickup.name}
          destination={currentRide.destination.name}
          eta={etaInfoText}
          progress={30}
          showActions
          onCall={() => {}}
          onChat={() => navigation.navigate('Chat')}
          onSOS={() => navigation.navigate('SOS')}
        />
      </MapBottomSheet>
    </View>
  );
}
