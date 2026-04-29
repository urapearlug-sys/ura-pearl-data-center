/**
 * Admin: redirect to /admin/login when accessing /admin (or subroutes) without admin_session cookie.
 * Sets x-pathname so admin layout can allow the login page when unauthenticated.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SESSION_COOKIE = 'admin_session';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Pass pathname to server for layout (e.g. to allow /admin/login when not authorized)
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname === '/admin/login') {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Notifications panel is public (no admin password required)
  if (pathname === '/admin/notifications' || pathname.startsWith('/admin/notifications/')) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const hasSession = req.cookies.has(ADMIN_SESSION_COOKIE);
  if (!hasSession) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
