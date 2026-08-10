import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { Driver } from '@/models/Driver';
import { Ride } from '@/models/Ride';
import { ok, unauthorized, serverError, notFound } from '@/lib/response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = requireAuth(req);

    const { id } = await params;
    // Allow drivers to fetch their own stats or admins
    if (auth.role !== 'driver' && auth.role !== 'admin') {
      return unauthorized('Not allowed');
    }

    const driver = await Driver.findById(id);
    if (!driver) return notFound('Driver not found');

    const driverId = driver._id;

    // Counts
    const acceptedCount = await Ride.countDocuments({
      driverId,
      status: { $in: ['driver_assigned', 'driver_en_route', 'driver_arrived', 'in_progress', 'completed'] },
    });

    const driverCancelledCount = await Ride.countDocuments({ driverId, cancelledBy: 'driver' });

    const completedCount = await Ride.countDocuments({ driverId, status: 'completed' });

    // Today's earnings (sum of fare for rides completed today)
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todaysRides = await Ride.find({
      driverId,
      status: 'completed',
      completedAt: { $gte: start, $lte: end },
    }).select('fare');

    const todayEarnings = todaysRides.reduce((s, r) => s + (r.fare ?? 0), 0);

    const denom = acceptedCount + driverCancelledCount;
    const acceptRate = denom > 0 ? Math.round((acceptedCount / denom) * 100) : null;

    return ok({
      rating: driver.rating ?? null,
      totalTrips: driver.totalTrips ?? 0,
      totalEarnings: driver.totalEarnings ?? 0,
      completedCount,
      acceptedCount,
      driverCancelledCount,
      acceptRate,
      todayEarnings,
    });
  } catch (err) {
    return serverError(err);
  }
}
