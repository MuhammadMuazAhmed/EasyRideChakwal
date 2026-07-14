import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth, isTempToken } from '@/lib/auth';
import { updateDriverLocation } from '@/lib/realtime';
import { Driver } from '@/models/Driver';
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

    return ok({ latitude, longitude }, 'Location update ho gayi');
  } catch (err) {
    return serverError(err);
  }
}
