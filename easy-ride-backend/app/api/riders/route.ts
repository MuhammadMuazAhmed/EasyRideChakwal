// app/api/riders/route.ts
// GET /api/riders — admin-only paginated list of riders.
// Modeled on GET /api/drivers (same auth pattern, same response shape).
// Query params: page (default 1), limit (default 20), search (firstName/lastName/phone).

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { User } from '@/models/User';
import { ok, unauthorized, serverError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }

    if (auth.role !== 'admin') return unauthorized('Sirf admin dekh sakta hai');

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
    const search = searchParams.get('search')?.trim();

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { phone:     { $regex: search, $options: 'i' } },
      ];
    }

    const [riders, total] = await Promise.all([
      User.find(query)
        .select('-fcmToken')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return ok({ riders, total, page, limit });
  } catch (err) {
    return serverError(err);
  }
}
