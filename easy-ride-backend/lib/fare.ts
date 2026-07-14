import type { Coordinates, FareCalculation, VehicleType } from '@/types';

// Chakwal city fare config — adjust anytime from admin
const FARE_CONFIG: Record<
  VehicleType,
  {
    baseFare: number;
    perKmRate: number;
    perMinuteRate: number;
    minimumFare: number;
    avgSpeedKmh: number;
  }
> = {
  car: {
    baseFare: 50,
    perKmRate: 35,
    perMinuteRate: 9,
    minimumFare: 80,
    avgSpeedKmh: 25,
  },
  bike: {
    baseFare: 30,
    perKmRate: 20,
    perMinuteRate: 5,
    minimumFare: 50,
    avgSpeedKmh: 30,
  },
  qingqi: {
    baseFare: 40,
    perKmRate: 25,
    perMinuteRate: 7,
    minimumFare: 60,
    avgSpeedKmh: 20,
  },
};

// Chakwal city centre boundary
const CHAKWAL_CITY_BOUNDS = {
  minLat: 32.88,
  maxLat: 32.98,
  minLng: 72.83,
  maxLng: 72.90,
};

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Haversine — straight line distance
// Works for village routes without road mapping data
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371;
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isInCity(coord: Coordinates): boolean {
  return (
    coord.latitude >= CHAKWAL_CITY_BOUNDS.minLat &&
    coord.latitude <= CHAKWAL_CITY_BOUNDS.maxLat &&
    coord.longitude >= CHAKWAL_CITY_BOUNDS.minLng &&
    coord.longitude <= CHAKWAL_CITY_BOUNDS.maxLng
  );
}

export function calculateFare(
  from: Coordinates,
  to: Coordinates,
  vehicleType: VehicleType,
  surgeMultiplier = 1.0
): FareCalculation {
  const config = FARE_CONFIG[vehicleType];
  const straightDistance = calculateDistance(from, to);

  // Village/rural routes: straight-line underestimates actual road distance
  // Apply 1.25x multiplier when either endpoint is outside city bounds
  const isRural = !isInCity(from) || !isInCity(to);
  const distance = isRural
    ? Math.round(straightDistance * 1.25 * 10) / 10
    : Math.round(straightDistance * 10) / 10;

  const estimatedDuration = Math.ceil((distance / config.avgSpeedKmh) * 60);
  const distanceFare = distance * config.perKmRate;
  const timeFare = estimatedDuration * config.perMinuteRate;
  const rawFare = config.baseFare + distanceFare + timeFare;
  const withSurge = rawFare * surgeMultiplier;
  const totalFare = Math.max(Math.round(withSurge), config.minimumFare);

  return {
    distance,
    estimatedDuration,
    baseFare: config.baseFare,
    distanceFare: Math.round(distanceFare),
    timeFare: Math.round(timeFare),
    totalFare,
    surgeMultiplier,
    vehicleType,
  };
}

// Find drivers sorted by distance — used in /api/drivers/nearby
export function sortByDistance<T extends { coordinates: Coordinates }>(
  items: T[],
  from: Coordinates
): (T & { distanceKm: number; etaMinutes: number })[] {
  return items
    .map((item) => {
      const distanceKm = calculateDistance(from, item.coordinates);
      const etaMinutes = Math.ceil((distanceKm / 25) * 60); // 25 km/h avg
      return { ...item, distanceKm: Math.round(distanceKm * 10) / 10, etaMinutes };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
