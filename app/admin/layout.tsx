// app/admin/layout.tsx

/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 *
 * Website: https://nikandr.com
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 * GitHub: https://github.com/nikandr-surkov
 */

import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  verifyAdminSessionToken,
  verifyAdminItemSessionToken,
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_ITEM_COOKIE_NAME,
  isItemGateEnabled,
} from '@/utils/admin-session';
import ItemPasswordGate from './ItemPasswordGate';
import { isAdminItemProtectedPath } from '@/utils/admin-item-paths';

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const pathname = headersList.get('x-pathname') || '';
  const isLocalhost = host.includes('localhost');
  const isAdminAccessEnabled = process.env.ACCESS_ADMIN === 'true';
  const localhostAuth = isLocalhost && isAdminAccessEnabled;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const hasValidSession = verifyAdminSessionToken(sessionCookie);

  const isAuthorized = hasValidSession || localhostAuth;
  const isLoginPage = pathname === '/admin/login';
  const isNotificationsPanel = pathname === '/admin/notifications' || pathname.startsWith('/admin/notifications/');

  if (!isAuthorized && !isLoginPage && !isNotificationsPanel) {
    redirect('/admin/login');
  }

  if (isAuthorized && isItemGateEnabled() && isAdminItemProtectedPath(pathname)) {
    const itemCookie = cookieStore.get(ADMIN_ITEM_COOKIE_NAME)?.value;
    if (!verifyAdminItemSessionToken(itemCookie)) {
      return <ItemPasswordGate pathname={pathname} />;
    }
  }

  return <>{children}</>;
}
