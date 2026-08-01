import { useQuery } from '@tanstack/react-query';
import { GoogleMapsService } from '@/api/services/googleMapsService';
import type { Coordinates } from '@/shared/types';

export function useRoutePolyline(pickup?: Coordinates | null, destination?: Coordinates | null) {
  const pickupLat = pickup?.latitude;
  const pickupLng = pickup?.longitude;
  const destLat = destination?.latitude;
  const destLng = destination?.longitude;

  const isValid =
    typeof pickupLat === 'number' &&
    typeof pickupLng === 'number' &&
    typeof destLat === 'number' &&
    typeof destLng === 'number' &&
    (pickupLat !== 0 || pickupLng !== 0) &&
    (destLat !== 0 || destLng !== 0);

  return useQuery({
    queryKey: ['routePolyline', pickupLat, pickupLng, destLat, destLng],
    queryFn: async () => {
      if (!isValid || !pickup || !destination) return null;
      return await GoogleMapsService.fetchDirections(pickup, destination);
    },
    enabled: isValid,
    staleTime: 10 * 60 * 1000, // 10 minutes caching
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}
