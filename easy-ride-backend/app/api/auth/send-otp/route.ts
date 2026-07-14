import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { generateOTP, getOTPExpiry, sendOTP, formatPakistanPhone } from '@/lib/otp';
import { OTP } from '@/models/OTP';
import { ok, badRequest, serverError } from '@/lib/response';

const schema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number too short')
    .max(13, 'Phone number too long')
    .regex(/^(\+92|0)?3\d{9}$/, 'Invalid Pakistan mobile number'),
  role: z.enum(['rider', 'driver']).default('rider'),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.errors[0].message);
    }

    const { phone, role } = parsed.data;
    const normalizedPhone = formatPakistanPhone(phone);

    // Rate limit — max 3 OTPs per phone per 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCount = await OTP.countDocuments({
      phone: normalizedPhone,
      createdAt: { $gte: tenMinutesAgo },
    });

    if (recentCount >= 3) {
      return badRequest('Bohot zyada requests. 10 minute baad try karein.');
    }

    // Invalidate all previous unused OTPs for this phone
    await OTP.updateMany(
      { phone: normalizedPhone, isUsed: false },
      { isUsed: true }
    );

    const code = generateOTP();
    const expiresAt = getOTPExpiry();

    // Send SMS first — if Twilio fails we don't save the record so
    // the rate-limit slot is not wasted on a delivery failure.
    await sendOTP(normalizedPhone, code);

    await OTP.create({ phone: normalizedPhone, code, role, expiresAt });

    return ok(
      { phone: normalizedPhone },
      'OTP bhej diya gaya hai'
    );
  } catch (err) {
    return serverError(err);
  }
}
