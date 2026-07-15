import { create } from 'zustand';

interface DriverStore {
  isOnline: boolean;
  driverProfile: any | null;
  activeRide: any | null;
  incomingRequests: any[];
  setOnline: (online: boolean) => void;
  setDriverProfile: (profile: any | null) => void;
  setActiveRide: (ride: any | null) => void;
  setIncomingRequests: (requests: any[]) => void;
  clearStore: () => void;
}

export const useDriverStore = create<DriverStore>((set) => ({
  isOnline: false,
  driverProfile: null,
  activeRide: null,
  incomingRequests: [],
  setOnline: (isOnline) => set({ isOnline }),
  setDriverProfile: (driverProfile) => set({ driverProfile }),
  setActiveRide: (activeRide) => set({ activeRide }),
  setIncomingRequests: (incomingRequests) => set({ incomingRequests }),
  clearStore: () =>
    set({
      isOnline: false,
      driverProfile: null,
      activeRide: null,
      incomingRequests: [],
    }),
}));
