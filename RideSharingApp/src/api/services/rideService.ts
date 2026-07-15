import { apiClient } from '@/api/axios';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  ApiResponse,
  PaginatedResponse,
  RateRidePayload,
  RequestRidePayload,
  Ride,
  RideHistoryItem,
  Driver,
  PaymentMethod,
  VehicleType,
  Coordinates,
} from '@/shared/types';

const mapDriver = (backendDriver: any, vehicleType: VehicleType): Driver => ({
  id: backendDriver._id ?? backendDriver.id,
  firstName: backendDriver.firstName,
  lastName: backendDriver.lastName,
  phone: backendDriver.phone,
  avatarInitials: backendDriver.avatarInitials ?? `${backendDriver.firstName[0]}${backendDriver.lastName[0] ?? ''}`.toUpperCase(),
  rating: backendDriver.rating ?? 5.0,
  totalTrips: backendDriver.totalTrips ?? 0,
  vehicleType: backendDriver.vehicleType ?? vehicleType,
  vehicleModel: backendDriver.vehicleModel ?? '',
  vehiclePlate: backendDriver.vehiclePlate ?? '',
  coordinates: backendDriver.currentLocation ?? { latitude: 0, longitude: 0 },
});

const mapRide = (ride: any): Ride => ({
  id: ride._id ?? ride.id,
  status: ride.status,
  pickup: {
    id: 'pickup',
    name: ride.pickup.name,
    address: ride.pickup.address,
    coordinates: ride.pickup.coordinates,
  },
  destination: {
    id: 'destination',
    name: ride.destination.name,
    address: ride.destination.address,
    coordinates: ride.destination.coordinates,
  },
  vehicleType: ride.vehicleType,
  driver: ride.driverId && typeof ride.driverId === 'object'
    ? mapDriver(ride.driverId, ride.vehicleType)
    : undefined,
  riderId: ride.riderId && typeof ride.riderId === 'object'
    ? {
        id: ride.riderId._id ?? ride.riderId.id,
        firstName: ride.riderId.firstName,
        lastName: ride.riderId.lastName ?? '',
        phone: ride.riderId.phone,
        email: ride.riderId.email,
        avatarInitials: ride.riderId.avatarInitials ?? `${ride.riderId.firstName[0]}${ride.riderId.lastName?.[0] ?? ''}`.toUpperCase(),
        rating: ride.riderId.rating ?? 5.0,
        totalRides: ride.riderId.totalRides ?? 0,
        referralCode: ride.riderId.referralCode ?? '',
        language: ride.riderId.language ?? 'en',
      }
    : undefined,
  fare: ride.fare ?? 0,
  estimatedFare: ride.estimatedFare ?? 0,
  distance: ride.distance ?? 0,
  duration: ride.duration ?? 0,
  paymentMethod: ride.paymentMethod ?? 'cash',
  createdAt: ride.createdAt,
  completedAt: ride.completedAt,
  rating: ride.riderRating,
  surgeMultiplier: ride.surgeMultiplier ?? 1.0,
});

export interface FareEstimateResult {
  estimates: Record<VehicleType, number>;
  distance: number;
  duration: number;
  surgeMultiplier?: number;
}

function normalizeFareResponse(raw: any): FareEstimateResult {
  const vehicleTypes: VehicleType[] = ['car', 'bike', 'qingqi'];

  if (raw?.totalFare != null && raw?.vehicleType) {
    return {
      estimates: { [raw.vehicleType]: raw.totalFare } as Record<VehicleType, number>,
      distance: raw.distance ?? 0,
      duration: raw.estimatedDuration ?? 0,
      surgeMultiplier: raw.surgeMultiplier,
    };
  }

  const estimates = {} as Record<VehicleType, number>;
  let distance = 0;
  let duration = 0;

  for (const type of vehicleTypes) {
    if (raw?.[type]?.totalFare != null) {
      estimates[type] = raw[type].totalFare;
      distance = raw[type].distance ?? distance;
      duration = raw[type].estimatedDuration ?? duration;
    }
  }

  return {
    estimates,
    distance,
    duration,
    surgeMultiplier: raw?.surgeMultiplier,
  };
}

