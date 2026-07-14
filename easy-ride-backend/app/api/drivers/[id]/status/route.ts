import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth, isTempToken } from '@/lib/auth';
import { setDriverOnlineStatus } from '@/lib/realtime';
import { Driver } from '@/models/Driver';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/response';

const schema = z.object({
  isOnline: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// POST /api/drivers/:id/status
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

    if (auth.role !== 'driver') return unauthorized('Sirf driver status change kar sakta hai');

    if (isTempToken(auth.userId)) {
      return badRequest('Registration incomplete. Please complete your driver profile.');
    }

    const { id } = await params;
    if (auth.userId !== id) return unauthorized('Sirf apna status change kar sakte hain');

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const { isOnline, latitude, longitude } = parsed.data;

    const driver = await Driver.findById(id);
    if (!driver) return notFound('Driver nahi mila');
    if (!driver.isVerified) return badRequest('Account verify nahi hua. Pehle verify karwayein.');
    if (driver.isSuspended) return badRequest('Account suspend hai. Support se contact karein.');

    const updateData: Record<string, unknown> = { isOnline };
    if (isOnline && latitude && longitude) {
      updateData.currentLocation = { latitude, longitude, updatedAt: new Date() };
    } else if (!isOnline) {
      updateData.currentLocation = undefined;
    }

    await Driver.findByIdAndUpdate(id, updateData);
    await setDriverOnlineStatus(id, isOnline);

    return ok(
      { isOnline, driverId: id },
      isOnline ? 'Aap online hain. Rides aana shuru ho jaengi!' : 'Aap offline hain.'
    );
  } catch (err) {
    return serverError(err);
  }
}
