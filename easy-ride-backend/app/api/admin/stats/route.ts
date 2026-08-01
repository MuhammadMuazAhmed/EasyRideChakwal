// app/api/admin/stats/route.ts
// GET /api/admin/stats — single-request dashboard aggregate.
// Returns the same figures that app/admin/page.tsx already computes but
// exposed as a JSON route so the easyride-admin SPA can consume it with
// a single fetch instead of N separate requests.
//
// Response shape:
// {
//   totalRiders, totalDrivers, onlineDrivers, pendingDrivers,
//   totalRides, todayRides, activeRides, todayRevenue, platformFee
// }

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { Ride } from '@/models/Ride';
import { Driver } from '@/models/Driver';
import { User } from '@/models/User';
import { ok, unauthorized, serverError } from '@/lib/response';

const ACTIVE_STATUSES = ['searching', 'driver_assigned', 'driver_en_route', 'driver_arrived', 'in_progress'] as const;
const PLATFORM_COMMISSION = 0.15;

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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalRides,
      todayRides,
      activeRides,
      totalDrivers,
      onlineDrivers,
      pendingDrivers,
      totalRiders,
      todayRevenueAgg,
    ] = await Promise.all([
      Ride.countDocuments(),
      Ride.countDocuments({ createdAt: { $gte: todayStart } }),
      Ride.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
      Driver.countDocuments({ isActive: true }),
      Driver.countDocuments({ isOnline: true }),
      Driver.countDocuments({ isVerified: false, isActive: true }),
      User.countDocuments({ isActive: true }),
      Ride.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$fare' } } },
      ]),
    ]);

    const todayRevenue = (todayRevenueAgg[0]?.total ?? 0) as number;
    const platformFee = Math.round(todayRevenue * PLATFORM_COMMISSION);

    return ok({
      totalRiders,
      totalDrivers,
      onlineDrivers,
      pendingDrivers,
      totalRides,
      todayRides,
      activeRides,
      todayRevenue,
      platformFee,
    });
  } catch (err) {
    return serverError(err);
  }
}
