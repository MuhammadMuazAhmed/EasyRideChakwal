import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { sendChatMessage, markMessagesRead } from '@/lib/realtime';
import { adminDB } from '@/lib/firebase-admin';
import { ok, badRequest, unauthorized, serverError } from '@/lib/response';

const sendSchema = z.object({
  text: z.string().min(1).max(300).trim(),
});

// POST /api/rides/:id/chat — send a message
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

    if (auth.role !== 'rider' && auth.role !== 'driver') {
      return unauthorized('Sirf rider ya driver chat kar sakte hain');
    }

    const { id: rideId } = await params;
    const body = await req.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    await sendChatMessage(rideId, auth.userId, auth.role, parsed.data.text);

    return ok({ sent: true }, 'Message bhej diya');
  } catch (err) {
    return serverError(err);
  }
}

// GET /api/rides/:id/chat — get all messages and mark as read
export async function GET(
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

    const snap = await adminDB.ref(`chats/${rideId}/messages`).once('value');
    const raw = snap.val() as Record<string, { senderId: string; senderRole: string; text: string; timestamp: number; read: boolean }> | null;

    const messages = raw
      ? Object.entries(raw).map(([key, val]) => ({ id: key, ...val }))
        .sort((a, b) => a.timestamp - b.timestamp)
      : [];

    // Mark messages from other party as read
    if (auth.role === 'rider' || auth.role === 'driver') {
      await markMessagesRead(rideId, auth.role);
    }

    return ok({ messages, count: messages.length });
  } catch (err) {
    return serverError(err);
  }
}
