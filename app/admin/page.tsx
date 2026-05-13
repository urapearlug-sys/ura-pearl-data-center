// app/admin/page.tsx

/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type PearlsApiPayload = {
  totals?: { white?: number; bluePending?: number; blueApproved?: number; goldish?: number };
  pendingBlueActivities?: Array<{ id: string; amount?: number; sourceLabel?: string | null; user?: { name?: string | null } | null }>;
  receiptRushActivities?: Array<{ status?: string }>;
  pendingWithdrawals?: unknown[];
};

type AdminHubCard = {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
};

const PEARLS_MANAGEMENT_CARDS: AdminHubCard[] = [
  {
    id: 'pearls-overview',
    title: 'Pearls Overview',
    path: '/admin/pearls',
    description: 'White, Blue, and Goldish balances, conversion rates, and category totals across tracked users.',
    icon: '📊',
  },
  {
    id: 'receipt-rush',
    title: 'Receipt Rush uploads',
    path: '/admin/pearls#receipt-rush-uploads',
    description: 'Review scanned receipts, see who uploaded them, and approve or reject Blue-pearl rewards.',
    icon: '🧾',
  },
  {
    id: 'pearls-approval',
    title: 'Pearls Approval Queue',
    path: '/admin/pearls',
    description: 'Approve or reject Blue-pearl activities and auto-convert approved volume to Goldish pearls.',
    icon: '✅',
  },
  {
    id: 'pearls-history',
    title: 'Pearls History & Transfers',
    path: '/admin/pearls',
    description: 'Audit conversion history, withdrawals, and White or Goldish user-to-user transfers.',
    icon: '📜',
  },
  {
    id: 'ura-tv',
    title: 'URA TV programs',
    path: '/admin/tv-programs',
    description: 'YouTube-linked episodes for Learn → URA TV; schedule for upcoming vs past ordering.',
    icon: '📺',
  },
  {
    id: 'ura-fc',
    title: 'URA FC fixtures',
    path: '/admin/ura-fc',
    description: 'Curate fixtures for Learn → URA FC. Full club news and tables stay on urafc.co.ug.',
    icon: '⚽',
  },
  {
    id: 'tasks',
    title: 'Manage Tasks (Earn Activities)',
    path: '/admin/tasks',
    description: 'Add, edit, and manage task activities on the Earn tab (tabbed by category).',
    icon: '📋',
  },
  {
    id: 'published',
    title: 'Published activities feed',
    path: '/admin/published-activities',
    description: 'Short posts under Activities on Earn — newest published items appear first in the app.',
    icon: '📣',
  },
  {
    id: 'account-management',
    title: 'User accounts',
    path: '/admin/accounts',
    description: 'Search the user table, run per-user actions, bulk testing tools, and exports from the dedicated accounts screen.',
    icon: '👤',
  },
];

const MORE_ADMIN_SECTIONS: AdminHubCard[] = [
  { id: 'bot-users', title: 'Bot Users', path: '/admin/bot-users', description: 'Suspected bot or cheater accounts; flag, freeze, view suspicion score.', icon: '🤖' },
  { id: 'fees', title: 'Fees Collection', path: '/admin/fees-collection', description: 'Transactions to the treasury wallet, by date and total.', icon: '💰' },
  { id: 'decode', title: 'Decode', path: '/admin/daily-cipher', description: 'Daily cipher overrides and word pool (Hybrid mode).', icon: '🔐' },
  { id: 'matrix', title: 'Matrix', path: '/admin/daily-combo', description: 'Daily combo overrides and card pool (Hybrid mode).', icon: '🎴' },
  { id: 'cards', title: 'Collection Cards', path: '/admin/cards', description: 'Collection cards (unlock by rank, referrals, task).', icon: '🗂️' },
  { id: 'weekly', title: 'Weekly Event', path: '/admin/weekly-event', description: 'Override weekly event tiers (Hybrid mode).', icon: '🏆' },
  { id: 'onchain', title: 'Manage Onchain Tasks', path: '/admin/onchain-tasks', description: 'Add, edit, and manage onchain tasks.', icon: '⛓️' },
  { id: 'notifications', title: 'Notifications', path: '/admin/notifications', description: 'In-app notifications and profile surfaces.', icon: '📢' },
  { id: 'milestones', title: 'Milestone Banners', path: '/admin/milestone-banners', description: 'One-time congratulations banners on the main screen.', icon: '🎉' },
  { id: 'telegram', title: 'Telegram broadcast', path: '/admin/telegram-broadcast', description: 'Message users’ Telegram bot chats (link + buttons).', icon: '✈️' },
  { id: 'export', title: 'Export User Data', path: '/admin/export', description: 'Export user information.', icon: '📤' },
  { id: 'staking', title: 'Staking audit', path: '/admin/staking-audit', description: 'Report and correct stakes with wrong bonus %.', icon: '🔍' },
  { id: 'leagues', title: 'League Management', path: '/admin/league-management', description: 'Teams and leagues; donate PEARLS; league membership.', icon: '🛡️' },
  { id: 'global-tasks', title: 'Global Joinable Tasks', path: '/admin/global-tasks', description: 'Track tasks; set winner and redeem prize (stakes + bonus).', icon: '🌍' },
  { id: 'quiz', title: 'URA Quiz', path: '/admin/quiz', description: 'URA Quiz on Earn: questions, pool, bonus, automated sets.', icon: '🧠' },
  { id: 'learn', title: 'Learn Content', path: '/admin/learn', description: 'Learn page categories and lessons.', icon: '📚' },
  { id: 'pattern', title: 'Daily Pattern', path: '/admin/daily-pattern', description: '9-dot minigame pattern; set override.', icon: '⚫' },
  { id: 'shop', title: 'Shop (Match 2 Earn)', path: '/admin/shop', description: 'Approve or reject product listings for the in-app Shop.', icon: '🛒' },
];

