// app/api/admin/auth/login/route.ts
// Issues a Bearer JWT for the easyride-admin SPA.
// Reuses the existing ADMIN_SECRET env var and signToken() helper.
// This route is listed in PUBLIC_ROUTES in middleware.ts so it does not
// require a token to reach (it IS the token issuer).

import { NextRequest } from 'next/server';
import { signToken } from '@/lib/auth';
import { ok, unauthorized, badRequest } from '@/lib/response';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { secret } = body as { secret?: string };

  if (!secret) return badRequest('Password required');
  if (secret !== process.env.ADMIN_SECRET) return unauthorized('Invalid password');

  const token = signToken({ userId: 'admin', phone: 'admin', role: 'admin' });

  return ok(
    { token, admin: { name: 'Admin', role: 'admin' } },
    'Login successful'
  );
}