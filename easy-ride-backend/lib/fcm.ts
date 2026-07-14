import { adminMessaging } from './firebase-admin';

interface PushPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPush({
  token,
  title,
  body,
  data,
}: PushPayload): Promise<void> {
  try {
    await adminMessaging.send({
      token,
      notification: { title, body },
      data,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'easy_ride_channel',
          color: '#F5C400',
        },
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1 },
        },
      },
    });
  } catch (err) {
    // Log but never throw — FCM failure should not break ride flow
    console.error('[FCM] Push failed:', err);
  }
}

// Send to multiple drivers (nearby driver broadcast)
export async function sendMultiPush(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  if (!tokens.length) return;
  const sends = tokens.map((token) => sendPush({ token, title, body, data }));
  await Promise.allSettled(sends);
}

// ── Pre-built notification templates ──────────────────────────

export const Notify = {
  // To driver — new ride request
  rideRequest: (
    driverToken: string,
    rideId: string,
    pickup: string,
    fare: number
  ) =>
    sendPush({
      token: driverToken,
      title: 'Naya Ride Request! 🚗',
      body: `Pickup: ${pickup} • PKR ${fare}`,
      data: { type: 'ride_request', rideId },
    }),

  // To rider — driver accepted
  driverAccepted: (
    riderToken: string,
    driverName: string,
    vehicleModel: string,
    plate: string,
    eta: number
  ) =>
    sendPush({
      token: riderToken,
      title: `${driverName} Aa Raha Hai! ✅`,
      body: `${vehicleModel} • ${plate} • ${eta} min mein`,
      data: { type: 'driver_accepted' },
    }),

  // To rider — driver arrived at pickup
  driverArrived: (riderToken: string, driverName: string) =>
    sendPush({
      token: riderToken,
      title: 'Driver Aa Gaya! 📍',
      body: `${driverName} aapka intezar kar raha hai`,
      data: { type: 'driver_arrived' },
    }),

  // To rider — trip started
  tripStarted: (riderToken: string) =>
    sendPush({
      token: riderToken,
      title: 'Safar Shuru! 🚀',
      body: 'Aapki ride start ho gayi hai. Safe journey!',
      data: { type: 'trip_started' },
    }),

  // To both — trip completed
  tripCompleted: (riderToken: string, fare: number) =>
    sendPush({
      token: riderToken,
      title: 'Trip Mukammal! ✅',
      body: `Total fare: PKR ${fare}. Ride rate karein!`,
      data: { type: 'trip_completed' },
    }),

  // To rider — no driver found
  noDriverFound: (riderToken: string) =>
    sendPush({
      token: riderToken,
      title: 'Driver Nahi Mila 😔',
      body: 'Aapke area mein abhi koi driver available nahi. Thodi der baad try karein.',
      data: { type: 'no_driver' },
    }),

  // To driver — ride cancelled by rider
  rideCancelled: (driverToken: string) =>
    sendPush({
      token: driverToken,
      title: 'Ride Cancel Ho Gayi ❌',
      body: 'Rider ne ride cancel kar di. Agle ride ka intezar karein.',
      data: { type: 'ride_cancelled' },
    }),

  // To driver — account verified
  accountVerified: (driverToken: string) =>
    sendPush({
      token: driverToken,
      title: 'Account Verify Ho Gaya! 🎉',
      body: 'Mubarak! Ab aap Easy Ride Chakwal par rides de sakte hain.',
      data: { type: 'account_verified' },
    }),

  // To driver — account suspended
  accountSuspended: (driverToken: string, reason: string) =>
    sendPush({
      token: driverToken,
      title: 'Account Suspend Kar Diya Gaya',
      body: `Wajah: ${reason}. Support se rabta karein.`,
      data: { type: 'account_suspended' },
    }),

  // Broadcast promo to all riders
  promoAlert: (tokens: string[], code: string, discount: string) =>
    sendMultiPush(
      tokens,
      `Special Offer! 🎁 ${discount} Off`,
      `Code use karein: ${code}`,
      { type: 'promo', code }
    ),
};
