'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { triggerHapticFeedback } from '@/utils/ui';
import AdminModuleShell from '@/app/admin/_components/AdminModuleShell';

type PendingBlueActivity = {
  id: string;
  sourceKey: string;
  sourceLabel: string;
  amount: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  user: { telegramId: string; name: string | null };
};

type PendingWithdrawal = {
  id: string;
  goldishAmount: number;
  cashAmount: number | null;
  createdAt: string;
  user: { telegramId: string; name: string | null };
};

const cardSurface =
  'rounded-2xl border border-white/[0.08] bg-[#141c2c] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]';

export default function AdminPearlsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState({ white: 0, bluePending: 0, blueApproved: 0, goldish: 0 });
  const [pendingBlueActivities, setPendingBlueActivities] = useState<PendingBlueActivity[]>([]);
  const [receiptRushActivities, setReceiptRushActivities] = useState<PendingBlueActivity[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pearlsRes = await fetch('/api/admin/pearls');
      const pearlsData = await pearlsRes.json();
      if (!pearlsRes.ok) throw new Error(pearlsData.error || 'Failed to load pearls admin data');
      setTotals(pearlsData.totals || { white: 0, bluePending: 0, blueApproved: 0, goldish: 0 });
      setPendingBlueActivities(pearlsData.pendingBlueActivities || []);
      setReceiptRushActivities(pearlsData.receiptRushActivities || []);
      setPendingWithdrawals(pearlsData.pendingWithdrawals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pearls admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const kpis = useMemo(
    () => [
      { label: 'White (no approval)', value: formatNumber(totals.white), hint: 'Accumulated in-app' },
      { label: 'Blue — pending review', value: formatNumber(totals.bluePending), hint: 'Awaiting admin' },
      { label: 'Blue — approved', value: formatNumber(totals.blueApproved), hint: 'Converted path eligible' },
      { label: 'Goldish', value: formatNumber(totals.goldish), hint: 'Withdrawable balance' },
    ],
    [totals],
  );

  const runAction = async (payload: Record<string, unknown>) => {
    triggerHapticFeedback(window);
    const res = await fetch('/api/admin/pearls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Action failed');
    await loadData();
  };

  const parseReceiptRushLabel = (sourceLabel: string): Record<string, string> => {
    const out: Record<string, string> = {};
    const parts = sourceLabel
      .split(' · ')
      .map((p) => p.trim())
      .filter(Boolean);
    for (const part of parts) {
      const idx = part.indexOf(':');
      if (idx > 0) {
        out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
      }
    }
    return out;
  };

  const statusBadgeClass = (status?: string): string => {
    if (status === 'APPROVED') return 'border-emerald-500/45 bg-emerald-500/10 text-emerald-300';
    if (status === 'REJECTED') return 'border-rose-500/45 bg-rose-500/10 text-rose-300';
    return 'border-amber-500/45 bg-amber-500/10 text-amber-300';
  };

  const innerRow = 'rounded-xl border border-white/[0.06] bg-[#0f1522] p-3';

  return (
    <AdminModuleShell
      eyebrow="Pearls & payouts"
      title="Pearls operations"
      description="Review Receipt Rush and other Blue rewards, approve conversions, and settle Goldish withdrawals. User-wide controls live under Dashboard → User accounts."
      kpis={kpis}
      headerRight={
        <>
          <Link
            href="/admin/export"
            className="inline-flex items-center rounded-xl border border-white/[0.12] bg-[#1a2436] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223047] transition-colors"
          >
            Export data
          </Link>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center rounded-xl border border-[#f3ba2f]/35 bg-[#f3ba2f]/10 px-4 py-2 text-sm font-semibold text-[#f3ba2f] hover:bg-[#f3ba2f]/15 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </>
      }
    >
      {loading ? <p className="text-slate-500 text-sm mb-4">Loading pearls data…</p> : null}
      {error ? <p className="text-rose-400 text-sm mb-4">{error}</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <section className={`${cardSurface} p-5`}>
          <h2 className="text-lg font-semibold text-white">Conversion rules</h2>
          <div className="mt-4 grid gap-2">
            <div className={`${innerRow} text-sm`}>
              <span className="font-semibold text-white">50</span> White →{' '}
              <span className="font-semibold text-[#f3ba2f]">1 Goldish</span>
            </div>
            <div className={`${innerRow} text-sm`}>
              <span className="font-semibold text-white">25</span> Blue →{' '}
              <span className="font-semibold text-[#f3ba2f]">1 Goldish</span>{' '}
              <span className="text-slate-500">(after approval)</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Blue converts only after you approve the activity. Goldish can be converted back to White from the app where supported.
          </p>
        </section>

        <section className={`${cardSurface} p-5`}>
          <h2 className="text-lg font-semibold text-white">Audit scope</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li className="flex gap-2"><span className="text-[#f3ba2f]">·</span> White → Goldish conversions</li>
            <li className="flex gap-2"><span className="text-[#f3ba2f]">·</span> Blue approvals and outcomes</li>
            <li className="flex gap-2"><span className="text-[#f3ba2f]">·</span> Goldish withdrawals and status</li>
            <li className="flex gap-2"><span className="text-[#f3ba2f]">·</span> Transfers between users (White / Goldish)</li>
            <li className="flex gap-2"><span className="text-[#f3ba2f]">·</span> Goldish → White reversals</li>
          </ul>
        </section>
      </div>

      <div id="receipt-rush-uploads" className="grid grid-cols-1 lg:grid-cols-2 gap-4 scroll-mt-24">
        <section className={`${cardSurface} border-cyan-500/20 p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-cyan-100">Receipt Rush uploads</h2>
              <p className="text-xs text-slate-500 mt-1">Scanned receipts with uploader details. Pending rows can be approved or rejected.</p>
            </div>
            <span className="shrink-0 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200 tabular-nums">
              {receiptRushActivities.length}
            </span>
          </div>
          <div className="mt-4 space-y-2 max-h-[min(70vh,520px)] overflow-y-auto pr-1">
            {receiptRushActivities.length === 0 ? (
              <p className="text-sm text-slate-500 rounded-xl border border-dashed border-white/[0.08] p-4">
                No Receipt Rush uploads yet. Submissions will appear here.
              </p>
            ) : (
              receiptRushActivities.map((item) => {
                const parsed = parseReceiptRushLabel(item.sourceLabel);
                const imageRef = parsed.Image || null;
                const receiptUrl =
                  imageRef && imageRef !== 'embedded'
                    ? imageRef
                    : imageRef === 'embedded'
                      ? `/api/admin/receipt-rush-image/${item.id}`
                      : null;
                return (
                  <div key={`receipt-${item.id}`} className={innerRow}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.user.name || 'User'} <span className="text-slate-500 font-normal">({item.user.telegramId})</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs rounded-full px-2 py-0.5 border ${statusBadgeClass(item.status)}`}>
                          {(item.status || 'PENDING').toLowerCase()}
                        </span>
                        <span className="text-xs rounded-full px-2 py-0.5 bg-[#5fa8ff]/12 border border-[#5fa8ff]/35 text-[#9dc9ff]">
                          {Math.floor(item.amount)} Blue
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-400">
                      <p><span className="text-slate-600">Category</span> {parsed['Receipt Rush'] || parsed['Category'] || '—'}</p>
                      <p><span className="text-slate-600">Tax</span> {parsed['Tax'] || parsed['Tax type'] || '—'}</p>
                      <p><span className="text-slate-600">Portal</span> {parsed['Portal'] || '—'}</p>
                      <p><span className="text-slate-600">Receipt #</span> {parsed['Ref'] || '—'}</p>
                      <p><span className="text-slate-600">Date</span> {parsed['Date'] || '—'}</p>
                      <p><span className="text-slate-600">Paid</span> {parsed['Paid'] || '—'}</p>
                    </div>
                    {receiptUrl ? (
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex text-xs text-cyan-300 hover:underline underline-offset-2"
                      >
                        Open receipt
                      </a>
                    ) : null}
                    {item.status === 'REJECTED' && item.rejectionReason ? (
                      <p className="mt-2 text-xs text-rose-300">Reason: {item.rejectionReason}</p>
                    ) : null}
                    {item.status === 'PENDING' ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void runAction({
                              action: 'approve_blue_activity',
                              activityId: item.id,
                              adminLabel: 'admin_panel',
                            })
                          }
                          className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold"
                        >
                          Approve + convert
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void runAction({
                              action: 'reject_blue_activity',
                              activityId: item.id,
                              rejectionReason: 'Receipt not approved',
                              adminLabel: 'admin_panel',
                            })
                          }
                          className="px-3 py-1.5 text-xs rounded-lg bg-rose-700 hover:bg-rose-600 font-semibold"
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className={`${cardSurface} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Blue approval queue</h2>
            <span className="rounded-full border border-white/[0.1] bg-[#0f1522] px-3 py-1 text-xs text-slate-400 tabular-nums">
              {pendingBlueActivities.length} pending
            </span>
          </div>
          <div className="mt-4 space-y-2 max-h-[min(70vh,520px)] overflow-y-auto pr-1">
            {pendingBlueActivities.length === 0 ? (
              <p className="text-sm text-slate-500">No pending Blue activities.</p>
            ) : (
              pendingBlueActivities.map((item) => (
                <div key={item.id} className={innerRow}>
                  <p className="font-medium text-white text-sm leading-snug">{item.sourceLabel}</p>
                  {item.sourceKey === 'receipt_rush' && item.sourceLabel.includes('/uploads/receipts/') ? (
                    <a
                      href={item.sourceLabel.slice(item.sourceLabel.indexOf('/uploads/receipts/')).split(' · ')[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex text-xs text-cyan-300 hover:underline underline-offset-2"
                    >
                      Open uploaded receipt
                    </a>
                  ) : null}
                  <p className="text-xs text-slate-500 mt-1">
                    {item.user.name || 'User'} ({item.user.telegramId}) · {Math.floor(item.amount)} Blue
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void runAction({ action: 'approve_blue_activity', activityId: item.id, adminLabel: 'admin_panel' })
                      }
                      className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold"
                    >
                      Approve + convert
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void runAction({
                          action: 'reject_blue_activity',
                          activityId: item.id,
                          rejectionReason: 'Not approved',
                          adminLabel: 'admin_panel',
                        })
                      }
                      className="px-3 py-1.5 text-xs rounded-lg bg-rose-700 hover:bg-rose-600 font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className={`${cardSurface} p-5 mt-4`}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Withdrawal queue</h2>
          <span className="rounded-full border border-[#f3ba2f]/25 bg-[#f3ba2f]/10 px-3 py-1 text-xs font-semibold text-[#f3ba2f] tabular-nums">
            {pendingWithdrawals.length} open
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {pendingWithdrawals.length === 0 ? (
            <p className="text-sm text-slate-500 md:col-span-2">No pending withdrawals.</p>
          ) : (
            pendingWithdrawals.map((item) => (
              <div key={item.id} className={innerRow}>
                <p className="font-medium text-white text-sm">
                  {item.user.name || 'User'} <span className="text-slate-500 font-normal">({item.user.telegramId})</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {Math.floor(item.goldishAmount)} Goldish{item.cashAmount != null ? ` · Cash ${item.cashAmount}` : ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void runAction({ action: 'approve_withdrawal', withdrawalId: item.id, adminLabel: 'admin_panel' })}
                    className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void runAction({ action: 'mark_withdrawal_paid', withdrawalId: item.id, adminLabel: 'admin_panel' })}
                    className="px-3 py-1.5 text-xs rounded-lg bg-sky-700 hover:bg-sky-600 font-semibold"
                  >
                    Mark paid
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void runAction({
                        action: 'reject_withdrawal',
                        withdrawalId: item.id,
                        reason: 'Rejected by admin',
                        adminLabel: 'admin_panel',
                      })
                    }
                    className="px-3 py-1.5 text-xs rounded-lg bg-rose-700 hover:bg-rose-600 font-semibold"
                  >
                    Reject + refund
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">Operations checklist</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            'Approve or reject Blue rewards (including Receipt Rush).',
            'Auto-convert approved Blue / White to Goldish at configured ratios.',
            'Validate transfers and payout requests before marking paid.',
            'Retain a full audit trail for every pearl lifecycle event.',
          ].map((text) => (
            <div key={text} className={`${cardSurface} p-4 text-sm text-slate-300 leading-relaxed`}>
              {text}
            </div>
          ))}
        </div>
      </section>
    </AdminModuleShell>
  );
}
