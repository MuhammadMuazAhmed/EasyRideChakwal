import type { RidePartyRef } from '@/types';

/** riderId/driverId on a Ride come back as a plain string ID when not
 * populated, or a populated object when the route calls .populate(). */
export function isRidePartyRef(value: string | RidePartyRef | undefined): value is RidePartyRef {
  return typeof value === 'object' && value !== null;
}
