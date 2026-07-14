import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Notify } from '@/lib/fcm';
import { Driver } from '@/models/Driver';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify admin cookie
  const adminSecret = req.cookies.get('admin_secret')?.value;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  await connectDB();
  const formData = await req.formData();
  const action = formData.get('action') as string;
  const reason = formData.get('reason') as string | undefined;

  const driver = await Driver.findById(id);
  if (!driver) {
    return NextResponse.redirect(new URL('/admin/verify', req.url));
  }

  switch (action) {
    case 'approve':
      driver.isVerified = true;
      driver.isSuspended = false;
      await driver.save();
      if (driver.fcmToken) await Notify.accountVerified(driver.fcmToken);
      break;

    case 'reject':
      driver.isVerified = false;
      driver.isActive = false;
      await driver.save();
      break;

    case 'suspend':
      driver.isSuspended = true;
      driver.isOnline = false;
      driver.suspensionReason = reason ?? 'Policy violation';
      await driver.save();
      if (driver.fcmToken) {
        await Notify.accountSuspended(driver.fcmToken, driver.suspensionReason);
      }
      break;

    case 'unsuspend':
      driver.isSuspended = false;
      driver.suspensionReason = undefined;
      await driver.save();
      if (driver.fcmToken) await Notify.accountVerified(driver.fcmToken);
      break;
  }

  return NextResponse.redirect(new URL('/admin/drivers', req.url));
}
