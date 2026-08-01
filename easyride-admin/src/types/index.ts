// ============================================================
// EASY RIDE ADMIN — SHARED TYPES
// Mirrors easy-ride-backend/types/index.ts and models/*.ts.
// Keep in sync manually — this project does not import the
// backend package directly (independent deployable app).
// ============================================================

export type VehicleType = 'car' | 'bike' | 'qingqi';

export type RideStatus =
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

export interface LocationPoint {
  name: string;
  address: string;
  coordinates: Coordinates;
}

/** The generic envelope every easy-ride-backend route responds with. */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResult<T> {
  rides?: T[];
  drivers?: T[];
  riders?: T[];
  total: number;
  page: number;
  limit: number;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface SavedPlace {
  label: string;
  icon: string;
  address: string;
  coordinates: Coordinates;
}

export interface Rider {
  _id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatarInitials: string;
  rating: number;
  totalRides: number;
  language: 'en' | 'ur';
  referralCode: string;
  walletBalance: number;
  emergencyContacts: EmergencyContact[];
  savedPlaces: SavedPlace[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DriverDocuments {
  cnicFront?: string;
  cnicBack?: string;
  license?: string;
  vehicleReg?: string;
  selfie?: string;
  policeClearance?: string;
}

export interface Driver {
  _id: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatarInitials: string;
  rating: number;
  totalTrips: number;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  vehicleYear: number;
  cnicNumber: string;
  licenseNumber: string;
  licenseExpiry: string;
  isVerified: boolean;
  isOnline: boolean;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  documents?: DriverDocuments;
  currentLocation?: Coordinates & { updatedAt: string };
  walletBalance: number;
  totalEarnings: number;
  weeklyEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface RidePartyRef {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarInitials?: string;
  rating?: number;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
}

export interface Ride {
  _id: string;
  riderId: string | RidePartyRef;
  driverId?: string | RidePartyRef;
  status: RideStatus;
  pickup: LocationPoint;
  destination: LocationPoint;
  vehicleType: VehicleType;
  fare: number;
  estimatedFare: number;
  distance: number;
  duration: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  surgeMultiplier: number;
  riderRating?: number;
  driverRating?: number;
  riderComment?: string;
  driverComment?: string;
  cancelledBy?: 'rider' | 'driver';
  cancellationReason?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  token: string;
  role: 'admin';
  issuedAt: number;
}

export type DriverStatusFilter = 'all' | 'verified' | 'pending' | 'suspended' | 'online';
export type RideStatusFilter = 'all' | RideStatus;
