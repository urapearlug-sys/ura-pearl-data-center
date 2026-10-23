/** Admin routes that require ADMIN_ITEM_PASSWORD (second gate) when that env var is set. */
export const ADMIN_ITEM_PROTECTED_PATHS = [
  '/admin/accounts',
  '/admin/bot-users',
  '/admin/tasks',
  '/admin/daily-cipher',
  '/admin/daily-combo',
  '/admin/cards',
  '/admin/weekly-event',
  '/admin/onchain-tasks',
  '/admin/export',
  '/admin/fees-collection',
  '/admin/staking-audit',
  '/admin/league-management',
  '/admin/global-tasks',
  '/admin/quiz',
  '/admin/daily-pattern',
  '/admin/shop',
  '/admin/milestone-banners',
] as const;

export function isAdminItemProtectedPath(pathname: string): boolean {
  return ADMIN_ITEM_PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
