import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { updateRideStatus, deleteRideRealtimeData } from '@/lib/realtime';
import { Notify } from '@/lib/fcm';
import { Ride } from '@/models/Ride';
import { Driver } from '@/models/Driver';
import { User } from '@/models/User';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/response';

// Platform commission: 15%
const PLATFORM_COMMISSION = 0.15;

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
      return badRequest('Sirf driver trip complete kar sakta hai');
    }

    const { id: rideId } = await params;
    const body = await req.json().catch(() => ({}));
    const actualFare = body.actualFare as number | undefined;

    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, driverId: auth.userId, status: 'in_progress' },
      {
        status: 'completed',
        fare: actualFare ?? 0,
        completedAt: new Date(),
      },
      { new: true }
    ).populate('riderId', 'fcmToken totalRides');

    if (!ride) return notFound('Ride nahi mili ya already complete hai');

    const finalFare = actualFare ?? ride.estimatedFare;
    const driverEarning = Math.round(finalFare * (1 - PLATFORM_COMMISSION));
    const platformFee = finalFare - driverEarning;

    // Update final fare
    ride.fare = finalFare;
    await ride.save();

    // Update driver earnings and trip count
    await Driver.findByIdAndUpdate(auth.userId, {
      $inc: {
        totalTrips: 1,
        totalEarnings: driverEarning,
        weeklyEarnings: driverEarning,
        walletBalance: driverEarning,
      },
    });

    // Update rider trip count
    const rider = ride.riderId as { fcmToken?: string; totalRides: number };
    await User.findByIdAndUpdate(ride.riderId, {
      $inc: { totalRides: 1 },
    });

    // Notify rider
    if (rider.fcmToken) {
      await Notify.tripCompleted(rider.fcmToken, finalFare);
    }

    // Clean up Firebase realtime data
    await updateRideStatus(rideId, 'completed', { completedAt: Date.now() });
    // Keep realtime data for 5 minutes then clean (handled by Firebase TTL rule)

    return ok(
      {
        rideId,
        finalFare,
        driverEarning,
        platformFee,
        status: 'completed',
      },
      'Trip complete ho gayi. Bohat acha!'
    );
  } catch (err) {
    return serverError(err);
  }
}
