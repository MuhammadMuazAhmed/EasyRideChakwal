import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth, isTempToken } from '@/lib/auth';
import { updateDriverLocation, updateRideStatus } from '@/lib/realtime';
import { Driver } from '@/models/Driver';
import { Ride } from '@/models/Ride';
import { User } from '@/models/User';
import { Notify } from '@/lib/fcm';
import { calculateDistance } from '@/lib/fare';
import { ok, badRequest, unauthorized, serverError } from '@/lib/response';

const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// POST /api/drivers/:id/location
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

    if (auth.role !== 'driver') return unauthorized('Sirf driver location update kar sakta hai');

    if (isTempToken(auth.userId)) {
      return badRequest('Registration incomplete. Please complete your driver profile.');
    }

    const { id } = await params;
    if (auth.userId !== id) return unauthorized('Sirf apni location update kar sakte hain');

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const { latitude, longitude } = parsed.data;

    // Update both MongoDB (for nearby queries) and Firebase (for real-time)
    await Promise.all([
      Driver.findByIdAndUpdate(id, {
        currentLocation: { latitude, longitude, updatedAt: new Date() },
      }),
      updateDriverLocation(id, { latitude, longitude }),
    ]);

    // Check if driver has an active ride
    const activeRide = await Ride.findOne({
      driverId: id,
      status: { $in: ['driver_assigned', 'driver_en_route', 'driver_arrived', 'in_progress'] },
    }).populate('riderId', 'fcmToken firstName lastName');

    if (activeRide) {
      if (activeRide.status === 'driver_assigned' || activeRide.status === 'driver_en_route') {
        // Calculate distance to pickup
        const distanceKm = calculateDistance(
          { latitude, longitude },
          activeRide.pickup.coordinates
        );
        if (distanceKm <= 0.05) { // 50 meters
          activeRide.status = 'driver_arrived';
          await activeRide.save();

          // Update Firebase Realtime Database
          await updateRideStatus(activeRide._id.toString(), 'driver_arrived');

          // Notify Rider
          const rider = activeRide.riderId as any;
          if (rider?.fcmToken) {
            const driverDoc = await Driver.findById(id);
            const driverName = driverDoc ? `${driverDoc.firstName} ${driverDoc.lastName}`.trim() : 'Driver';
            await Notify.driverArrived(rider.fcmToken, driverName);
          }
        }
      } else if (activeRide.status === 'in_progress') {
        // Calculate distance to destination
        const distanceKm = calculateDistance(
          { latitude, longitude },
          activeRide.destination.coordinates
        );
        if (distanceKm <= 0.05) { // 50 meters
          const PLATFORM_COMMISSION = 0.15;
          const finalFare = activeRide.estimatedFare;
          const driverEarning = Math.round(finalFare * (1 - PLATFORM_COMMISSION));

          activeRide.status = 'completed';
          activeRide.fare = finalFare;
          activeRide.completedAt = new Date();
          await activeRide.save();

          // Update driver earnings and trip count
          await Driver.findByIdAndUpdate(id, {
            $inc: {
              totalTrips: 1,
              totalEarnings: driverEarning,
              weeklyEarnings: driverEarning,
              walletBalance: driverEarning,
            },
          });

          // Update rider trip count
          await User.findByIdAndUpdate(activeRide.riderId._id, {
            $inc: { totalRides: 1 },
          });

          // Update Firebase Realtime Database
          await updateRideStatus(activeRide._id.toString(), 'completed', { completedAt: Date.now() });

          // Notify Rider
          const rider = activeRide.riderId as any;
          if (rider?.fcmToken) {
            await Notify.tripCompleted(rider.fcmToken, finalFare);
          }
        }
      }
    }

    return ok({ latitude, longitude }, 'Location update ho gayi');
  } catch (err) {
    return serverError(err);
  }
}
