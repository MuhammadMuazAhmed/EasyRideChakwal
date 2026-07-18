import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, View } from "react-native";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";

import { MapBottomSheet, SearchBar } from "@/shared/components/common/SearchBar";
import { TopBar } from "@/shared/components/common/TopBar";
import { RideMap } from "@/rider/components/map/RideMap";
import { VehicleTypeSelector } from "@/rider/components/ride/RideComponents";
import { Button } from "@/shared/components/ui/Button";
import { useCurrentLocation } from "@/shared/hooks";
import type { RiderStackParamList } from "@/navigation/types";
import { useRideStore } from "@/rider/store/rideStore";
import { brand } from "@/shared/theme";
type NavigationProp = NativeStackNavigationProp<
  RiderStackParamList,
  "MainTabs"
>;

export function HomeMapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { location, hasPermission } = useCurrentLocation();
  const pickup = useRideStore((s) => s.pickup);
  const selectedVehicle = useRideStore((s) => s.selectedVehicle);
  const setSelectedVehicle = useRideStore((s) => s.setSelectedVehicle);
  const currentRide = useRideStore((s) => s.currentRide);

  const { data: nearbyDriversData } = useQuery({
    queryKey: ["nearbyDrivers", location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) return [];
      const { data } = await apiClient.get("/drivers/nearby", {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm: 10,
        },
      });
      return data.data.drivers ?? [];
    },
    enabled: !!location,
    refetchInterval: 15000, // Poll every 15s
  });

  const nearbyDrivers = nearbyDriversData ?? [];

  const handleRequestRide = () => {
    navigation.navigate("LocationSearch");
  };

  return (
    <View className="flex-1">
      <TopBar
        showLogo
        title={brand.name}
        rightAction={
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-success" />
            <Text className="text-[11px] text-[#AAAAAA]">{brand.city}</Text>
          </View>
        }
      />

      <View className="relative flex-1">
        <RideMap
          userLocation={location}
          pickup={pickup?.coordinates ?? null}
          nearbyDrivers={nearbyDrivers}
          permissionGranted={hasPermission}
        />

        <View className="absolute left-0 right-0 top-4 items-center">
          <View className="rounded-full bg-black/75 px-3 py-1">
            <Text className="text-[11px] font-bold text-accent">
              📍 Tap map to set pickup
            </Text>
          </View>
        </View>

        {currentRide && ['searching', 'driver_assigned', 'driver_en_route', 'driver_arrived', 'in_progress'].includes(currentRide.status) ? (
          <MapBottomSheet>
            <View className="items-center py-4 px-2">
              <View className="h-1 w-12 rounded-full bg-neutral-200 mb-4" />
              <Text className="text-sm font-bold text-text-primary mb-1">
                Active Ride in Progress
              </Text>
              <Text className="text-xs text-text-secondary text-center mb-4">
                {currentRide.status === 'searching' 
                  ? 'Searching for nearby drivers...' 
                  : currentRide.status === 'driver_arrived'
                  ? 'Driver has arrived at your location!'
                  : currentRide.status === 'in_progress'
                  ? 'Trip in progress to destination.'
                  : 'Driver is en-route to your pickup location.'}
              </Text>
              <Button 
                title="View Active Ride" 
                onPress={() => {
                  if (currentRide.status === 'searching') {
                    navigation.navigate("DriverSearching");
                  } else if (['driver_assigned', 'driver_en_route', 'driver_arrived'].includes(currentRide.status)) {
                    navigation.navigate("DriverTracking");
                  } else if (currentRide.status === 'in_progress') {
                    navigation.navigate("ActiveTrip");
                  }
                }} 
              />
            </View>
          </MapBottomSheet>
        ) : (
          <MapBottomSheet>
            <SearchBar onPress={() => navigation.navigate("LocationSearch")} />
            <VehicleTypeSelector
              selected={selectedVehicle}
              onSelect={setSelectedVehicle}
            />
            <Button title="Request Ride" onPress={handleRequestRide} />
          </MapBottomSheet>
        )}
      </View>
    </View>
  );
}
