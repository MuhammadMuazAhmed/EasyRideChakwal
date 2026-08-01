import { apiClient, unwrap } from '@/lib/api-client';
import type { PaginatedResult, Rider } from '@/types';

export interface RiderListParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * REQUIRES BACKEND ENDPOINT: GET /api/riders
 * easy-ride-backend currently only exposes GET/PATCH /api/riders/:id (single
 * rider). There is no list endpoint, so the Riders table cannot be
 * populated yet. This call is wired to the same response shape as
 * /api/drivers so it will work the moment that route ships — see
 * BACKEND_REQUIREMENTS.md for the exact drop-in file.
 */
export async function listRiders(params: RiderListParams): Promise<PaginatedResult<Rider>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  return unwrap(apiClient.get(`/riders?${query.toString()}`));
}

/** GET /api/riders/:id — works today. */
export async function getRider(id: string): Promise<Rider> {
  return unwrap(apiClient.get(`/riders/${id}`));
}

/** PATCH /api/riders/:id — works today (profile fields only; no ban/suspend
 *  flag exists on the User model yet — see BACKEND_REQUIREMENTS.md). */
export async function updateRider(
  id: string,
  payload: Partial<Pick<Rider, 'firstName' | 'lastName' | 'email' | 'language'>>
): Promise<Rider> {
  return unwrap(apiClient.patch(`/riders/${id}`, payload));
}
