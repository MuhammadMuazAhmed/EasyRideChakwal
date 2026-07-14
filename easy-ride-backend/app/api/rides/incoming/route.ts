import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { Ride } from '@/models/Ride';
import { Driver } from '@/models/Driver';
import { ok, unauthorized, serverError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = requireAuth(req);

    if (auth.role !== 'driver') {
      return unauthorized('Only drivers can fetch incoming requests');
    }

    const driver = await Driver.findById(auth.userId);
    if (!driver || !driver.isOnline) {
      return ok([], 'Driver offline or profile not found');
    }

    const rides = await Ride.find({
      status: 'searching',
      vehicleType: driver.vehicleType,
    })
      .sort({ createdAt: -1 })
      .populate('riderId', 'firstName lastName phone avatarInitials rating');

    return ok(rides);
  } catch (err) {
    return serverError(err);
  }
}
