import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { User } from '@/models/User';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/response';

const updateSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  language: z.enum(['en', 'ur']).optional(),
  fcmToken: z.string().optional(),
  emergencyContacts: z
    .array(
      z.object({
        name: z.string().min(2),
        relationship: z.string().min(2),
        phone: z.string().min(10),
      })
    )
    .max(3)
    .optional(),
  savedPlaces: z
    .array(
      z.object({
        label: z.string().min(2),
        icon: z.string().min(1),
        address: z.string().min(2),
        coordinates: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
      })
    )
    .max(10)
    .optional(),
});

// GET /api/riders/:id
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

    if (auth.role === 'rider' && auth.userId !== id) {
      return unauthorized('Sirf apna profile dekh sakte hain');
    }

    const user = await User.findById(id).select('-fcmToken');
    if (!user) return notFound('Rider nahi mila');

    return ok(user);
  } catch (err) {
    return serverError(err);
  }
}

// PATCH /api/riders/:id
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

    if (auth.role === 'rider' && auth.userId !== id) {
      return unauthorized('Sirf apna profile update kar sakte hain');
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.firstName && parsed.data.lastName) {
      updates.avatarInitials =
        `${parsed.data.firstName[0]}${parsed.data.lastName[0]}`.toUpperCase();
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-fcmToken');
    if (!user) return notFound('Rider nahi mila');

    return ok(user, 'Profile update ho gaya');
  } catch (err) {
    return serverError(err);
  }
}
