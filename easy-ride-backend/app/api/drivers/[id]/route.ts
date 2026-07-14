import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth, isTempToken } from '@/lib/auth';
import { Driver } from '@/models/Driver';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/response';

const updateSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  vehicleModel: z.string().min(2).max(100).optional(),
  vehicleColor: z.string().min(2).max(50).optional(),
  fcmToken: z.string().optional(),
  language: z.enum(['en', 'ur']).optional(),
});

// GET /api/drivers/:id
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

    if (isTempToken(auth.userId)) {
      return badRequest('Registration incomplete. Please complete your driver profile.');
    }

    // Driver can only see their own profile; admin can see all
    if (auth.role === 'driver' && auth.userId !== id) {
      return unauthorized('Sirf apna profile dekh sakte hain');
    }

    const driver = await Driver.findById(id).select(
      auth.role === 'admin' ? '' : '-fcmToken'
    );

    if (!driver) return notFound('Driver nahi mila');

    return ok(driver);
  } catch (err) {
    return serverError(err);
  }
}

// PATCH /api/drivers/:id
export async function PATCH(
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

    if (isTempToken(auth.userId)) {
      return badRequest('Registration incomplete. Please complete your driver profile.');
    }

    if (auth.role === 'driver' && auth.userId !== id) {
      return unauthorized('Sirf apna profile update kar sakte hain');
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const updates = parsed.data;
    if (updates.firstName && updates.lastName) {
      Object.assign(updates, {
        avatarInitials: `${updates.firstName[0]}${updates.lastName[0]}`.toUpperCase(),
      });
    }

    const driver = await Driver.findByIdAndUpdate(id, updates, { new: true }).select('-fcmToken');
    if (!driver) return notFound('Driver nahi mila');

    return ok(driver, 'Profile update ho gaya');
  } catch (err) {
    return serverError(err);
  }
}
