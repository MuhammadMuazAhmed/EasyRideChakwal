import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { triggerSOS, resolveSOS } from '@/lib/realtime';
import { ok, badRequest, unauthorized, serverError } from '@/lib/response';

const triggerSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

// POST /api/rides/:id/sos — rider triggers SOS
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }

    const { id: rideId } = await params;
    const body = await req.json();
    const parsed = triggerSchema.safeParse(body);

    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    await triggerSOS(rideId, auth.userId, {
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    });

    return ok({ triggered: true, rideId }, 'SOS bhej diya gaya. Help aa rahi hai!');
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/rides/:id/sos — admin or rider resolves SOS
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }

    const { id: rideId } = await params;
    await resolveSOS(rideId);

    return ok({ resolved: true }, 'SOS resolve ho gaya');
  } catch (err) {
    return serverError(err);
  }
}
