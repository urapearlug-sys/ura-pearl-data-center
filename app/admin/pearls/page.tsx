'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { triggerHapticFeedback } from '@/utils/ui';

type PendingBlueActivity = {
  id: string;
  sourceLabel: string;
  amount: number;
  createdAt: string;
  user: { telegramId: string; name: string | null };
};

type PendingWithdrawal = {
  id: string;
  goldishAmount: number;
  cashAmount: number | null;
  createdAt: string;
  user: { telegramId: string; name: string | null };
};

export default function AdminPearlsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState({ white: 0, bluePending: 0, blueApproved: 0, goldish: 0 });
  const [pendingBlueActivities, setPendingBlueActivities] = useState<PendingBlueActivity[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/pearls');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load pearls admin data');
      setTotals(data.totals || { white: 0, bluePending: 0, blueApproved: 0, goldish: 0 });
      setPendingBlueActivities(data.pendingBlueActivities || []);
      setPendingWithdrawals(data.pendingWithdrawals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pearls admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  return (
    <div className="min-h-screen bg-ura-panel text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#f3ba2f]">Pearls Management</h1>
            <p className="text-sm text-gray-400 mt-1">
              White (no approval), Blue (approval required), Goldish (approved and withdrawable).
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center rounded-lg bg-ura-panel-2 px-4 py-2 text-sm hover:bg-[#3a3d42] transition-colors"
          >
            Back to Admin
          </Link>
        </div>

        {loading ? <p className="text-gray-400 mb-4">Loading pearls data...</p> : null}
        {error ? <p className="text-rose-400 mb-4">{error}</p> : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-ura-border/85 bg-ura-panel-2 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">White pearls</p>
            <p className="text-2xl font-bold mt-1">{Math.floor(totals.white).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-2">Activities like Karibu Daily, Quiz, and non-approval tasks.</p>
          </div>
          <div className="rounded-xl border border-ura-border/85 bg-ura-panel-2 p-4">
            <p className="text-xs uppercase tracking-wide text-[#5fa8ff]">Blue pearls</p>
            <p className="text-2xl font-bold mt-1">{Math.floor(totals.bluePending).toLocaleString()} pending</p>
            <p className="text-xs text-gray-400 mt-2">Receipt Rush, Whistle blower, IFRIS/reporting and similar activities.</p>
          </div>
          <div className="rounded-xl border border-ura-border/85 bg-ura-panel-2 p-4">
            <p className="text-xs uppercase tracking-wide text-[#5fa8ff]">Blue approved total</p>
            <p className="text-2xl font-bold mt-1">{Math.floor(totals.blueApproved).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-2">Historical approved Blue pearls.</p>
          </div>
          <div className="rounded-xl border border-ura-border/85 bg-ura-panel-2 p-4">
            <p className="text-xs uppercase tracking-wide text-[#f3ba2f]">Goldish pearls</p>
            <p className="text-2xl font-bold mt-1">{Math.floor(totals.goldish).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-2">Auto-converted from approved White/Blue pearls and cashout source.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-xl border border-ura-border/85 bg-ura-panel-2 p-5">
            <h2 className="text-xl font-semibold">Conversion Rules</h2>
            <div className="mt-4 space-y-2">
              <div className="rounded-lg border border-ura-line/80 bg-ura-panel/90 px-3 py-2 text-sm">
                <span className="font-semibold">50</span> White ={' '}
                <span className="font-semibold text-[#f3ba2f]">1 Goldish</span>
              </div>
              <div className="rounded-lg border border-ura-line/80 bg-ura-panel/90 px-3 py-2 text-sm">
                <span className="font-semibold">25</span> Blue ={' '}
                <span className="font-semibold text-[#f3ba2f]">1 Goldish</span> (after admin approval)
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Blue pearls are automatically converted only after admin approval. Goldish can be converted back to White.
            </p>
          </section>

          <section className="rounded-xl border border-ura-border/85 bg-ura-panel-2 p-5">
            <h2 className="text-xl font-semibold">Required Histories</h2>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li>White pearls accumulated and converted to Goldish.</li>
              <li>Blue pearls accumulated and approval outcomes.</li>
              <li>Goldish withdrawals and withdrawal status.</li>
              <li>White and Goldish transfers between users.</li>
              <li>Goldish to White reverse conversions.</li>
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-ura-border/85 bg-ura-panel-2 p-5">
          <h2 className="text-xl font-semibold">Blue Approval Queue</h2>
          <div className="mt-3 space-y-2">
            {pendingBlueActivities.length === 0 ? (
              <p className="text-sm text-gray-400">No pending blue-pearl activities.</p>
            ) : (
              pendingBlueActivities.map((item) => (
                <div key={item.id} className="rounded-lg border border-ura-line/80 bg-ura-panel/90 p-3">
                  <p className="font-medium text-white">{item.sourceLabel}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.user.name || 'User'} ({item.user.telegramId}) · {Math.floor(item.amount)} Blue
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => runAction({ action: 'approve_blue_activity', activityId: item.id, adminLabel: 'admin_panel' })}
                      className="px-3 py-1.5 text-xs rounded bg-emerald-600 hover:bg-emerald-500"
                    >
                      Approve + Auto Convert
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction({ action: 'reject_blue_activity', activityId: item.id, rejectionReason: 'Not approved', adminLabel: 'admin_panel' })}
                      className="px-3 py-1.5 text-xs rounded bg-rose-700 hover:bg-rose-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-ura-border/85 bg-ura-panel-2 p-5">
          <h2 className="text-xl font-semibold">Withdrawal Queue</h2>
          <div className="mt-3 space-y-2">
            {pendingWithdrawals.length === 0 ? (
              <p className="text-sm text-gray-400">No pending withdrawals.</p>
            ) : (
              pendingWithdrawals.map((item) => (
                <div key={item.id} className="rounded-lg border border-ura-line/80 bg-ura-panel/90 p-3">
                  <p className="font-medium text-white">{item.user.name || 'User'} ({item.user.telegramId})</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.floor(item.goldishAmount)} Goldish {item.cashAmount ? `· Cash ${item.cashAmount}` : ''}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => runAction({ action: 'approve_withdrawal', withdrawalId: item.id, adminLabel: 'admin_panel' })}
                      className="px-3 py-1.5 text-xs rounded bg-emerald-600 hover:bg-emerald-500"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction({ action: 'mark_withdrawal_paid', withdrawalId: item.id, adminLabel: 'admin_panel' })}
                      className="px-3 py-1.5 text-xs rounded bg-sky-700 hover:bg-sky-600"
                    >
                      Mark Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction({ action: 'reject_withdrawal', withdrawalId: item.id, reason: 'Rejected by admin', adminLabel: 'admin_panel' })}
                      className="px-3 py-1.5 text-xs rounded bg-rose-700 hover:bg-rose-600"
                    >
                      Reject + Refund
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-ura-border/85 bg-ura-panel-2 p-5">
          <h2 className="text-xl font-semibold">Admin Operations Checklist</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-ura-line/80 bg-ura-panel/90 p-3">
              Approve or reject Blue-pearl activities.
            </div>
            <div className="rounded-lg border border-ura-line/80 bg-ura-panel/90 p-3">
              Auto-convert approved Blue/White pearls to Goldish by configured ratios.
            </div>
            <div className="rounded-lg border border-ura-line/80 bg-ura-panel/90 p-3">
              Validate transfer and withdrawal requests.
            </div>
            <div className="rounded-lg border border-ura-line/80 bg-ura-panel/90 p-3">
              Keep complete audit history for all pearl lifecycle events.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
