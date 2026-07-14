import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { setRideDriver, updateRideStatus } from '@/lib/realtime';
import { Notify } from '@/lib/fcm';
import { Ride } from '@/models/Ride';
import { Driver } from '@/models/Driver';
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
      return badRequest('Sirf driver ride accept kar sakta hai');
    }

    const { id: rideId } = await params;

    // Check driver is verified and active
    const driver = await Driver.findById(auth.userId);
    if (!driver) return notFound('Driver account nahi mila');
    if (!driver.isVerified) return badRequest('Aapka account verify nahi hua abhi');
    if (!driver.isOnline) return badRequest('Pehle online ho jayein');
    if (driver.isSuspended) return badRequest('Aapka account suspend hai');

    // Check driver does not already have an active ride
    const driverActiveRide = await Ride.findOne({
      driverId: auth.userId,
      status: { $in: ['driver_assigned', 'driver_en_route', 'driver_arrived', 'in_progress'] },
    });

    if (driverActiveRide) {
      return badRequest('Aapke paas pehle se ek active ride hai');
    }

    // Find and lock the ride atomically — prevents two drivers accepting simultaneously
    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, status: 'searching' },
      {
        status: 'driver_assigned',
        driverId: auth.userId,
      },
      { new: true }
    ).populate('riderId', 'firstName lastName fcmToken');

    if (!ride) {
      return badRequest('Yeh ride available nahi — kisi aur driver ne le li');
    }

    // Update Firebase realtime for live tracking
    await setRideDriver(rideId, auth.userId, {
      name: `${driver.firstName} ${driver.lastName}`,
      vehicleModel: driver.vehicleModel,
      vehiclePlate: driver.vehiclePlate,
      rating: driver.rating,
      phone: driver.phone,
    });

    // Notify rider
    const rider = ride.riderId as { fcmToken?: string; firstName: string };
    if (rider.fcmToken) {
      await Notify.driverAccepted(
        rider.fcmToken,
        `${driver.firstName} ${driver.lastName}`,
        driver.vehicleModel,
        driver.vehiclePlate,
        5 // ETA in minutes — replace with actual calculation
      );
    }

    return ok(
      {
        rideId,
        driver: {
          name: `${driver.firstName} ${driver.lastName}`,
          vehicleModel: driver.vehicleModel,
          vehiclePlate: driver.vehiclePlate,
          vehicleColor: driver.vehicleColor,
          rating: driver.rating,
          phone: driver.phone,
        },
      },
      'Ride accept kar li'
    );
  } catch (err) {
    return serverError(err);
  }
}
