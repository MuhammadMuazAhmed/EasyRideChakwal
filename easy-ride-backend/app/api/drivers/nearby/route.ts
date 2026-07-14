import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { calculateDistance } from '@/lib/fare';
import { Driver } from '@/models/Driver';
import { ok, badRequest, unauthorized, serverError } from '@/lib/response';
import type { NearbyDriver } from '@/types';

const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  vehicleType: z.enum(['car', 'bike', 'qingqi']).optional(),
  radiusKm: z.number().min(1).max(50).default(20),
});

// GET /api/drivers/nearby
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const parsed = schema.safeParse({
      latitude: parseFloat(searchParams.get('latitude') ?? ''),
      longitude: parseFloat(searchParams.get('longitude') ?? ''),
      vehicleType: searchParams.get('vehicleType') ?? undefined,
      radiusKm: parseFloat(searchParams.get('radiusKm') ?? '20'),
    });

    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const { latitude, longitude, vehicleType, radiusKm } = parsed.data;

    const query: Record<string, unknown> = {
      isOnline: true,
      isVerified: true,
      isActive: true,
      isSuspended: false,
      'currentLocation.latitude': { $exists: true },
      'currentLocation.longitude': { $exists: true },
    };

    if (vehicleType) query.vehicleType = vehicleType;

    const drivers = await Driver.find(query).select(
      'firstName lastName avatarInitials rating totalTrips vehicleType vehicleModel vehiclePlate vehicleColor currentLocation'
    );

    // Filter by radius and sort by distance
    const nearby: NearbyDriver[] = drivers
      .map((d) => {
        const driverCoords = {
          latitude: d.currentLocation!.latitude,
          longitude: d.currentLocation!.longitude,
        };
        const distanceKm = calculateDistance({ latitude, longitude }, driverCoords);
        const etaMinutes = Math.ceil((distanceKm / 25) * 60);

        return {
          id: (d._id as string).toString(),
          firstName: d.firstName,
          lastName: d.lastName,
          avatarInitials: d.avatarInitials,
          rating: d.rating,
          totalTrips: d.totalTrips,
          vehicleType: d.vehicleType,
          vehicleModel: d.vehicleModel,
          vehiclePlate: d.vehiclePlate,
          vehicleColor: d.vehicleColor,
          coordinates: driverCoords,
          distanceKm: Math.round(distanceKm * 10) / 10,
          etaMinutes,
        };
      })
      .filter((d) => d.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 10); // max 10 nearby drivers

    return ok({
      drivers: nearby,
      count: nearby.length,
      searchRadius: radiusKm,
    });
  } catch (err) {
    return serverError(err);
  }
}
