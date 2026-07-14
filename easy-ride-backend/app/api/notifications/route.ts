import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { sendPush, sendMultiPush } from '@/lib/fcm';
import { User } from '@/models/User';
import { Driver } from '@/models/Driver';
import { ok, badRequest, unauthorized, serverError } from '@/lib/response';

const schema = z.object({
  target: z.enum(['all_riders', 'all_drivers', 'everyone', 'specific']),
  userId: z.string().optional(), // for specific target
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
  data: z.record(z.string()).optional(),
});

// POST /api/notifications — admin sends push notifications
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }

    if (auth.role !== 'admin') return unauthorized('Sirf admin notifications bhej sakta hai');

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const { target, userId, title, body: msgBody, data } = parsed.data;

    let sentCount = 0;

    switch (target) {
      case 'specific': {
        if (!userId) return badRequest('userId required for specific target');
        const user = await User.findById(userId).select('fcmToken');
        const driver = await Driver.findById(userId).select('fcmToken');
        const token = user?.fcmToken ?? driver?.fcmToken;
        if (token) {
          await sendPush({ token, title, body: msgBody, data });
          sentCount = 1;
        }
        break;
      }

      case 'all_riders': {
        const riders = await User.find({ isActive: true, fcmToken: { $exists: true } }).select('fcmToken');
        const tokens = riders.map((r) => r.fcmToken!).filter(Boolean);
        await sendMultiPush(tokens, title, msgBody, data);
        sentCount = tokens.length;
        break;
      }

      case 'all_drivers': {
        const drivers = await Driver.find({ isActive: true, fcmToken: { $exists: true } }).select('fcmToken');
        const tokens = drivers.map((d) => d.fcmToken!).filter(Boolean);
        await sendMultiPush(tokens, title, msgBody, data);
        sentCount = tokens.length;
        break;
      }

      case 'everyone': {
        const [riders, drivers] = await Promise.all([
          User.find({ isActive: true, fcmToken: { $exists: true } }).select('fcmToken'),
          Driver.find({ isActive: true, fcmToken: { $exists: true } }).select('fcmToken'),
        ]);
        const tokens = [
          ...riders.map((r) => r.fcmToken!),
          ...drivers.map((d) => d.fcmToken!),
        ].filter(Boolean);
        await sendMultiPush(tokens, title, msgBody, data);
        sentCount = tokens.length;
        break;
      }
    }

    return ok({ sentCount, target }, `${sentCount} users ko notification bhej di`);
  } catch (err) {
    return serverError(err);
  }
}
