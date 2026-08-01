import { apiClient, unwrap } from '@/lib/api-client';

export interface AdminLoginResponse {
  token: string;
  admin: { name: string; role: 'super_admin' | 'admin' | 'support' };
}

/**
 * REQUIRES BACKEND ENDPOINT: POST /api/admin/auth/login
 * This does not exist in easy-ride-backend yet. See BACKEND_REQUIREMENTS.md
 * at the project root for the exact drop-in route to add — it reuses the
 * existing ADMIN_SECRET env var and the existing signToken() helper, so it
 * introduces no new secrets and touches no existing files.
 */
export async function adminLogin(secret: string): Promise<AdminLoginResponse> {
  return unwrap(apiClient.post('/admin/auth/login', { secret }));
}