const mapRideToHistoryItem = (ride: any): RideHistoryItem => {
  const driverName = ride.driverId
    ? `${ride.driverId.firstName} ${ride.driverId.lastName}`
    : 'No Driver';
  const driverRating = ride.driverId?.rating ?? 5.0;

  return {
    id: ride._id ?? ride.id,
    date: new Date(ride.createdAt).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    pickup: ride.pickup.name,
    destination: ride.destination.name,
    fare: ride.fare ?? ride.estimatedFare ?? 0,
    driverName,
    driverRating,
    status: ride.status === 'completed' ? 'completed' : 'cancelled',
    vehicleType: ride.vehicleType,
  };
};

export const RideService = {
  async getFareEstimate(pickup: Coordinates, destination: Coordinates): Promise<FareEstimateResult> {
    const { data } = await apiClient.post<ApiResponse<any>>('/fare', {
      pickup,
      destination,
    });
    return normalizeFareResponse(data.data);
  },

  async requestRide(payload: RequestRidePayload): Promise<Ride> {
    const { data } = await apiClient.post<ApiResponse<any>>('/rides', {
      pickup: {
        name: payload.pickup.name,
        address: payload.pickup.address,
        coordinates: payload.pickup.coordinates,
      },
      destination: {
        name: payload.destination.name,
        address: payload.destination.address,
        coordinates: payload.destination.coordinates,
      },
      vehicleType: payload.vehicleType,
      paymentMethod: payload.paymentMethod,
    });
    return await this.getRideDetails(data.data.rideId);
  },

  async getCurrentRide(): Promise<Ride | null> {
    const { data } = await apiClient.get<ApiResponse<{ rides: any[] }>>('/rides', {
      params: { limit: 5 },
    });
    const rides = data.data.rides ?? [];
    const activeRide = rides.find((r: any) =>
      ['searching', 'driver_assigned', 'driver_en_route', 'driver_arrived', 'in_progress'].includes(r.status)
    );
    return activeRide ? mapRide(activeRide) : null;
  },

  async cancelRide(rideId: string, reason: string): Promise<void> {
    await apiClient.post(`/rides/${rideId}/cancel`, { reason });
  },

  async getRideHistory(page = 1, limit = 20): Promise<PaginatedResponse<RideHistoryItem>> {
    const { data } = await apiClient.get<ApiResponse<{ rides: any[]; total: number; page: number; limit: number }>>('/rides', {
      params: { page, limit },
    });
    const rides = data.data.rides ?? [];
    return {
      data: rides.map(mapRideToHistoryItem),
      total: data.data.total ?? rides.length,
      page: data.data.page ?? page,
      limit: data.data.limit ?? limit,
    };
  },

  async getRideDetails(rideId: string): Promise<Ride> {
    const { data } = await apiClient.get<ApiResponse<any>>(`/rides/${rideId}`);
    return mapRide(data.data);
  },

  async rateRide(payload: RateRidePayload): Promise<void> {
    await apiClient.post(`/rides/${payload.rideId}/rate`, {
      rating: payload.rating,
      comment: payload.comment,
    });
  },

  async getChatMessages(rideId: string): Promise<any[]> {
    const { data } = await apiClient.get<ApiResponse<{ messages: any[] }>>(`/rides/${rideId}/chat`);
    return data.data.messages ?? [];
  },

  async sendChatMessage(rideId: string, text: string): Promise<void> {
    await apiClient.post(`/rides/${rideId}/chat`, { text });
  },

  async triggerSOS(rideId: string, latitude: number, longitude: number): Promise<void> {
    await apiClient.post(`/rides/${rideId}/sos`, { latitude, longitude });
  },

  async resolveSOS(rideId: string): Promise<void> {
    await apiClient.delete(`/rides/${rideId}/sos`);
  },
};
