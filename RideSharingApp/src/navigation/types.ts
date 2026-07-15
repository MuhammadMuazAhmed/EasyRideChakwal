import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  PhoneNumber: undefined;
  OtpVerification: { phone: string; role: 'rider' | 'driver' };
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};

export type RiderStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  LocationSearch: undefined;
  PickupSelection: undefined;
  DestinationSelection: undefined;
  VehicleSelection: undefined;
  PaymentMethod: undefined;
  DriverSearching: undefined;
  DriverTracking: undefined;
  ActiveTrip: undefined;
  TripCompleted: undefined;
  Rating: { rideId?: string };
  TripReceipt: { rideId?: string };
  RideDetails: { rideId: string };
  EditProfile: undefined;
  SOS: undefined;
  EmergencyContacts: undefined;
  Settings: undefined;
  Referral: undefined;
  Notifications: undefined;
  Support: undefined;
  Chat: undefined;
  CancelRide: undefined;
  NoDriver: undefined;
  SavedPlaces: undefined;
  ScheduleRide: undefined;
  SurgeAlert: undefined;
  Terms: undefined;
  ForceUpdate: undefined;
  Maintenance: undefined;
  NoCoverage: undefined;
};

export type DriverTabParamList = {
  Dashboard: undefined;
  Earnings: undefined;
  Profile: undefined;
};

export type DriverStackParamList = {
  DriverTabs: NavigatorScreenParams<DriverTabParamList>;
  IncomingRequest: { ride: any };
  ActiveTrip: { rideId: string };
  Chat: { rideId: string };
  TripCompleted: {
    rideId: string;
    finalFare: number;
    driverEarning: number;
    pickupName: string;
    destinationName: string;
    paymentMethod: string;
    riderName?: string;
  };
  RateRider: { rideId: string; riderName?: string };
  Support: undefined;
  Verification: undefined;
  Settings: undefined;
  EditProfile: undefined;
  VehicleDetails: undefined;
  DriverRegistrationNavigator: undefined;
  DriverPending: undefined;
};

export type DriverRegistrationStackParamList = {
  PersonalDetails: undefined;
  Selfie: undefined;
  Cnic: undefined;
  License: undefined;
  VehicleDetails: undefined;
  VehicleReg: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Rider: NavigatorScreenParams<RiderStackParamList>;
  Driver: NavigatorScreenParams<DriverStackParamList>;
  RoleSelection: undefined;
};
