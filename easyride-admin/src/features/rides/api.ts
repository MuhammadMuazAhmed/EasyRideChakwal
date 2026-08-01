import { apiClient, unwrap } from '@/lib/api-client';
import type { PaginatedResult, Ride, RideStatusFilter } from '@/types';

export interface RideListParams {
  page?: number;
  limit?: number;
  status?: RideStatusFilter;
}

/**
 * GET /api/rides — for role 'rider' or 'driver' this route scopes to that
 * user; for role 'admin' neither branch applies, so the query stays
 * unfiltered and this returns ALL rides platform-wide. Confirmed from the
 * backend source (app/api/rides/route.ts). Works today.
 */
export async function listRides(params: RideListParams): Promise<PaginatedResult<Ride>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status && params.status !== 'all') query.set('status', params.status);
  return unwrap(apiClient.get(`/rides?${query.toString()}`));
}

/** GET /api/rides/:id — admin is explicitly authorized in the route. */
export async function getRide(id: string): Promise<Ride> {
  return unwrap(apiClient.get(`/rides/${id}`));
}

/**
 * POST /api/rides/:id/cancel — WARNING: the current route only authorizes
 * the ride's own rider or assigned driver to cancel; an admin JWT will get
 * a 401 here. Force-cancel needs a small backend change to allow
 * auth.role === 'admin'. See BACKEND_REQUIREMENTS.md. Wired now so it
 * activates the moment that ships.
 */
export async function forceCancelRide(id: string, reason: string): Promise<{ rideId: string; status: string }> {
  return unwrap(apiClient.post(`/rides/${id}/cancel`, { reason }));
}
