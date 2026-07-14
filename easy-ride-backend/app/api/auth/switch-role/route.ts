import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth, signToken } from '@/lib/auth';
import { User } from '@/models/User';
import { Driver } from '@/models/Driver';
import { ok, badRequest, serverError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = requireAuth(req);
    const body = await req.json();
    const { role } = body;

    if (!role || (role !== 'rider' && role !== 'driver')) {
      return badRequest('Invalid role. Role must be rider or driver.');
    }

    const phone = auth.phone;

    if (role === 'rider') {
      let user = await User.findOne({ phone });
      if (!user) {
        const initials = 'R';
        user = await User.create({
          phone,
          firstName: 'Rider',
          lastName: '',
          avatarInitials: initials,
          referralCode: `ER${Math.random().toString(36).substring(2, 5).toUpperCase()}${phone.slice(-4)}`,
        });
      }
      const token = signToken({ userId: (user._id as string).toString(), phone, role });
      return ok({ token, role });
    } else {
      const driver = await Driver.findOne({ phone });
      if (!driver) {
        return ok(
          { needsRegistration: true, role },
          'Driver profile not found. Please register.'
        );
      }
      const token = signToken({ userId: (driver._id as string).toString(), phone, role });
      return ok({ token, role });
    }
  } catch (err) {
    return serverError(err);
  }
}
