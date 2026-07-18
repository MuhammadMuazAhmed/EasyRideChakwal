import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  type Region,
} from "react-native-maps";

import { CHAKWAL_REGION } from "@/shared/theme";
import type { Coordinates } from "@/shared/types";

interface RideMapProps {
  userLocation?: Coordinates | null;
  pickup?: Coordinates | null;
  destination?: Coordinates | null;
  driverLocation?: Coordinates | null;
  nearbyDrivers?: any[];
  showRoute?: boolean;
  routePolyline?: Coordinates[];
  onPress?: (coordinate: Coordinates) => void;
  className?: string;
  permissionGranted?: boolean;
}

const defaultRegion: Region = {
  latitude: CHAKWAL_REGION.latitude,
  longitude: CHAKWAL_REGION.longitude,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const getMarkerCoordinate = (data: any): { latitude: number; longitude: number } | null => {
  if (!data) return null;
  
  const latVal = data.location?.latitude ?? data.coordinates?.latitude ?? data.latitude;
  const lngVal = data.location?.longitude ?? data.coordinates?.longitude ?? data.longitude;
  
  if (latVal === undefined || latVal === null || lngVal === undefined || lngVal === null) {
    return null;
  }
  
  const latitude = typeof latVal === 'number' ? latVal : parseFloat(latVal);
  const longitude = typeof lngVal === 'number' ? lngVal : parseFloat(lngVal);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }
  
  return { latitude, longitude };
};

export function RideMap({
  userLocation,
  pickup,
  destination,
  driverLocation,
  nearbyDrivers = [],
  showRoute = false,
  routePolyline = [],
  permissionGranted = false,
  onPress,
}: RideMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const pickupCoord = getMarkerCoordinate(pickup);
    const destCoord = getMarkerCoordinate(destination);
    if (pickupCoord && destCoord) {
      mapRef.current?.fitToCoordinates([pickupCoord, destCoord], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } else if (userLocation) {
      mapRef.current?.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [pickup, destination, userLocation]);

  const mapRegion: Region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : defaultRegion;

  const pickupCoord = getMarkerCoordinate(pickup);
  const destinationCoord = getMarkerCoordinate(destination);
  const driverCoord = getMarkerCoordinate(driverLocation);

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={defaultRegion}
        showsUserLocation={permissionGranted}
        showsMyLocationButton={false}
        onPress={(e) =>
          onPress?.({
            latitude: e.nativeEvent.coordinate.latitude,
            longitude: e.nativeEvent.coordinate.longitude,
          })
        }
      >
        {pickupCoord ? (
          <Marker coordinate={pickupCoord} title="Pickup">
            <View className="h-5 w-5 rounded-full border-[3px] border-white bg-accent shadow-md" />
          </Marker>
        ) : null}

        {destinationCoord ? (
          <Marker coordinate={destinationCoord} title="Destination">
            <View className="rounded-lg bg-success px-2 py-1">
              <View className="h-2 w-2 rounded-full bg-white" />
            </View>
          </Marker>
        ) : null}

        {driverCoord ? (
          <Marker
            identifier="driver-marker"
            coordinate={driverCoord}
            title="Driver"
            /**
             * tracksViewChanges={false}: once the custom view is rendered,
             * stop re-measuring it on every React render cycle.  Without this,
             * react-native-maps re-creates the native marker snapshot on each
             * coordinate update, causing a brief flicker/jump.
             */
            tracksViewChanges={false}
            /**
             * flat={true}: keeps the icon flat against the map surface so it
             * doesn't wobble as the map tilts or the coordinate shifts.
             */
            flat={true}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Text className="text-sm">🚗</Text>
            </View>
          </Marker>
        ) : null}

        {nearbyDrivers.map((driver, index) => {
          const coord = getMarkerCoordinate(driver);
          if (!coord) return null;
          return (
            <Marker key={`nearby-${index}`} coordinate={coord}>
              <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
                <View className="h-2 w-2 rounded-full bg-accent" />
              </View>
            </Marker>
          );
        })}

        {showRoute && routePolyline.length > 0 ? (
          <Polyline
            coordinates={routePolyline}
            strokeColor="#F5C400"
            strokeWidth={4}
            lineDashPattern={[6, 4]}
          />
        ) : null}
      </MapView>
    </View>
  );
}

