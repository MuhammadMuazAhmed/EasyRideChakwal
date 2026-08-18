import { create } from 'zustand';

import type {
  Driver,
  Location,
  PaymentMethod,
  Ride,
  RideStatus,
  VehicleType,
} from '@/shared/types';

interface RideStore {
  currentRide: Ride | null;
  selectedVehicle: VehicleType;
  pickup: Location | null;
  destination: Location | null;
  paymentMethod: PaymentMethod;
  isSearching: boolean;
  estimatedFare: number;
  estimatedDistance: number;
  setPickup: (location: Location | null) => void;
  setDestination: (location: Location | null) => void;
  setSelectedVehicle: (vehicle: VehicleType) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setFareEstimate: (fare: number, distance: number) => void;
  setCurrentRide: (ride: Ride | null) => void;
  setRideStatus: (status: RideStatus) => void;
  assignDriver: (driver: Driver) => void;
  updateDriverCoordinates: (coords: { latitude: number; longitude: number }) => void;
  updateCurrentFare: (fare: number) => void;
  completeRide: () => void;
  cancelRide: () => void;
  /** Clears only the active ride and searching flag.
   *  Intentionally preserves pickup/destination/vehicle/payment
   *  so the retry-after-no-driver flow can reuse the original request data. */
  resetRideOnly: () => void;
  resetBooking: () => void;
}

export const useRideStore = create<RideStore>((set) => ({
  currentRide: null,
  selectedVehicle: 'car',
  pickup: null,
  destination: null,
  paymentMethod: 'cash',
  isSearching: false,
  estimatedFare: 0,
  estimatedDistance: 0,

  setPickup: (location) => set({ pickup: location }),
  setDestination: (location) => set({ destination: location }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setFareEstimate: (fare, distance) => set({ estimatedFare: fare, estimatedDistance: distance }),

  setCurrentRide: (ride) =>
    set({
      currentRide: ride,
      isSearching: ride?.status === 'searching',
    }),

  setRideStatus: (status) =>
    set((state) => ({
      currentRide: state.currentRide ? { ...state.currentRide, status } : null,
      isSearching: status === 'searching',
    })),

  assignDriver: (driver) =>
    set((state) => ({
      isSearching: false,
      currentRide: state.currentRide
        ? {
            ...state.currentRide,
            status:
              state.currentRide.status === 'searching'
                ? 'driver_en_route'
                : state.currentRide.status,
            driver,
          }
        : null,
    })),

  updateDriverCoordinates: (coords) =>
    set((state) => ({
      currentRide:
        state.currentRide?.driver
          ? {
              ...state.currentRide,
              driver: { ...state.currentRide.driver, coordinates: coords },
            }
          : state.currentRide,
    })),

  updateCurrentFare: (fare) =>
    set((state) => ({
      currentRide: state.currentRide ? { ...state.currentRide, fare } : null,
    })),

  completeRide: () =>
    set((state) => ({
      isSearching: false,
      currentRide: state.currentRide
        ? {
            ...state.currentRide,
            status: 'completed',
            completedAt: new Date().toISOString(),
          }
        : null,
    })),

  cancelRide: () =>
    set((state) => ({
      isSearching: false,
      currentRide: state.currentRide
        ? { ...state.currentRide, status: 'cancelled' }
        : null,
    })),

  // Clears only the active ride — pickup/destination/vehicle/payment are preserved
  // so the no-driver retry flow can re-request without losing location data.
  resetRideOnly: () =>
    set({
      currentRide: null,
      isSearching: false,
    }),

  resetBooking: () =>
    set({
      currentRide: null,
      destination: null,
      isSearching: false,
      selectedVehicle: 'car',
      paymentMethod: 'cash',
      estimatedFare: 0,
      estimatedDistance: 0,
    }),
}));
