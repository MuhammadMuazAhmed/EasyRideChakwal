import { apiClient, unwrap } from '@/lib/api-client';
import type { Driver, DriverStatusFilter, PaginatedResult } from '@/types';

export interface DriverListParams {
  page?: number;
  limit?: number;
  status?: DriverStatusFilter;
  search?: string;
}

/** GET /api/drivers — admin-only, already supports status + search + pagination. */
export async function listDrivers(params: DriverListParams): Promise<PaginatedResult<Driver>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  return unwrap(apiClient.get(`/drivers?${query.toString()}`));
}

/** GET /api/drivers/:id */
export async function getDriver(id: string): Promise<Driver> {
  return unwrap(apiClient.get(`/drivers/${id}`));
}

/** PATCH /api/drivers/:id — limited to profile fields the backend accepts. */
export async function updateDriver(
  id: string,
  payload: Partial<Pick<Driver, 'firstName' | 'lastName' | 'vehicleModel' | 'vehicleColor'>>
): Promise<Driver> {
  return unwrap(apiClient.patch(`/drivers/${id}`, payload));
}

export type DriverVerifyAction = 'approve' | 'reject' | 'suspend' | 'unsuspend';

/** POST /api/drivers/:id/verify — the JSON equivalent of the server-rendered
 *  admin panel's approve/reject/suspend actions. Use this from the SPA
 *  instead of /api/admin/drivers/:id/action, which is cookie-authed and
 *  form-encoded (built for the Next.js pages, not a JSON client). */
export async function setDriverVerification(id: string, action: DriverVerifyAction, reason?: string): Promise<Driver> {
  return unwrap(apiClient.post(`/drivers/${id}/verify`, { action, reason }));
}

/** GET /api/drivers/nearby — used as a practical (imperfect) data source for
 *  the live map until a dedicated "all driver positions" endpoint exists.
 *  See BACKEND_REQUIREMENTS.md. */
export async function listNearbyDrivers(params: { latitude: number; longitude: number; radiusKm?: number }) {
  const query = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    radiusKm: String(params.radiusKm ?? 50),
  });
  return unwrap<{ drivers: Array<Driver & { distanceKm: number; etaMinutes: number }>; count: number }>(
    apiClient.get(`/drivers/nearby?${query.toString()}`)
  );
}
