import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  phone: string;
  role: 'rider' | 'driver' | 'admin';
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '30d') as any,
  });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export function requireAuth(req: NextRequest): AuthPayload {
  const token = getTokenFromRequest(req);
  if (!token) throw new Error('No token provided');
  return verifyToken(token);
}

export function requireRole(
  req: NextRequest,
  role: 'rider' | 'driver' | 'admin'
): AuthPayload {
  const payload = requireAuth(req);
  if (payload.role !== role) {
    throw new Error(`Access denied. Required role: ${role}`);
  }
  return payload;
}

export function isTempToken(userId: string): boolean {
  return userId.startsWith('temp_');
}
