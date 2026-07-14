import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { updateRideStatus } from '@/lib/realtime';
import { Notify } from '@/lib/fcm';
import { Ride } from '@/models/Ride';
import { User } from '@/models/User';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }

    if (auth.role !== 'driver') {
      return badRequest('Sirf driver trip start kar sakta hai');
    }

    const { id: rideId } = await params;

    const ride = await Ride.findOneAndUpdate(
      {
        _id: rideId,
        driverId: auth.userId,
        status: { $in: ['driver_assigned', 'driver_en_route', 'driver_arrived'] },
      },
      { status: 'in_progress' },
      { new: true }
    ).populate('riderId', 'fcmToken firstName');

    if (!ride) return notFound('Ride nahi mili ya status galat hai');

    await updateRideStatus(rideId, 'in_progress', {
      startedAt: Date.now(),
    });

    const rider = ride.riderId as { fcmToken?: string };
    if (rider.fcmToken) {
      await Notify.tripStarted(rider.fcmToken);
    }

    return ok({ rideId, status: 'in_progress' }, 'Trip shuru ho gayi');
  } catch (err) {
    return serverError(err);
  }
}
