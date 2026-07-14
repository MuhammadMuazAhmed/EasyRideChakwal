import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { Ride } from '@/models/Ride';
import { Driver } from '@/models/Driver';
import { User } from '@/models/User';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/response';

const schema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(300).optional(),
  tags: z.array(z.string()).max(5).optional(),
});

// POST /api/rides/:id/rate
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
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const { rating, comment } = parsed.data;

    const ride = await Ride.findById(rideId);
    if (!ride) return notFound('Ride nahi mili');
    if (ride.status !== 'completed') return badRequest('Sirf completed ride rate ho sakti hai');

    const riderId = ride.riderId.toString();
    const driverId = ride.driverId?.toString();

    if (auth.role === 'rider') {
      if (riderId !== auth.userId) return unauthorized('Yeh aapki ride nahi');
      if (ride.riderRating) return badRequest('Aap pehle se rate kar chuke hain');

      ride.riderRating = rating;
      ride.riderComment = comment;
      await ride.save();

      // Recalculate driver average rating
      if (driverId) {
        const allRatings = await Ride.find({
          driverId,
          status: 'completed',
          riderRating: { $exists: true },
        }).select('riderRating');

        const avg =
          allRatings.reduce((sum, r) => sum + (r.riderRating ?? 0), 0) /
          allRatings.length;

        await Driver.findByIdAndUpdate(driverId, {
          rating: Math.round(avg * 10) / 10,
        });
      }

      return ok({ rating, role: 'rider' }, 'Rating de di gayi. Shukriya!');
    }

    if (auth.role === 'driver') {
      if (driverId !== auth.userId) return unauthorized('Yeh aapki ride nahi');
      if (ride.driverRating) return badRequest('Aap pehle se rate kar chuke hain');

      ride.driverRating = rating;
      ride.driverComment = comment;
      await ride.save();

      // Recalculate rider average rating
      const allRatings = await Ride.find({
        riderId,
        status: 'completed',
        driverRating: { $exists: true },
      }).select('driverRating');

      const avg =
        allRatings.reduce((sum, r) => sum + (r.driverRating ?? 0), 0) /
        allRatings.length;

      await User.findByIdAndUpdate(riderId, {
        rating: Math.round(avg * 10) / 10,
      });

      return ok({ rating, role: 'driver' }, 'Rating de di gayi. Shukriya!');
    }

    return badRequest('Invalid role');
  } catch (err) {
    return serverError(err);
  }
}
