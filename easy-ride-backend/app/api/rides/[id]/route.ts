import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { Ride } from '@/models/Ride';
import { ok, unauthorized, notFound, serverError } from '@/lib/response';

export async function GET(
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

    const { id } = await params;

    const ride = await Ride.findById(id)
      .populate('riderId', 'firstName lastName phone avatarInitials rating')
      .populate(
        'driverId',
        'firstName lastName phone avatarInitials rating vehicleModel vehiclePlate vehicleColor'
      );

    if (!ride) return notFound('Ride nahi mili');

    // Ensure the requester is part of this ride
    const riderId = ride.riderId._id.toString();
    const driverId = ride.driverId?._id?.toString();

    const isAuthorized =
      auth.role === 'admin' ||
      riderId === auth.userId ||
      driverId === auth.userId;

    if (!isAuthorized) return unauthorized('Is ride tak access nahi hai');

    return ok(ride);
  } catch (err) {
    return serverError(err);
  }
}
