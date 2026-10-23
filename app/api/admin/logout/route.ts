/**
 * POST /api/admin/logout - clear admin session cookie
 */

import { NextResponse } from 'next/server';
import { ADMIN_ITEM_COOKIE_NAME, ADMIN_SESSION_COOKIE_NAME } from '@/utils/admin-session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
  res.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', cookieOpts);
  res.cookies.set(ADMIN_ITEM_COOKIE_NAME, '', cookieOpts);
  return res;
}
