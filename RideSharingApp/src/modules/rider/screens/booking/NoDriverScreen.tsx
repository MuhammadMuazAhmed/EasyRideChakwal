import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '@/shared/components/common/TopBar';
import { MapBottomSheet } from '@/shared/components/common/SearchBar';
import { RideMap } from '@/rider/components/map/RideMap';
import { Button } from '@/shared/components/ui/Button';
import { useRideStore } from '@/rider/store/rideStore';
import type { RiderStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'NoDriver'>;

export function NoDriverScreen() {
  const navigation = useNavigation<NavigationProp>();
  const pickup = useRideStore((s) => s.pickup);
  const setSelectedVehicle = useRideStore((s) => s.setSelectedVehicle);

  const handleRetry = () => {
    navigation.replace('DriverSearching');
  };

  return (
    <View className="flex-1">
      <TopBar showLogo title="Driver Dhoond Rahe Hain..." />
      <RideMap pickup={pickup?.coordinates} />
      <View className="absolute left-2 right-2 top-14">
        <View className="rounded-lg bg-[rgba(0,0,0,0.8)] p-2.5">
          <Text className="text-center text-xs font-bold text-white">
            Aapke area mein koi driver nahi
          </Text>
          <Text className="mt-0.5 text-center text-[10px] text-[#AAAAAA]">
            {pickup?.name ?? 'Your area'} · 60s dhoond liya
          </Text>
        </View>
      </View>
      <MapBottomSheet>
        <Text className="mb-2.5 text-sm font-bold text-text-primary">Kya Karein?</Text>
        <Button title="🔄 Dobara Try Karein" onPress={handleRetry} className="mb-2" />
        <Button
          title="🏍️ Bike Try Karein (Faster)"
          variant="outline"
          className="mb-2"
          onPress={() => {
            setSelectedVehicle('bike');
            handleRetry();
          }}
        />
        <Button
          title="🔔 Driver Available hone par Notify Karein"
          variant="outline"
          className="border-green-200 bg-green-50"
          textClassName="text-success"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        />
      </MapBottomSheet>
    </View>
  );
}
