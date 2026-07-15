import { useQuery } from '@tanstack/react-query';
import { GoogleMapsService } from '@/api/services/googleMapsService';
import type { Coordinates } from '@/shared/types';

export function useRoutePolyline(pickup?: Coordinates | null, destination?: Coordinates | null) {
  return useQuery({
    queryKey: ['routePolyline', pickup, destination],
    queryFn: async () => {
      if (!pickup || !destination) return null;
      return await GoogleMapsService.fetchDirections(pickup, destination);
    },
    enabled: !!(pickup && destination),
    staleTime: 5 * 60 * 1000, // 5 minutes caching
  });
}
