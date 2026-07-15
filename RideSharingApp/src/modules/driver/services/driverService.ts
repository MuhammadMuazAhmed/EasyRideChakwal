import { apiClient } from '@/api/axios';
import { useAuthStore } from '@/store/authStore';
import { decodeJwt } from '@/shared/utils';
import type { ApiResponse, Coordinates, VehicleType } from '@/shared/types';

const PLATFORM_COMMISSION = 0.15;

export interface DriverTripHistoryItem {
  id: string;
  pickup: string;
  destination: string;
  fare: number;
  driverEarning: number;
  date: string;
  time: string;
  vehicleType: VehicleType;
  paymentMethod: string;
}

function mapDriverTrip(ride: any): DriverTripHistoryItem {
  const fare = ride.fare ?? ride.estimatedFare ?? 0;
  const createdAt = new Date(ride.createdAt);

  return {
    id: ride._id ?? ride.id,
    pickup: ride.pickup.name,
    destination: ride.destination.name,
    fare,
    driverEarning: Math.round(fare * (1 - PLATFORM_COMMISSION)),
    date: createdAt.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: createdAt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
    vehicleType: ride.vehicleType,
    paymentMethod: ride.paymentMethod ?? 'cash',
  };
}

function getDriverId(): string {
  const driverId = useAuthStore.getState().driverId;
  if (!driverId) {
    throw new Error('Driver ID not available. Please complete registration.');
  }
  return driverId;
}

export const DriverService = {
  async getProfile(): Promise<any> {
    const driverId = getDriverId();
    const { data } = await apiClient.get<ApiResponse<any>>(`/drivers/${driverId}`);
    return data.data;
  },

  async updateProfile(payload: any): Promise<any> {
    const driverId = getDriverId();
    const { data } = await apiClient.patch<ApiResponse<any>>(`/drivers/${driverId}`, payload);
    return data.data;
  },

  async register(payload: any): Promise<any> {
    const { data } = await apiClient.post<ApiResponse<any>>('/drivers', payload);
    return data.data;
  },

  async updateStatus(isOnline: boolean, location?: Coordinates): Promise<any> {
    const driverId = getDriverId();
    const { data } = await apiClient.post<ApiResponse<any>>(`/drivers/${driverId}/status`, {
      isOnline,
      latitude: location?.latitude,
      longitude: location?.longitude,
    });
    return data.data;
  },

  async updateLocation(location: Coordinates): Promise<any> {
    const driverId = getDriverId();
    const { data } = await apiClient.post<ApiResponse<any>>(`/drivers/${driverId}/location`, {
      latitude: location.latitude,
      longitude: location.longitude,
    });
    return data.data;
  },

  async getIncomingRequests(): Promise<any[]> {
    getDriverId();
    const { data } = await apiClient.get<ApiResponse<any[]>>('/rides/incoming');
    return data.data ?? [];
  },

  async acceptRide(rideId: string): Promise<any> {
    getDriverId();
    const { data } = await apiClient.post<ApiResponse<any>>(`/rides/${rideId}/accept`);
    return data.data;
  },

  async startRide(rideId: string): Promise<any> {
    getDriverId();
    const { data } = await apiClient.post<ApiResponse<any>>(`/rides/${rideId}/start`);
    return data.data;
  },

  async completeRide(rideId: string, actualFare?: number): Promise<any> {
    getDriverId();
    const { data } = await apiClient.post<ApiResponse<any>>(`/rides/${rideId}/complete`, {
      ...(actualFare != null ? { actualFare } : {}),
    });
    return data.data;
  },

  async getCompletedRides(page = 1, limit = 20): Promise<{ rides: DriverTripHistoryItem[]; total: number }> {
    getDriverId();
    const { data } = await apiClient.get<
      ApiResponse<{ rides: any[]; total: number; page: number; limit: number }>
    >('/rides', {
      params: { page, limit, status: 'completed' },
    });
    const rides = data.data.rides ?? [];
    return {
      rides: rides.map(mapDriverTrip),
      total: data.data.total ?? rides.length,
    };
  },

  async rateRider(rideId: string, rating: number, comment?: string): Promise<void> {
    getDriverId();
    await apiClient.post(`/rides/${rideId}/rate`, { rating, comment });
  },
};
