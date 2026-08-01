import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { deleteRideRealtimeData, updateRideStatus } from '@/lib/realtime';
import { Ride } from '@/models/Ride';
import { ok, unauthorized, serverError } from '@/lib/response';

// POST /api/rides/reset-active — clears any stuck active rides for current user or driver
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }

    const activeStatuses = ['searching', 'driver_assigned', 'driver_en_route', 'driver_arrived', 'in_progress'];
    
    // Find active rides associated with this rider or driver
    const query = {
      $or: [
        { riderId: auth.userId },
        { driverId: auth.userId }
      ],
      status: { $in: activeStatuses }
    };

    const ridesToReset = await Ride.find(query);

    for (const ride of ridesToReset) {
      const rideId = ride._id.toString();
      ride.status = 'cancelled';
      ride.cancelledAt = new Date();
      ride.cancelReason = 'Reset by system / user requested reset';
      await ride.save();

      await updateRideStatus(rideId, 'cancelled', { cancelledAt: Date.now() });
      await deleteRideRealtimeData(rideId);
    }

    return ok(
      { resetCount: ridesToReset.length },
      `${ridesToReset.length} active ride(s) reset successfully.`
    );
  } catch (err) {
    return serverError(err);
  }
}
