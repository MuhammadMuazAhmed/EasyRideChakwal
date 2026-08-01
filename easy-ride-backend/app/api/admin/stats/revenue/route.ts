// app/api/admin/stats/revenue/route.ts
// GET /api/admin/stats/revenue?range=today|week|month
// Ports the aggregation logic from app/admin/revenue/page.tsx into a JSON
// route so the easyride-admin SPA can power its Revenue page.
//
// Response shape:
// {
//   revenue, rideCount, platformFee,
//   dailyBreakdown: [{ date: string, revenue: number, count: number }],
//   topDrivers: [{ _id, firstName, lastName, vehiclePlate, totalTrips, totalEarnings, rating }]
// }

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { Ride } from '@/models/Ride';
import { Driver } from '@/models/Driver';
import { ok, unauthorized, badRequest, serverError } from '@/lib/response';

const PLATFORM_COMMISSION = 0.15;

type Range = 'today' | 'week' | 'month';

function getRangeStart(range: Range): Date {
  const now = new Date();
  switch (range) {
    case 'today': {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case 'week': {
      const d = new Date(now);
      d.setDate(now.getDate() - 7);
      return d;
    }
    case 'month': {
      const d = new Date(now);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }

    if (auth.role !== 'admin') return unauthorized('Admin access required');

    const { searchParams } = new URL(req.url);
    const rawRange = searchParams.get('range') ?? 'week';
    if (!['today', 'week', 'month'].includes(rawRange)) {
      return badRequest('range must be one of: today, week, month');
    }
    const range = rawRange as Range;
    const rangeStart = getRangeStart(range);

    const [revenueAgg, dailyBreakdown, topDrivers] = await Promise.all([
      Ride.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: rangeStart } } },
        { $group: { _id: null, revenue: { $sum: '$fare' }, count: { $sum: 1 } } },
      ]),

      Ride.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$fare' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', revenue: 1, count: 1 } },
      ]),

      Driver.find({ isActive: true })
        .sort({ totalEarnings: -1 })
        .limit(10)
        .select('firstName lastName vehiclePlate totalTrips totalEarnings rating')
        .lean(),
    ]);

    const revenue = (revenueAgg[0]?.revenue ?? 0) as number;
    const rideCount = (revenueAgg[0]?.count ?? 0) as number;
    const platformFee = Math.round(revenue * PLATFORM_COMMISSION);

    return ok({
      range,
      revenue,
      rideCount,
      platformFee,
      dailyBreakdown,
      topDrivers,
    });
  } catch (err) {
    return serverError(err);
  }
}
