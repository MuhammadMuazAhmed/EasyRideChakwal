// app/api/admin/auth/login/route.ts  (NEW FILE — nothing else touched)
import { NextRequest } from 'next/server';
import { signToken } from '@/lib/auth';
import { ok, unauthorized } from '@/lib/response';

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== process.env.ADMIN_SECRET) return unauthorized('Invalid password');
  const token = signToken({ userId: 'admin', phone: 'admin', role: 'admin' });
  return ok({ token, admin: { name: 'Admin', role: 'admin' } });
}