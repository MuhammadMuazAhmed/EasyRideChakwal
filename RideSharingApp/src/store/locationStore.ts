import { create } from 'zustand';

import type { Coordinates } from '@/shared/types';
import { CHAKWAL_REGION } from '@/shared/theme';

interface LocationStore {
  currentLocation: Coordinates | null;
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  setCurrentLocation: (location: Coordinates) => void;
  setPermission: (granted: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  currentLocation: {
    latitude: CHAKWAL_REGION.latitude,
    longitude: CHAKWAL_REGION.longitude,
  },
  hasPermission: false,
  isLoading: false,
  error: null,
  setCurrentLocation: (location) => set({ currentLocation: location, error: null }),
  setPermission: (granted) => set({ hasPermission: granted }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      currentLocation: {
        latitude: CHAKWAL_REGION.latitude,
        longitude: CHAKWAL_REGION.longitude,
      },
      hasPermission: false,
      isLoading: false,
      error: null,
    }),
}));
