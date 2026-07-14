import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      status: 'ok',
      service: 'Easy Ride Chakwal API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      db: 'connected',
      endpoints: {
        auth: [
          'POST /api/auth/send-otp',
          'POST /api/auth/verify-otp',
        ],
        rides: [
          'GET  /api/rides',
          'POST /api/rides',
          'GET  /api/rides/:id',
          'POST /api/rides/:id/accept',
          'POST /api/rides/:id/start',
          'POST /api/rides/:id/complete',
          'POST /api/rides/:id/cancel',
          'POST /api/rides/:id/rate',
          'GET  /api/rides/:id/chat',
          'POST /api/rides/:id/chat',
          'POST /api/rides/:id/sos',
          'DELETE /api/rides/:id/sos',
        ],
        drivers: [
          'GET  /api/drivers',
          'POST /api/drivers',
          'GET  /api/drivers/:id',
          'PATCH /api/drivers/:id',
          'POST /api/drivers/:id/verify',
          'POST /api/drivers/:id/location',
          'POST /api/drivers/:id/status',
          'GET  /api/drivers/:id/nearby',
        ],
        riders: [
          'GET  /api/riders/:id',
          'PATCH /api/riders/:id',
        ],
        fare: [
          'POST /api/fare',
        ],
        notifications: [
          'POST /api/notifications',
        ],
      },
    });
  } catch {
    return NextResponse.json({ status: 'error', db: 'disconnected' }, { status: 500 });
  }
}
