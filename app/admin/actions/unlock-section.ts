'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_ITEM_COOKIE_NAME,
  ADMIN_SESSION_COOKIE_NAME,
  createAdminItemSessionToken,
  verifyAdminSessionToken,
} from '@/utils/admin-session';
import { isAdminItemProtectedPath } from '@/utils/admin-item-paths';

export type UnlockSectionState = { error?: string } | null;

async function hasAdminAccess(cookieStore: Awaited<ReturnType<typeof cookies>>): Promise<boolean> {
  const session = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (verifyAdminSessionToken(session)) return true;
  const host = (await headers()).get('host') ?? '';
  const isLocalhost = host.includes('localhost');
  return isLocalhost && process.env.ACCESS_ADMIN === 'true';
}

export async function unlockAdminSectionAction(
  _prev: UnlockSectionState,
  formData: FormData,
): Promise<UnlockSectionState> {
  const password = String(formData.get('password') ?? '').trim();
  const pathname = String(formData.get('pathname') ?? '').trim();

  const cookieStore = await cookies();
  if (!(await hasAdminAccess(cookieStore))) {
    return { error: 'Admin session expired. Log in again at /admin/login.' };
  }

  const expected = process.env.ADMIN_ITEM_PASSWORD?.trim();
  if (!expected) {
    if (pathname && isAdminItemProtectedPath(pathname)) redirect(pathname);
    return { error: 'Section password is not configured on the server.' };
  }

  if (!pathname || !isAdminItemProtectedPath(pathname)) {
    return { error: 'Invalid section.' };
  }

  if (password !== expected) {
    return { error: 'Invalid password. Use ADMIN_ITEM_PASSWORD from Vercel env (not the main admin login password).' };
  }

  const token = createAdminItemSessionToken();
  if (!token) {
    return { error: 'Could not create session. Check ADMIN_ITEM_PASSWORD on the server.' };
  }

  cookieStore.set(ADMIN_ITEM_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60,
  });

  redirect(pathname);
}
