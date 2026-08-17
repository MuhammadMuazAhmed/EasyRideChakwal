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
  '/api/admin/auth/login', // SPA admin login — issues Bearer token, must not require one
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Define CORS headers dynamically based on request origin
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, x-user-id, x-user-role, x-user-phone',
    'Access-Control-Max-Age': '86400',
  };

  if (origin) {
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  }

  // Intercept CORS preflight OPTIONS request early
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Helper to attach CORS headers to any outgoing response
  const withCors = (res: NextResponse) => {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.headers.set(key, value);
    });
    return res;
  };

  const { pathname } = request.nextUrl;

  // Allow public auth routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return withCors(NextResponse.next());
  }

  // Admin routes — check admin secret cookie
  if (pathname.startsWith('/admin')) {
    const secret = request.cookies.get('admin_secret')?.value;
    if (secret !== process.env.ADMIN_SECRET) {
      // API calls from admin panel get 401
      if (pathname.startsWith('/api/admin')) {
        return withCors(
          NextResponse.json(
            { success: false, message: 'Admin access required' },
            { status: 401 }
          )
        );
      }
      // Browser visits get redirected to login
      return withCors(NextResponse.redirect(new URL('/admin/login', request.url)));
    }
    return withCors(NextResponse.next());
  }

  // All other /api routes require Bearer token
  if (pathname.startsWith('/api')) {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return withCors(
        NextResponse.json(
          { success: false, message: 'Authorization header missing' },
          { status: 401 }
        )
      );
    }

    try {
      const payload = decodeTokenSimple(auth.slice(7));
      // Forward user info to route handlers via headers
      const headers = new Headers(request.headers);
      headers.set('x-user-id', payload.userId);
      headers.set('x-user-role', payload.role);
      headers.set('x-user-phone', payload.phone);
      return withCors(NextResponse.next({ request: { headers } }));
    } catch (err: any) {
      console.error('Middleware token decode failed:', err.message || err);
      return withCors(
        NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        )
      );
    }
  }

  return withCors(NextResponse.next());
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};

