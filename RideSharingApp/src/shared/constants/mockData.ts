import type {
  Driver,
  EmergencyContact,
  Location,
  Notification,
  RideHistoryItem,
  SavedPlace,
  User,
  VehicleOption,
} from '@/shared/types';

export const mockUser: User = {
  id: 'user-001',
  firstName: 'Sana',
  lastName: 'Ahmad',
  phone: '+92 310 0570499',
  avatarInitials: 'SA',
  rating: 4.8,
  totalRides: 24,
  badge: 'Easy Rider',
  referralCode: 'SANA50',
  language: 'ur',
};

export const mockDriver: Driver = {
  id: 'driver-001',
  firstName: 'Abdul',
  lastName: 'Rehman',
  phone: '+92 300 1234567',
  avatarInitials: 'AR',
  rating: 4.9,
  totalTrips: 312,
  vehicleType: 'car',
  vehicleModel: 'Suzuki Alto',
  vehiclePlate: 'LZR-482',
  coordinates: {
    latitude: 32.935,
    longitude: 72.852,
  },
};

export const mockLocations: Record<string, Location> = {
  clockTower: {
    id: 'loc-001',
    name: 'Clock Tower Chakwal',
    address: 'Clock Tower Rd, Chakwal',
    coordinates: { latitude: 32.9333, longitude: 72.8571 },
  },
  gctCollege: {
    id: 'loc-002',
    name: 'GCT Chakwal College',
    address: 'Near Bus Stand, Chakwal',
    coordinates: { latitude: 32.938, longitude: 72.862 },
  },
  busStand: {
    id: 'loc-003',
    name: 'Chakwal Bus Stand',
    address: 'Main Road, Chakwal',
    coordinates: { latitude: 32.931, longitude: 72.855 },
  },
  cityHospital: {
    id: 'loc-004',
    name: 'Chakwal City Hospital',
    address: 'GT Road, Chakwal',
    coordinates: { latitude: 32.929, longitude: 72.86 },
  },
  tehsilOffice: {
    id: 'loc-005',
    name: 'Tehsil Office',
    address: 'Main Road Chakwal',
    coordinates: { latitude: 32.936, longitude: 72.858 },
  },
  gtRoadPump: {
    id: 'loc-006',
    name: 'GT Road Petrol Pump',
    address: 'GT Road, Chakwal',
    coordinates: { latitude: 32.928, longitude: 72.865 },
  },
  kallarKahar: {
    id: 'loc-007',
    name: 'Kallar Kahar Road',
    address: 'Kallar Kahar Road, Chakwal',
    coordinates: { latitude: 32.942, longitude: 72.87 },
  },
};

export const popularSpots: Location[] = [
  mockLocations.gctCollege,
  mockLocations.busStand,
  mockLocations.tehsilOffice,
  mockLocations.cityHospital,
  mockLocations.gtRoadPump,
  mockLocations.kallarKahar,
];

export const vehicleOptions: VehicleOption[] = [
  {
    type: 'car',
    label: 'Car',
    icon: '🚗',
    baseFare: 50,
    perKmRate: 35,
    eta: 4,
    capacity: 4,
  },
  {
    type: 'bike',
    label: 'Bike',
    icon: '🏍️',
    baseFare: 30,
    perKmRate: 20,
    eta: 3,
    capacity: 1,
  },
  {
    type: 'qingqi',
    label: 'Qingqi',
    icon: '🛺',
    baseFare: 40,
    perKmRate: 25,
    eta: 5,
    capacity: 3,
  },
];

