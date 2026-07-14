import { NextRequest, NextResponse } from 'next/server';

interface DecodedToken {
  userId: string;
  phone: string;
  role: string;
  exp?: number;
}

function decodeTokenSimple(token: string): DecodedToken {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  const payloadB64 = parts[1];
  let base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const jsonStr = atob(base64);
  const payload = JSON.parse(jsonStr) as DecodedToken;

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new Error('Token expired');
  }

  return payload;
}

const PUBLIC_ROUTES = [
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
  '/api/health',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Admin routes — check admin secret cookie
  if (pathname.startsWith('/admin')) {
    const secret = request.cookies.get('admin_secret')?.value;
    if (secret !== process.env.ADMIN_SECRET) {
      // API calls from admin panel get 401
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { success: false, message: 'Admin access required' },
          { status: 401 }
        );
      }
      // Browser visits get redirected to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // All other /api routes require Bearer token
  if (pathname.startsWith('/api')) {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { status: 401 }
      );
    }

    try {
      const payload = decodeTokenSimple(auth.slice(7));
      // Forward user info to route handlers via headers
      const headers = new Headers(request.headers);
      headers.set('x-user-id', payload.userId);
      headers.set('x-user-role', payload.role);
      headers.set('x-user-phone', payload.phone);
      return NextResponse.next({ request: { headers } });
    } catch (err: any) {
      console.error('Middleware token decode failed:', err.message || err);
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
