import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { calculateFare } from '@/lib/fare';
import { updateRideStatus } from '@/lib/realtime';
import { Notify } from '@/lib/fcm';
import { Ride } from '@/models/Ride';
import { Driver } from '@/models/Driver';
import { User } from '@/models/User';
import { ok, created, badRequest, unauthorized, serverError } from '@/lib/response';

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  coordinates: coordinatesSchema,
});

const createRideSchema = z.object({
  pickup: locationSchema,
  destination: locationSchema,
  vehicleType: z.enum(['car', 'bike', 'qingqi']),
  paymentMethod: z.enum(['cash', 'jazzcash', 'easypaisa', 'card']).default('cash'),
});

// POST /api/rides — rider creates a new ride request
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }

    if (auth.role !== 'rider') {
      return badRequest('Only riders can request rides');
    }

    const body = await req.json();
    const parsed = createRideSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors[0].message);
    }

    const { pickup, destination, vehicleType, paymentMethod } = parsed.data;

    // Check rider does not already have an active ride
    const activeRide = await Ride.findOne({
      riderId: auth.userId,
      status: { $in: ['searching', 'driver_assigned', 'driver_en_route', 'driver_arrived', 'in_progress'] },
    });

    if (activeRide) {
      return badRequest('Aapki pehle se ek active ride hai');
    }

    // Calculate fare
    const fareCalc = calculateFare(
      pickup.coordinates,
      destination.coordinates,
      vehicleType
    );

    // Create ride in MongoDB
    const ride = await Ride.create({
      riderId: auth.userId,
      status: 'searching',
      pickup,
      destination,
      vehicleType,
      paymentMethod,
      estimatedFare: fareCalc.totalFare,
      distance: fareCalc.distance,
      duration: fareCalc.estimatedDuration,
      surgeMultiplier: fareCalc.surgeMultiplier,
    });

    const rideId = (ride._id as string).toString();

    // Create Firebase realtime node for live tracking
    await updateRideStatus(rideId, 'searching', {
      riderId: auth.userId,
      pickup: pickup.coordinates,
      destination: destination.coordinates,
      vehicleType,
    });

    // Find nearby online verified drivers of the requested vehicle type
    const nearbyDrivers = await Driver.find({
      isOnline: true,
      isVerified: true,
      isActive: true,
      isSuspended: false,
      vehicleType,
      'currentLocation.latitude': { $exists: true },
    }).limit(10);

    // Notify all nearby drivers
    const driverTokens = nearbyDrivers
      .filter((d) => d.fcmToken)
      .map((d) => d.fcmToken!);

    if (driverTokens.length > 0) {
      await Notify.rideRequest(
        driverTokens[0], // primary
        rideId,
        pickup.name,
        fareCalc.totalFare
      );

      // Notify remaining drivers
      for (let i = 1; i < driverTokens.length; i++) {
        await Notify.rideRequest(driverTokens[i], rideId, pickup.name, fareCalc.totalFare);
      }
    }

    return created(
      {
        rideId,
        estimatedFare: fareCalc.totalFare,
        distance: fareCalc.distance,
        duration: fareCalc.estimatedDuration,
        surgeMultiplier: fareCalc.surgeMultiplier,
        nearbyDriversCount: nearbyDrivers.length,
      },
      'Ride request bhej diya gaya'
    );
  } catch (err) {
    return serverError(err);
  }
}

// GET /api/rides — get rider's ride history
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const status = searchParams.get('status');

    // Temp tokens (unregistered drivers) have no rides — return early
    // to prevent a CastError when MongoDB tries to cast "temp_…" to ObjectId.
    if (auth.userId.startsWith('temp_')) {
      return ok({ rides: [], total: 0, page: 1, limit });
    }

    const query: Record<string, unknown> = {};

    if (auth.role === 'rider') {
      query.riderId = auth.userId;
    } else if (auth.role === 'driver') {
      query.driverId = auth.userId;
    }

    if (status) query.status = status;

    const [rides, total] = await Promise.all([
      Ride.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('riderId', 'firstName lastName phone avatarInitials rating')
        .populate('driverId', 'firstName lastName phone avatarInitials rating vehicleModel vehiclePlate'),
      Ride.countDocuments(query),
    ]);

    return ok({ rides, total, page, limit });
  } catch (err) {
    return serverError(err);
  }
}
