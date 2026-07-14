import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const secret = formData.get('secret') as string;

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.redirect(new URL('/admin/login?error=1', req.url));
  }

  const response = NextResponse.redirect(new URL('/admin', req.url));
  response.cookies.set('admin_secret', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}