function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

const AdminPanel = () => {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);
  const [pearlsPayload, setPearlsPayload] = useState<PearlsApiPayload | null>(null);
  const [pearlsLoadError, setPearlsLoadError] = useState<string | null>(null);
  const [tvCount, setTvCount] = useState<number | null>(null);
  const [fcCount, setFcCount] = useState<number | null>(null);

  const loadDashboardStats = useCallback(async () => {
    setPearlsLoadError(null);
    try {
      const [pearlsRes, tvRes, fcRes] = await Promise.all([
        fetch('/api/admin/pearls', { credentials: 'include' }),
        fetch('/api/admin/tv-programs', { credentials: 'include' }),
        fetch('/api/admin/ura-fc/matches', { credentials: 'include' }),
      ]);
      if (pearlsRes.ok) {
        const data = (await pearlsRes.json()) as PearlsApiPayload;
        setPearlsPayload(data);
      } else {
        setPearlsLoadError('Could not load pearls snapshot');
        setPearlsPayload(null);
      }
      if (tvRes.ok) {
        const tv = await tvRes.json();
        setTvCount(Array.isArray(tv) ? tv.length : null);
      }
      if (fcRes.ok) {
        const fc = await fcRes.json();
        setFcCount(Array.isArray(fc) ? fc.length : null);
      }
    } catch {
      setPearlsLoadError('Network error loading dashboard stats');
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/clear-item-session', { method: 'POST', credentials: 'include' }).catch(() => {});
  }, []);

  useEffect(() => {
    void loadDashboardStats();
  }, [loadDashboardStats]);

  const pendingBlue = pearlsPayload?.pendingBlueActivities?.length ?? 0;
  const pendingWithdrawals = pearlsPayload?.pendingWithdrawals?.length ?? 0;
  const receiptPending =
    pearlsPayload?.receiptRushActivities?.filter((r) => r.status === 'PENDING').length ?? 0;
  const totals = pearlsPayload?.totals;

  const spotlightQueue = (pearlsPayload?.pendingBlueActivities ?? []).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0c1018] text-white">
      <div className="border-b border-white/[0.06] bg-gradient-to-b from-[#121a28] to-[#0c1018]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f3ba2f]/90">Operations</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-1">Admin Panel</h1>
              <p className="text-sm text-slate-400 mt-2 max-w-xl">
                Pearls, Earn content, and club media are grouped below. Deeper system tools stay under{' '}
                <span className="text-slate-300">More</span>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadDashboardStats()}
                className="text-sm px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 transition-colors"
              >
                Refresh data
              </button>
              <button
                type="button"
                onClick={() => setShowMore((prev) => !prev)}
                className="text-sm px-4 py-2 rounded-lg bg-[#1e2a3d] border border-[#f3ba2f]/35 text-[#f3ba2f] hover:bg-[#243044] transition-colors"
              >
                {showMore ? 'Hide more tools' : 'More tools'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/admin/logout', { method: 'POST' });
                  router.push('/admin/login');
                  router.refresh();
                }}
                className="text-sm px-4 py-2 rounded-lg text-slate-500 hover:text-white transition-colors"
              >
                Log out
              </button>
            </div>
          </div>

          {pearlsLoadError ? (
            <p className="text-sm text-amber-400/90 mb-4">{pearlsLoadError}</p>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-[#141c2c] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pearls economy</p>
                  <p className="text-lg font-bold text-white mt-1">Tracked balances</p>
                </div>
                <span className="text-2xl" aria-hidden>
                  💎
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Snapshot from the Pearls admin dataset (top users sample).
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-slate-200 border border-white/10">
                  White {totals != null ? formatCompact(totals.white ?? 0) : '—'}
                </span>
                <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-medium text-sky-200 border border-sky-500/25">
                  Blue pending {totals != null ? formatCompact(totals.bluePending ?? 0) : '—'}
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-200 border border-amber-500/25">
                  Goldish {totals != null ? formatCompact(totals.goldish ?? 0) : '—'}
                </span>
              </div>
              <Link
                href="/admin/pearls"
                className="mt-4 inline-flex text-xs font-semibold text-[#f3ba2f] hover:underline"
              >
                Open Pearls overview →
              </Link>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#141c2c] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Action queue</p>
                  <p className="text-lg font-bold text-white mt-1">Needs attention</p>
                </div>
                <span className="text-2xl" aria-hidden>
                  ⏳
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-2 border-b border-white/[0.06] pb-2">
                  <span className="text-slate-400">Pending Blue approvals</span>
                  <span className="font-bold tabular-nums text-white">{pearlsPayload ? pendingBlue : '—'}</span>
                </div>
                <div className="flex justify-between gap-2 border-b border-white/[0.06] pb-2">
                  <span className="text-slate-400">Receipt Rush pending</span>
                  <span className="font-bold tabular-nums text-white">{pearlsPayload ? receiptPending : '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Withdrawals pending</span>
                  <span className="font-bold tabular-nums text-white">{pearlsPayload ? pendingWithdrawals : '—'}</span>
                </div>
              </div>
              <Link href="/admin/pearls" className="mt-4 inline-flex text-xs font-semibold text-[#f3ba2f] hover:underline">
                Open approval queue →
              </Link>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#141c2c] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Content registry</p>
                  <p className="text-lg font-bold text-white mt-1">TV & fixtures</p>
                </div>
                <span className="text-2xl" aria-hidden>
                  📡
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-2 border-b border-white/[0.06] pb-2">
                  <span className="text-slate-400">URA TV programs</span>
                  <span className="font-bold tabular-nums text-white">{tvCount != null ? tvCount : '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">URA FC fixtures</span>
                  <span className="font-bold tabular-nums text-white">{fcCount != null ? fcCount : '—'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 leading-relaxed">Counts reflect published rows in each admin list.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {spotlightQueue.length > 0 ? (
          <section className="mb-10" aria-labelledby="admin-queue-heading">
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                <h2 id="admin-queue-heading" className="text-lg font-bold text-white tracking-tight">
                  Blue pearl approvals
                </h2>
                <p className="text-sm text-slate-500 mt-1">Latest pending items — open Pearls to approve or reject.</p>
              </div>
              <Link
                href="/admin/pearls"
                className="text-sm font-semibold text-[#f3ba2f] hover:underline shrink-0"
              >
                View all
              </Link>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-[#111822] divide-y divide-white/[0.06] overflow-hidden">
              {spotlightQueue.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02] cursor-pointer"
                  onClick={() => router.push('/admin/pearls')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push('/admin/pearls');
                    }
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{row.sourceLabel ?? 'Blue pearl activity'}</p>
                    <p className="text-xs text-slate-500 truncate">{row.user?.name ?? 'User'} · pending review</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold uppercase tracking-wide text-amber-400/95 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md">
                      Pending
                    </span>
                    <span className="text-sm font-bold tabular-nums text-slate-200">{row.amount != null ? `+${row.amount}` : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="pearls-hub-heading">
          <h2 id="pearls-hub-heading" className="text-xl font-bold text-white tracking-tight">
            Pearls management & operations
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Pearls workflows, Earn publishing, club media, and <strong className="text-slate-400 font-semibold">user accounts</strong> live
            in this hub — a single place for revenue-adjacent operations.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PEARLS_MANAGEMENT_CARDS.map((section) => (
              <div
                key={section.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(section.path)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(section.path);
                  }
                }}
                className="group rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161f2e] to-[#0e141c] p-5 text-left shadow-lg shadow-black/20 hover:border-[#f3ba2f]/35 hover:shadow-[#f3ba2f]/[0.07] transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0a1018] border border-white/10 text-2xl shadow-inner"
                    aria-hidden
                  >
                    {section.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white leading-snug group-hover:text-[#f3ba2f] transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">{section.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Module</span>
                  <Link
                    href={section.path}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-bold text-[#f3ba2f] hover:underline"
                  >
                    Open →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {showMore ? (
          <section className="mt-14" aria-labelledby="more-admin-heading">
            <h2 id="more-admin-heading" className="text-xl font-bold text-white tracking-tight">
              Platform & game administration
            </h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">Decode, Matrix, leagues, shop, and other system modules.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MORE_ADMIN_SECTIONS.map((section) => (
                <div
                  key={section.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(section.path)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(section.path);
                    }
                  }}
                  className="group rounded-2xl border border-white/[0.06] bg-[#121822] p-5 hover:border-sky-500/30 hover:bg-[#151d2a] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-xl border border-white/10">
                      {section.icon}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white leading-snug">{section.title}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">{section.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default AdminPanel;
