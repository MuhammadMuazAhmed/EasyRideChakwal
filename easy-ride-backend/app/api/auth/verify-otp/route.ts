import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { signToken } from '@/lib/auth';
import { formatPakistanPhone } from '@/lib/otp';
import { OTP } from '@/models/OTP';
import { User } from '@/models/User';
import { Driver } from '@/models/Driver';
import { ok, badRequest, serverError } from '@/lib/response';

const schema = z.object({
  phone: z.string().min(10).max(13),
  otp: z.string().length(6, 'OTP 6 digits ka hona chahiye'),
  role: z.enum(['rider', 'driver']).default('rider'),
  // Optional profile for first-time signup
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  fcmToken: z.string().optional(),
});

function generateReferralCode(phone: string): string {
  const suffix = phone.slice(-4);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ER${random}${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.errors[0].message);
    }

    const { phone, otp, role, firstName, lastName, fcmToken } = parsed.data;
    const normalizedPhone = formatPakistanPhone(phone);

    // Find valid OTP
    const otpDoc = await OTP.findOne({
      phone: normalizedPhone,
      role,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return badRequest('OTP expire ho gaya ya galat hai. Dobara bhejein.');
    }

    // Track wrong attempts
    if (otpDoc.code !== otp) {
      otpDoc.attempts += 1;
      if (otpDoc.attempts >= 5) {
        otpDoc.isUsed = true; // lock after 5 wrong tries
      }
      await otpDoc.save();
      return badRequest(`Galat OTP. ${5 - otpDoc.attempts} koshishein bachi hain.`);
    }

    // Mark OTP as used
    otpDoc.isUsed = true;
    await otpDoc.save();

    let userId: string;
    let isNewUser = false;

    if (role === 'rider') {
      let user = await User.findOne({ phone: normalizedPhone });

      if (!user) {
        isNewUser = true;
        const fName = firstName?.trim() || 'Rider';
        const lName = lastName?.trim() || '';
        const initials = lName
          ? `${fName[0]}${lName[0]}`.toUpperCase()
          : fName[0].toUpperCase();
        user = await User.create({
          phone: normalizedPhone,
          firstName: fName,
          lastName: lName,
          avatarInitials: initials,
          referralCode: generateReferralCode(normalizedPhone),
          fcmToken,
        });
      } else if (fcmToken) {
        user.fcmToken = fcmToken;
        await user.save();
      }

      userId = (user._id as string).toString();
    } else {
      // Driver login
      let driver = await Driver.findOne({ phone: normalizedPhone });

      if (!driver) {
        // Driver does not exist yet — they need to complete registration
        // Return a temporary token with limited scope
        const tempToken = signToken({
          userId: `temp_${normalizedPhone}`,
          phone: normalizedPhone,
          role: 'driver',
        });

        return ok(
          {
            token: tempToken,
            isNewDriver: true,
            needsRegistration: true,
            phone: normalizedPhone,
          },
          'Phone verify ho gaya. Profile complete karein.'
        );
      }

      if (fcmToken) {
        driver.fcmToken = fcmToken;
        await driver.save();
      }

      userId = (driver._id as string).toString();
    }

    const token = signToken({ userId, phone: normalizedPhone, role });

    return ok(
      { token, isNewUser, role },
      'Login successful'
    );
  } catch (err) {
    return serverError(err);
  }
}
