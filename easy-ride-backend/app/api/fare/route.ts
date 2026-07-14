import { NextRequest } from 'next/server';
import { z } from 'zod';
import { calculateFare } from '@/lib/fare';
import { ok, badRequest, serverError } from '@/lib/response';

const schema = z.object({
  pickup: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  destination: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  vehicleType: z.enum(['car', 'bike', 'qingqi']).optional(),
  surgeMultiplier: z.number().min(1).max(3).optional(),
});

// POST /api/fare — calculate fare for all vehicle types
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const { pickup, destination, vehicleType, surgeMultiplier = 1.0 } = parsed.data;

    // If vehicleType specified, return single calc
    if (vehicleType) {
      const fare = calculateFare(pickup, destination, vehicleType, surgeMultiplier);
      return ok(fare);
    }

    // Return all three vehicle types for comparison
    const [car, bike, qingqi] = await Promise.all([
      calculateFare(pickup, destination, 'car', surgeMultiplier),
      calculateFare(pickup, destination, 'bike', surgeMultiplier),
      calculateFare(pickup, destination, 'qingqi', surgeMultiplier),
    ]);

    return ok({
      car,
      bike,
      qingqi,
      surgeMultiplier,
      isRushHour: surgeMultiplier > 1,
    });
  } catch (err) {
    return serverError(err);
  }
}