export const mockRideHistory: RideHistoryItem[] = [
  {
    id: 'hist-001',
    date: 'Aaj · 2:30 PM',
    pickup: 'Clock Tower',
    destination: 'GCT College',
    fare: 185,
    driverName: 'Abdul R.',
    driverRating: 5.0,
    status: 'completed',
    vehicleType: 'car',
  },
  {
    id: 'hist-002',
    date: 'Kal · 10:15 AM',
    pickup: 'Bus Stand',
    destination: 'City Hospital',
    fare: 120,
    driverName: 'Tariq M.',
    driverRating: 4.8,
    status: 'completed',
    vehicleType: 'bike',
  },
  {
    id: 'hist-003',
    date: '23 Jun · 6:00 PM',
    pickup: 'Home Dhok',
    destination: 'Main Bazar',
    fare: 95,
    driverName: 'Zubair A.',
    driverRating: 4.9,
    status: 'completed',
    vehicleType: 'qingqi',
  },
  {
    id: 'hist-004',
    date: '22 Jun · 9:00 AM',
    pickup: 'GT Road',
    destination: 'Talagang Road',
    fare: 310,
    driverName: 'Asim K.',
    driverRating: 5.0,
    status: 'completed',
    vehicleType: 'car',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    title: 'Driver Accepted',
    message: 'Abdul Rehman is on the way to pick you up.',
    type: 'ride',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-002',
    title: 'Trip Completed',
    message: 'Your ride to GCT College has been completed. Rate your driver!',
    type: 'ride',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'notif-003',
    title: 'PKR 50 Referral Credit',
    message: 'Your friend joined Easy Ride! PKR 50 added to your wallet.',
    type: 'promo',
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'notif-004',
    title: 'Safety Reminder',
    message: 'Always verify your driver and vehicle plate before boarding.',
    type: 'safety',
    read: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export const mockEmergencyContacts: EmergencyContact[] = [
  { id: 'ec-001', name: 'Ami Jan', relationship: 'Mama', phone: '+92 300 1111111' },
  { id: 'ec-002', name: 'Bhai', relationship: 'Brother', phone: '+92 301 2222222' },
  { id: 'ec-003', name: 'Sara Ali', relationship: 'Friend', phone: '+92 302 3333333' },
];

export const mockSavedPlaces: SavedPlace[] = [
  {
    id: 'sp-001',
    label: 'Ghar',
    icon: '🏠',
    address: 'Gali No. 4, Dhok Qureshi, Chakwal',
    coordinates: { latitude: 32.93, longitude: 72.854 },
  },
  {
    id: 'sp-002',
    label: 'Office',
    icon: '💼',
    address: 'Tehsil Office, Main Road Chakwal',
    coordinates: mockLocations.tehsilOffice.coordinates,
  },
  {
    id: 'sp-003',
    label: 'College',
    icon: '🎓',
    address: 'GCT Chakwal, Near Bus Stand',
    coordinates: mockLocations.gctCollege.coordinates,
  },
  {
    id: 'sp-004',
    label: 'Ami ki Jagah',
    icon: '👨‍👩‍👧',
    address: 'Mohalla Gulshan, Talagang Road',
    coordinates: { latitude: 32.925, longitude: 72.85 },
  },
];

export const nearbyDriverMarkers = [
  { id: 'd1', latitude: 32.936, longitude: 72.86 },
  { id: 'd2', latitude: 32.931, longitude: 72.853 },
  { id: 'd3', latitude: 32.928, longitude: 72.862 },
];

export const ratingTags = [
  'Safe Driving ✓',
  'On Time ✓',
  'Clean Car ✓',
  'Friendly',
  'Knew the Route',
  'Smooth Ride',
];

export const cancelReasons = [
  'Driver bahut door hai',
  'Galti se request ho gayi',
  'Plan change ho gaya',
  'Koi driver nahi mila',
  'Koi aur wajah',
];

export const quickReplies = [
  'Haan, main yahan hoon ✋',
  '1 minute mein aata hoon',
  'Kia aap mujhe dekh sakte hain?',
  'Okay, theek hai',
];

export const onboardingSlides = [
  {
    id: '1',
    title: 'Safe Ride, Every Time',
    titleUrdu: 'ہر سفر محفوظ',
    description: 'Book rides across Chakwal with verified drivers and real-time tracking.',
    icon: '🛡️',
  },
  {
    id: '2',
    title: 'Choose Your Ride',
    titleUrdu: 'اپنی سواری منتخب کریں',
    description: 'Car, Bike, or Qingqi — pick what suits your journey and budget.',
    icon: '🚗',
  },
  {
    id: '3',
    title: 'SOS Safety',
    titleUrdu: 'ایمرجنسی SOS',
    description: 'One-tap emergency alerts to your saved contacts with live location.',
    icon: '🚨',
  },
];
