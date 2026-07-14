// ============================================================
// EASY RIDE CHAKWAL — SHARED TYPES
// Keep in sync with RideSharingApp/src/types/index.ts
// ============================================================

export type VehicleType = 'car' | 'bike' | 'qingqi';

export type RideStatus =
  | 'idle'
  | 'searching'
  | 'driver_assigned'
  | 'driver_en_route'
  | 'driver_arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_driver';

export type PaymentMethod = 'cash' | 'jazzcash' | 'easypaisa' | 'card';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  avatarInitials: string;
  rating: number;
  totalRides: number;
  badge?: string;
  referralCode: string;
  language: 'en' | 'ur';
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarInitials: string;
  rating: number;
  totalTrips: number;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehiclePlate: string;
  coordinates: Coordinates;
}

export interface VehicleOption {
  type: VehicleType;
  label: string;
  icon: string;
  baseFare: number;
  perKmRate: number;
  eta: number;
  capacity: number;
}

export interface Ride {
  id: string;
  status: RideStatus;
  pickup: Location;
  destination: Location;
  vehicleType: VehicleType;
  driver?: Driver;
  fare: number;
  estimatedFare: number;
  distance: number;
  duration: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  completedAt?: string;
  rating?: number;
  surgeMultiplier?: number;
}

export interface RideHistoryItem {
  id: string;
  date: string;
  pickup: string;
  destination: string;
  fare: number;
  driverName: string;
  driverRating: number;
  status: 'completed' | 'cancelled';
  vehicleType: VehicleType;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ride' | 'promo' | 'system' | 'safety';
  read: boolean;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface SavedPlace {
  id: string;
  label: string;
  icon: string;
  address: string;
  coordinates: Coordinates;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  phone: string | null;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface LoginRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface RequestRidePayload {
  pickup: Location;
  destination: Location;
  vehicleType: VehicleType;
  paymentMethod: PaymentMethod;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  language?: 'en' | 'ur';
}

export interface RateRidePayload {
  rideId: string;
  rating: number;
  tags?: string[];
  comment?: string;
}

// ── Backend-only types (not in frontend) ──────────────────────

export interface FareCalculation {
  distance: number;
  estimatedDuration: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  totalFare: number;
  surgeMultiplier: number;
  vehicleType: VehicleType;
}

export interface NearbyDriver {
  id: string;
  firstName: string;
  lastName: string;
  avatarInitials: string;
  rating: number;
  totalTrips: number;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  coordinates: Coordinates;
  distanceKm: number;
  etaMinutes: number;
}
