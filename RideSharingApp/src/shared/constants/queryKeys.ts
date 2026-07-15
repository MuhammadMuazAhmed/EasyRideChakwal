export const QUERY_KEYS = {
  profile: ['profile'] as const,
  rideHistory: (page?: number) => ['rideHistory', page] as const,
  currentRide: ['currentRide'] as const,
  notifications: ['notifications'] as const,
  emergencyContacts: ['emergencyContacts'] as const,
  savedPlaces: ['savedPlaces'] as const,
  referral: ['referral'] as const,
  driverProfile: ['driverProfile'] as const,
  driverRideHistory: (page?: number) => ['driverRideHistory', page] as const,
  incomingRequests: (isOnline?: boolean) => ['incomingRequests', isOnline] as const,
} as const;
