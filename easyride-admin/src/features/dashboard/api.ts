import { apiClient } from '@/lib/api-client';
import { listDrivers } from '@/features/drivers/api';
import { listRides } from '@/features/rides/api';
import type { Driver, Ride } from '@/types';

export interface DashboardSnapshot {
  drivers: { total: number; online: number; pendingVerification: number; verified: number };
  rides: { total: number; searching: number; active: number; completed: number; cancelled: number };
  recentDrivers: Driver[];
  recentRides: Ride[];
}

const ACTIVE_RIDE_STATUSES = ['driver_assigned', 'driver_en_route', 'driver_arrived', 'in_progress'] as const;

/**
 * Builds the dashboard snapshot entirely from endpoints that exist today
 * (GET /api/drivers, GET /api/rides), by reading the `total` returned for
 * each status filter. This is a handful of light, count-only requests —
 * fine for an admin console, but a single aggregate endpoint
 * (GET /api/admin/stats) would be far cheaper at scale. See
 * BACKEND_REQUIREMENTS.md. Fields that have no backing data anywhere in
 * the current backend (total riders, revenue, peak hours, heatmap) are
 * intentionally NOT included here — the Dashboard page renders honest
 * "needs backend endpoint" states for those instead of invented numbers.
 */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [totalDrivers, onlineDrivers, pendingDrivers, verifiedDrivers, recentDriversRes] = await Promise.all([
    listDrivers({ limit: 1 }),
    listDrivers({ limit: 1, status: 'online' }),
    listDrivers({ limit: 1, status: 'pending' }),
    listDrivers({ limit: 1, status: 'verified' }),
    listDrivers({ limit: 5 }),
  ]);

  const [totalRides, searchingRides, completedRides, cancelledRides, recentRidesRes, ...activeCounts] = await Promise.all([
    listRides({ limit: 1 }),
    listRides({ limit: 1, status: 'searching' }),
    listRides({ limit: 1, status: 'completed' }),
    listRides({ limit: 1, status: 'cancelled' }),
    listRides({ limit: 5 }),
    ...ACTIVE_RIDE_STATUSES.map((status) => listRides({ limit: 1, status })),
  ]);

  const activeRides = activeCounts.reduce((sum, r) => sum + r.total, 0);

  return {
    drivers: {
      total: totalDrivers.total,
      online: onlineDrivers.total,
      pendingVerification: pendingDrivers.total,
      verified: verifiedDrivers.total,
    },
    rides: {
      total: totalRides.total,
      searching: searchingRides.total,
      active: activeRides,
      completed: completedRides.total,
      cancelled: cancelledRides.total,
    },
    recentDrivers: recentDriversRes.drivers ?? [],
    recentRides: recentRidesRes.rides ?? [],
  };
}

export interface HealthStatus {
  status: 'ok' | 'error';
  db: 'connected' | 'disconnected';
  timestamp?: string;
}

/** GET /api/health — works today, public route. */
export async function getSystemHealth(): Promise<HealthStatus> {
  const res = await apiClient.get('/health');
  return res.data;
}
