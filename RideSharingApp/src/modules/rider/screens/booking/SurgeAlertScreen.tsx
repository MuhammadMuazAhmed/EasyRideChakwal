import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '@/shared/components/common/TopBar';
import { MapBottomSheet } from '@/shared/components/common/SearchBar';
import { RideMap } from '@/rider/components/map/RideMap';
import { Button } from '@/shared/components/ui/Button';
import { useRideStore } from '@/rider/store/rideStore';
import { formatCurrency } from '@/shared/utils';
import { useRoutePolyline } from '@/rider/hooks/useRoutePolyline';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'SurgeAlert'>;

export function SurgeAlertScreen() {
  const navigation = useNavigation<NavigationProp>();
  const pickup = useRideStore((s) => s.pickup);
  const destination = useRideStore((s) => s.destination);
  
  const { data: routeData } = useRoutePolyline(pickup?.coordinates, destination?.coordinates);

  const handleAccept = () => {
    navigation.navigate('DriverSearching');
  };

  return (
    <View className="flex-1">
      <TopBar showLogo title="Ride Mahenga Hai Abhi" />
      <RideMap 
        pickup={pickup?.coordinates} 
        destination={destination?.coordinates} 
        routePolyline={routeData?.polyline}
        showRoute 
      />
      <View className="absolute left-0 right-0 top-1/3 items-center">
        <View className="items-center rounded-xl bg-accent/95 px-3.5 py-2">
          <Text className="text-lg font-black text-[#7A5800]">⚡ 1.4x</Text>
        </View>
        <View className="mt-1 rounded-lg bg-black/70 px-2 py-1">
          <Text className="text-[10px] text-white">Surge Active Zone</Text>
        </View>
      </View>
      <MapBottomSheet>
        <View className="mb-2.5 rounded-xl border-2 border-accent bg-accent-light p-3">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-text-primary">Surge Pricing Active ⚡</Text>
            <View className="rounded-lg bg-accent px-2 py-0.5">
              <Text className="text-xs font-extrabold text-[#7A5800]">1.4x</Text>
            </View>
          </View>
          <Text className="mb-1.5 text-[11px] text-text-secondary">
            Jumma ki namaz ke baad demand zyada hai — fare thoda zyada hoga
          </Text>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] text-text-tertiary">Normal fare</Text>
              <Text className="text-sm font-bold text-text-secondary line-through">
                {formatCurrency(180)}
              </Text>
            </View>
            <Text className="text-[8px] text-text-tertiary">×1.4</Text>
            <View>
              <Text className="text-[10px] text-text-tertiary">Surge fare</Text>
              <Text className="text-base font-extrabold text-text-primary">
                {formatCurrency(252)}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Button
            title="⏳ Wait for Normal"
            variant="outline"
            className="flex-1"
            onPress={() => navigation.goBack()}
          />
          <Button title="Accept Surge Fare" className="flex-1" onPress={handleAccept} />
        </View>
      </MapBottomSheet>
    </View>
  );
}
