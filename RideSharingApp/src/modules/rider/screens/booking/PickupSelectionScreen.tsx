import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton, TopBar } from '@/shared/components/common/TopBar';
import { MapBottomSheet } from '@/shared/components/common/SearchBar';
import { RideMap } from '@/rider/components/map/RideMap';
import { Button } from '@/shared/components/ui/Button';
import { useCurrentLocation } from '@/shared/hooks';
import { useRideStore } from '@/rider/store/rideStore';
import { GoogleMapsService } from '@/api/services/googleMapsService';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'PickupSelection'>;

export function PickupSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { location } = useCurrentLocation();
  const setPickup = useRideStore((s) => s.setPickup);
  const pickup = useRideStore((s) => s.pickup);

  const handleConfirm = () => {
    if (pickup) {
      navigation.navigate('DestinationSelection');
    }
  };

  return (
    <View className="flex-1">
      <TopBar
        title="Set Pickup"
        leftAction={<BackButton onPress={() => navigation.goBack()} />}
      />
      <RideMap
        userLocation={location}
        pickup={pickup?.coordinates ?? location}
        onPress={async (coords) => {
          const address = await GoogleMapsService.fetchAddressFromCoordinates(coords);
          setPickup({
            id: `pinned-${Date.now()}`,
            name: address,
            address: address,
            coordinates: coords,
          });
        }}
      />
      <MapBottomSheet>
        <Text className="mb-2 text-sm font-bold text-text-primary">Confirm Pickup Location</Text>
        <Text className="mb-3 text-xs text-text-secondary">
          {pickup?.name ?? 'Tap on map to set pickup point'}
        </Text>
        <Button title="Confirm Pickup" onPress={handleConfirm} />
      </MapBottomSheet>
    </View>
  );
}
