import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route gating.
//  - Demo build (NEXT_PUBLIC_DEMO_MODE=true): no gating — open for demos.
//  - IT build: require an Auth.js session; unauthenticated requests are sent to
//    /signin (SSO). This is an edge-safe presence check; fine-grained
//    authorization (role checks) happens in API routes via auth().
const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function middleware(req: NextRequest) {
  if (DEMO) return NextResponse.next();
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith('/signin') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/assets')
  ) {
    return NextResponse.next();
  }
  const hasSession =
    req.cookies.has('authjs.session-token') || req.cookies.has('__Secure-authjs.session-token');
  if (!hasSession) {
    return NextResponse.redirect(new URL('/signin', req.nextUrl.origin));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/).*)'],
};
