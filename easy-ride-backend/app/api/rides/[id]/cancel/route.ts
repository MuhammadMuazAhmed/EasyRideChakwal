import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { updateRideStatus } from '@/lib/realtime';
import { Notify } from '@/lib/fcm';
import { Ride } from '@/models/Ride';
import { Driver } from '@/models/Driver';
import { User } from '@/models/User';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/response';

const schema = z.object({
  reason: z.string().min(1).max(200).optional(),
});

// Cancellation fee in PKR — charged if driver already arrived
const CANCELLATION_FEE = 30;

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

    const { id: rideId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    const reason = parsed.success ? parsed.data.reason : undefined;

    // Find the ride
    const ride = await Ride.findById(rideId)
      .populate('riderId', 'fcmToken')
      .populate('driverId', 'fcmToken');

    if (!ride) return notFound('Ride nahi mili');

    // Only rider or driver assigned to this ride can cancel
    const riderId = ride.riderId._id.toString();
    const driverId = ride.driverId?._id?.toString();

    const isRider = auth.role === 'rider' && riderId === auth.userId;
    const isDriver = auth.role === 'driver' && driverId === auth.userId;

    if (!isRider && !isDriver) {
      return unauthorized('Is ride ko cancel karne ka haq nahi');
    }

    // Cannot cancel a completed or already cancelled ride
    if (['completed', 'cancelled'].includes(ride.status)) {
      return badRequest('Yeh ride already complete ya cancel ho chuki hai');
    }

    // Cannot cancel in_progress ride
    if (ride.status === 'in_progress') {
      return badRequest('Trip chal rahi hai — cancel nahi ho sakti');
    }

    // Determine cancellation fee
    let cancellationFee = 0;
    if (isRider && ride.status === 'driver_arrived') {
      cancellationFee = CANCELLATION_FEE;
    }

    await Ride.findByIdAndUpdate(rideId, {
      status: 'cancelled',
      cancelledBy: auth.role,
      cancellationReason: reason,
    });

    await updateRideStatus(rideId, 'cancelled');

    // Notify the other party
    if (isRider && driverId) {
      const driver = ride.driverId as { fcmToken?: string };
      if (driver.fcmToken) {
        await Notify.rideCancelled(driver.fcmToken);
      }
    }

    return ok(
      {
        rideId,
        status: 'cancelled',
        cancellationFee,
        cancelledBy: auth.role,
      },
      'Ride cancel ho gayi'
    );
  } catch (err) {
    return serverError(err);
  }
}
