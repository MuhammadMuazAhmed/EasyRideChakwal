import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { Notify } from '@/lib/fcm';
import { Driver } from '@/models/Driver';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/response';

const verifySchema = z.object({
  action: z.enum(['approve', 'reject', 'suspend', 'unsuspend']),
  reason: z.string().max(200).optional(),
});

// POST /api/drivers/:id/verify — admin approves or rejects driver
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const isDev = process.env.NODE_ENV === 'development';
    let auth;

    if (!isDev) {
      try {
        auth = requireAuth(req);
      } catch {
        return unauthorized();
      }

      if (auth.role !== 'admin') {
        return unauthorized('Sirf admin verify kar sakta hai');
      }
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const { action, reason } = parsed.data;
    const driver = await Driver.findById(id);
    if (!driver) return notFound('Driver nahi mila');

    let updateData: Record<string, unknown> = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData = { isVerified: true, isSuspended: false };
        message = 'Driver verify aur activate kar diya gaya';
        if (driver.fcmToken) {
          await Notify.accountVerified(driver.fcmToken);
        }
        break;

      case 'reject':
        updateData = { isVerified: false, isActive: false };
        message = 'Driver reject kar diya gaya';
        break;

      case 'suspend':
        if (!reason) return badRequest('Suspension ki wajah batayein');
        updateData = { isSuspended: true, isOnline: false, suspensionReason: reason };
        message = 'Driver suspend kar diya gaya';
        if (driver.fcmToken) {
          await Notify.accountSuspended(driver.fcmToken, reason);
        }
        break;

      case 'unsuspend':
        updateData = { isSuspended: false, suspensionReason: undefined };
        message = 'Driver unsuspend kar diya gaya';
        if (driver.fcmToken) {
          await Notify.accountVerified(driver.fcmToken);
        }
        break;
    }

    const updated = await Driver.findByIdAndUpdate(id, updateData, { new: true }).select('-fcmToken');

    return ok(updated, message);
  } catch (err) {
    return serverError(err);
  }
}
