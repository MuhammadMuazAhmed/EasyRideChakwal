import { adminDB } from './firebase-admin';
import type { Coordinates } from '@/types';

// ── Driver location streaming ──────────────────────────────────

export async function updateDriverLocation(
  driverId: string,
  location: Coordinates
): Promise<void> {
  await adminDB.ref(`drivers/${driverId}/location`).set({
    ...location,
    updatedAt: Date.now(),
  });
}

export async function setDriverOnlineStatus(
  driverId: string,
  isOnline: boolean
): Promise<void> {
  await adminDB.ref(`drivers/${driverId}/isOnline`).set(isOnline);
  if (!isOnline) {
    await adminDB.ref(`drivers/${driverId}/location`).remove();
  }
}

// ── Ride status streaming ──────────────────────────────────────

export async function updateRideStatus(
  rideId: string,
  status: string,
  extra?: Record<string, unknown>
): Promise<void> {
  await adminDB.ref(`rides/${rideId}`).update({
    status,
    updatedAt: Date.now(),
    ...extra,
  });
}

export async function setRideDriver(
  rideId: string,
  driverId: string,
  driverInfo: {
    name: string;
    vehicleModel: string;
    vehiclePlate: string;
    rating: number;
    phone: string;
  }
): Promise<void> {
  await adminDB.ref(`rides/${rideId}`).update({
    status: 'driver_assigned',
    driverId,
    driver: driverInfo,
    updatedAt: Date.now(),
  });
}

export async function deleteRideRealtimeData(rideId: string): Promise<void> {
  await adminDB.ref(`rides/${rideId}`).remove();
}

// ── In-app chat ────────────────────────────────────────────────

export async function sendChatMessage(
  rideId: string,
  senderId: string,
  senderRole: 'rider' | 'driver',
  text: string
): Promise<void> {
  await adminDB.ref(`chats/${rideId}/messages`).push({
    senderId,
    senderRole,
    text,
    timestamp: Date.now(),
    read: false,
  });
}

export async function markMessagesRead(
  rideId: string,
  readerRole: 'rider' | 'driver'
): Promise<void> {
  const ref = adminDB.ref(`chats/${rideId}/messages`);
  const snap = await ref.once('value');
  const updates: Record<string, boolean> = {};

  snap.forEach((child) => {
    const msg = child.val();
    if (msg.senderRole !== readerRole && !msg.read) {
      updates[`${child.key}/read`] = true;
    }
  });

  if (Object.keys(updates).length) {
    await ref.update(updates);
  }
}

export async function deleteChat(rideId: string): Promise<void> {
  await adminDB.ref(`chats/${rideId}`).remove();
}

// ── SOS alerts ────────────────────────────────────────────────

export async function triggerSOS(
  rideId: string,
  riderId: string,
  location: Coordinates
): Promise<void> {
  await adminDB.ref(`sos/${rideId}`).set({
    rideId,
    riderId,
    location,
    triggeredAt: Date.now(),
    resolved: false,
  });
}

export async function resolveSOS(rideId: string): Promise<void> {
  await adminDB.ref(`sos/${rideId}/resolved`).set(true);
}
