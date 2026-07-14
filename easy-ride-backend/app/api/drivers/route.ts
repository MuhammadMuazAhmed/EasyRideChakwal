import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { requireAuth, signToken } from '@/lib/auth';
import { formatPakistanPhone } from '@/lib/otp';
import { Driver } from '@/models/Driver';
import { ok, created, badRequest, unauthorized, serverError } from '@/lib/response';

const registerSchema = z.object({
  phone: z.string().min(10).max(15),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  vehicleType: z.enum(['car', 'bike', 'qingqi']),
  vehicleModel: z.string().min(2).max(100),
  vehiclePlate: z.string().min(4).max(15),
  vehicleColor: z.string().min(2).max(50),
  vehicleYear: z.number().min(2000).max(new Date().getFullYear() + 1),
  cnicNumber: z
    .string()
    .regex(/^\d{5}-\d{7}-\d$/, 'CNIC format galat hai (XXXXX-XXXXXXX-X)'),
  licenseNumber: z.string().min(5).max(30),
  licenseExpiry: z.string().datetime().or(z.string().date()),
  fcmToken: z.string().optional(),
  documents: z.object({
    selfie: z.string().optional(),
    cnicFront: z.string().optional(),
    cnicBack: z.string().optional(),
    license: z.string().optional(),
    vehicleReg: z.string().optional(),
    policeClearance: z.string().optional(),
  }).optional(),
});

// POST /api/drivers — register new driver
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    // Normalize phone before validation so all Pakistani formats pass
    if (body.phone) body.phone = formatPakistanPhone(body.phone);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      const field = firstError.path.join('.');
      return badRequest(`[${field}] ${firstError.message}`);
    }

    const {
      phone,
      firstName,
      lastName,
      vehicleType,
      vehicleModel,
      vehiclePlate,
      vehicleColor,
      vehicleYear,
      cnicNumber,
      licenseNumber,
      licenseExpiry,
      fcmToken,
      documents,
    } = parsed.data;

    // Check for duplicates
    const [existingPhone, existingCnic, existingPlate] = await Promise.all([
      Driver.findOne({ phone }),
      Driver.findOne({ cnicNumber }),
      Driver.findOne({ vehiclePlate: vehiclePlate.toUpperCase() }),
    ]);

    if (existingPhone) return badRequest('Is phone number par pehle se account hai');
    if (existingCnic) return badRequest('Is CNIC par pehle se account register hai');
    if (existingPlate) return badRequest('Is vehicle plate par pehle se account hai');

    const driver = await Driver.create({
      phone,
      firstName,
      lastName,
      avatarInitials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
      vehicleType,
      vehicleModel,
      vehiclePlate: vehiclePlate.toUpperCase(),
      vehicleColor,
      vehicleYear,
      cnicNumber,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
      fcmToken,
      isVerified: false,
      documents,
    });

    const token = signToken({
      userId: (driver._id as string).toString(),
      phone: driver.phone,
      role: 'driver',
    });

    return created(
      {
        driverId: driver._id,
        token,
        status: 'pending_verification',
        message: 'Documents submit karein verification ke liye',
      },
      'Account bana diya gaya. Admin verification mein 24-48 ghante lagenge.'
    );
  } catch (err) {
    return serverError(err);
  }
}

// GET /api/drivers — admin gets all drivers list
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }

    if (auth.role !== 'admin') return unauthorized('Sirf admin dekh sakta hai');

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const status = searchParams.get('status'); // verified, pending, suspended
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};

    if (status === 'verified') query.isVerified = true;
    if (status === 'pending') query.isVerified = false;
    if (status === 'suspended') query.isSuspended = true;
    if (status === 'online') query.isOnline = true;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { vehiclePlate: { $regex: search, $options: 'i' } },
      ];
    }

    const [drivers, total] = await Promise.all([
      Driver.find(query)
        .select('-fcmToken -documents')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Driver.countDocuments(query),
    ]);

    return ok({ drivers, total, page, limit });
  } catch (err) {
    return serverError(err);
  }
}
