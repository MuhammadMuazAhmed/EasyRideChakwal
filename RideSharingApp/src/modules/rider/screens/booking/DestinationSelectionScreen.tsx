import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar } from '@/shared/components/common/TopBar';
import { MapBottomSheet } from '@/shared/components/common/SearchBar';
import { RideMap } from '@/rider/components/map/RideMap';
import { Button } from '@/shared/components/ui/Button';
import { useRideStore } from '@/rider/store/rideStore';
import { GoogleMapsService } from '@/api/services/googleMapsService';
import { useRoutePolyline } from '@/rider/hooks/useRoutePolyline';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'DestinationSelection'>;

export function DestinationSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const pickup = useRideStore((s) => s.pickup);
  const destination = useRideStore((s) => s.destination);
  const setDestination = useRideStore((s) => s.setDestination);

  const { data: routeData } = useRoutePolyline(pickup?.coordinates, destination?.coordinates);

  const handleConfirm = () => {
    if (destination) {
      navigation.navigate('VehicleSelection');
    }
  };

  return (
    <View className="flex-1">
      <TopBar
        title="Set Destination"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <RideMap
        pickup={pickup?.coordinates}
        destination={destination?.coordinates}
        routePolyline={routeData?.polyline}
        showRoute={!!destination}
        onPress={async (coords) => {
          const { name, address } = await GoogleMapsService.fetchAddressFromCoordinates(coords);
          setDestination({
            id: `pinned-${Date.now()}`,
            name,
            address,
            coordinates: coords,
          });
        }}
      />
      <MapBottomSheet>
        <Text className="mb-2 text-sm font-bold text-text-primary">Confirm Destination</Text>
        <Text className="mb-3 text-xs text-text-secondary">
          {destination?.name ?? 'Tap on map to set destination'}
        </Text>
        <Button title="Confirm Destination" onPress={handleConfirm} />
      </MapBottomSheet>
    </View>
  );
}
