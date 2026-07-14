import { NextResponse } from 'next/server';

export function ok<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function created<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, message }, { status: 201 });
}

export function badRequest(message: string) {
  return NextResponse.json(
    { success: false, message },
    { status: 400 }
  );
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json(
    { success: false, message },
    { status: 401 }
  );
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json(
    { success: false, message },
    { status: 403 }
  );
}

export function notFound(message = 'Not found') {
  return NextResponse.json(
    { success: false, message },
    { status: 404 }
  );
}

export function serverError(err: unknown) {
  const message =
    err instanceof Error ? err.message : 'Internal server error';
  console.error('[API Error]', err);
  return NextResponse.json(
    { success: false, message },
    { status: 500 }
  );
}
