'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AuditRow {
  stakeId: string;
  userId: string;
  telegramId: string;
  name: string | null;
  amountLocked: number;
  duration: string;
  storedBonusPercent: number;
  expectedBonusPercent: number;
  claimedAt: string | null;
  wrongTotalIfClaimed: number;
  correctTotalReturn: number;
}

interface AllStakeRow {
  stakeId: string;
  userId: string;
  telegramId: string;
  name: string | null;
  amountLocked: number;
  duration: string;
  bonusPercent: number;
  bonusAmount: number;
  totalReturn: number;
  lockedAt: string;
  unlocksAt?: string;
  claimedAt: string | null;
  isWrongBonus: boolean;
}

export default function StakingAuditPage() {
  const [allStakes, setAllStakes] = useState<AllStakeRow[]>([]);
  const [report, setReport] = useState<AuditRow[]>([]);
  const [summary, setSummary] = useState<{ totalStakes: number; activeStakes?: number; abnormalCount: number } | null>(null);
  const [activeStakes, setActiveStakes] = useState<AllStakeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [correcting, setCorrecting] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resettingBulk, setResettingBulk] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setLoadError(null);
    fetch('/api/admin/staking-audit', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(new Error((d as { error?: string }).error || `HTTP ${r.status}`)));
        return r.json();
      })
      .then((data) => {
        if ((data as { error?: string }).error) {
          setLoadError((data as { error: string }).error);
          return;
        }
        setAllStakes(data.allStakes ?? []);
        setActiveStakes(data.activeStakes ?? []);
        setReport(data.report ?? []);
        setSummary(data.summary ?? null);
      })
      .catch((err) => setLoadError(err?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const runCorrect = () => {
    if (!confirm('Set every stake\'s bonus to the correct value for its duration?')) return;
    setCorrecting(true);
    fetch('/api/admin/staking-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'correct' }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) alert(`Updated ${data.updated} stakes.`);
        else alert(data.error || 'Failed');
        window.location.reload();
      })
      .catch(() => alert('Request failed'))
      .finally(() => setCorrecting(false));
  };

  const claimedStakes = allStakes.filter((s) => s.claimedAt != null);

  const resetOneClaim = (id: string) => {
    if (!confirm('Reset this stake so the user can claim again? They will receive only their staked amount (no bonus).')) return;
    setResettingId(id);
    fetch('/api/admin/staking-reset-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ stakeId: id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) alert(data.message ?? 'Reset.');
        else alert(data.error ?? 'Failed');
        window.location.reload();
      })
      .catch(() => alert('Request failed'))
      .finally(() => setResettingId(null));
  };

  const resetAllClaimed = () => {
    if (!confirm(`Reset ALL ${claimedStakes.length} claimed stakes? Every affected user will be able to claim again. Only use if many users are stuck with "Already claimed" and never received ALM.`)) return;
    const confirmText = prompt('Type RESET_ALL_CLAIMED to confirm bulk reset:');
    if (confirmText !== 'RESET_ALL_CLAIMED') {
      alert('Cancelled.');
      return;
    }
    setResettingBulk(true);
    fetch('/api/admin/staking-reset-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ bulk: true, confirm: 'RESET_ALL_CLAIMED' }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) alert(`${data.message ?? 'Done.'} Reset count: ${data.resetCount ?? 0}`);
        else alert(data.error ?? 'Failed');
        window.location.reload();
      })
      .catch(() => alert('Request failed'))
      .finally(() => setResettingBulk(false));
  };

  return (
    <div className="min-h-screen bg-[#1d2025] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="text-[#f3ba2f] mb-4 inline-block">← Back to Admin</Link>
        <h1 className="text-3xl font-bold text-[#f3ba2f] mb-2">Staking audit</h1>
        <p className="text-gray-400 mb-6">
          All stakers and their bonuses below. Section &quot;Wrong bonus %&quot; lists only stakes where stored bonus differed from config (would have overpaid). Correct DB so stored values match.
        </p>
        <div className="mb-6 p-4 rounded-lg bg-[#272a2f] border border-[#3d4046]">
          <p className="text-white font-medium mb-1">How do users claim their rewards?</p>
          <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
            <li><strong className="text-emerald-400">Claimed? = No</strong> → They claim from the app: open the game, go to <strong>Mine</strong>, tap &quot;Lock ALM &amp; Earn Bonus&quot;, then in the popup tap <strong>Claim X ALM</strong> on each unlocked stake. No admin action needed.</li>
            <li><strong className="text-amber-400">Claimed? = Yes</strong> → If the user never received their ALM (e.g. stuck during maintenance), use the section below to <strong>Reset claim</strong> so they can claim again from the app.</li>
          </ul>
        </div>
        {loadError && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/40 text-red-200">
            {loadError}
          </div>
        )}
        {summary && (
          <p className="text-gray-300 mb-6">
            Total stakes: {summary.totalStakes}. <strong className="text-emerald-400">Active (unclaimed): {summary.activeStakes ?? allStakes.filter((s) => !s.claimedAt).length}</strong>. Abnormal (wrong bonus): {summary.abnormalCount}.
          </p>
        )}

        {/* Accounts with active staking (unclaimed) */}
        {activeStakes.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-emerald-400 mb-3">Accounts with active staking (unclaimed)</h2>
            <p className="text-gray-400 mb-3">These users have stakes that are not yet claimed. They can claim from the app (Mine → Lock ALM &amp; Earn Bonus → Claim).</p>
            <div className="overflow-x-auto mb-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#3d4046]">
                    <th className="pb-2 pr-2 text-gray-400">User (name / Telegram ID)</th>
                    <th className="pb-2 pr-2 text-gray-400">Amount locked</th>
                    <th className="pb-2 pr-2 text-gray-400">Duration</th>
                    <th className="pb-2 pr-2 text-gray-400">Locked at</th>
                    <th className="pb-2 text-gray-400">Unlocks at</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStakes.map((s) => (
                    <tr key={s.stakeId} className="border-b border-[#3d4046]/50">
                      <td className="py-2 pr-2 text-white">{s.name ?? '—'} / {s.telegramId}</td>
                      <td className="py-2 pr-2">{Number(s.amountLocked).toLocaleString()}</td>
                      <td className="py-2 pr-2">{s.duration}</td>
                      <td className="py-2 pr-2 text-gray-400 text-sm">{new Date(s.lockedAt).toLocaleString()}</td>
                      <td className="py-2 text-gray-400 text-sm">{s.unlocksAt ? new Date(s.unlocksAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* All stakers */}
        <h2 className="text-xl font-semibold text-[#f3ba2f] mb-3">All stakers &amp; bonuses</h2>
        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : loadError ? (
          <p className="text-gray-400 mb-8">Cannot load data. Log in as admin (and enter section password if required), then refresh.</p>
        ) : allStakes.length === 0 ? (
          <p className="text-gray-400 mb-8">No stakes.</p>
        ) : (
          <div className="overflow-x-auto mb-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3d4046]">
                  <th className="pb-2 pr-2 text-gray-400">User (name / Telegram ID)</th>
                  <th className="pb-2 pr-2 text-gray-400">Amount locked</th>
                  <th className="pb-2 pr-2 text-gray-400">Duration</th>
                  <th className="pb-2 pr-2 text-gray-400">Bonus %</th>
                  <th className="pb-2 pr-2 text-gray-400">Bonus amount</th>
                  <th className="pb-2 pr-2 text-gray-400">Total return</th>
                  <th className="pb-2 pr-2 text-gray-400">Locked at</th>
                  <th className="pb-2 pr-2 text-gray-400">Claimed?</th>
                  <th className="pb-2 text-gray-400">Wrong bonus?</th>
                </tr>
              </thead>
              <tbody>
                {allStakes.map((s) => (
                  <tr key={s.stakeId} className={`border-b border-[#3d4046]/50 ${s.isWrongBonus ? 'bg-amber-950/30' : ''}`}>
                    <td className="py-2 pr-2 text-white">{s.name ?? '—'} / {s.telegramId}</td>
                    <td className="py-2 pr-2">{Number(s.amountLocked).toLocaleString()}</td>
                    <td className="py-2 pr-2">{s.duration}</td>
                    <td className="py-2 pr-2">{s.bonusPercent}</td>
                    <td className="py-2 pr-2">{Number(s.bonusAmount).toLocaleString()}</td>
                    <td className="py-2 pr-2">{Number(s.totalReturn).toLocaleString()}</td>
                    <td className="py-2 pr-2 text-gray-400 text-sm">{new Date(s.lockedAt).toLocaleString()}</td>
                    <td className="py-2 pr-2">{s.claimedAt ? 'Yes' : 'No'}</td>
                    <td className="py-2">{s.isWrongBonus ? 'Yes' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Only stakes marked as claimed in DB – reset only for those who had not yet claimed (e.g. stuck during maintenance) */}
        {claimedStakes.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-emerald-400 mb-3 mt-10">Stakes marked as claimed (reset only if user had not yet claimed)</h2>
            <p className="text-gray-400 mb-3">
              This table shows only stakes that are <strong>marked as claimed</strong> in the DB. Use reset <strong>only for users who had staked but had not yet claimed</strong> when the service was stopped and never received their ALM—they will then be able to claim (staked amount only). Do not reset for users who already received their payout.
            </p>
            <button
              type="button"
              onClick={resetAllClaimed}
              disabled={resettingBulk}
              className="mb-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg disabled:opacity-50"
            >
              {resettingBulk ? 'Resetting…' : `Reset all ${claimedStakes.length} claimed stakes`}
            </button>
            <div className="overflow-x-auto mb-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#3d4046]">
                    <th className="pb-2 pr-2 text-gray-400">User</th>
                    <th className="pb-2 pr-2 text-gray-400">Amount locked</th>
                    <th className="pb-2 pr-2 text-gray-400">Duration</th>
                    <th className="pb-2 pr-2 text-gray-400">Claimed at</th>
                    <th className="pb-2 text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {claimedStakes.map((s) => (
                    <tr key={s.stakeId} className="border-b border-[#3d4046]/50">
                      <td className="py-2 pr-2 text-white">{s.name ?? '—'} / {s.telegramId}</td>
                      <td className="py-2 pr-2">{Number(s.amountLocked).toLocaleString()}</td>
                      <td className="py-2 pr-2">{s.duration}</td>
                      <td className="py-2 pr-2 text-gray-400 text-sm">{s.claimedAt ? new Date(s.claimedAt).toLocaleString() : '—'}</td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => resetOneClaim(s.stakeId)}
                          disabled={resettingId === s.stakeId}
                          className="px-2 py-1 text-sm bg-emerald-700 hover:bg-emerald-600 rounded disabled:opacity-50"
                        >
                          {resettingId === s.stakeId ? '…' : 'Reset claim'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Wrong bonus % section */}
        <h2 className="text-xl font-semibold text-amber-400 mb-3">Wrong bonus %</h2>
        <p className="text-gray-400 mb-3">Stakes where stored bonus differed from config (would have paid more than configured). Use &quot;Correct all stakes&quot; to fix DB.</p>
        <button
          type="button"
          onClick={runCorrect}
          disabled={correcting || (summary?.abnormalCount ?? 0) === 0}
          className="mb-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50"
        >
          {correcting ? 'Correcting…' : 'Correct all stakes (set bonus % from config)'}
        </button>
        {report.length === 0 ? (
          <p className="text-gray-400">No abnormal stakes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3d4046]">
                  <th className="pb-2 pr-2 text-gray-400">User (name / Telegram ID)</th>
                  <th className="pb-2 pr-2 text-gray-400">Amount locked</th>
                  <th className="pb-2 pr-2 text-gray-400">Duration</th>
                  <th className="pb-2 pr-2 text-gray-400">Stored %</th>
                  <th className="pb-2 pr-2 text-gray-400">Expected %</th>
                  <th className="pb-2 pr-2 text-gray-400">Claimed?</th>
                  <th className="pb-2 pr-2 text-gray-400">Wrong total if claimed</th>
                  <th className="pb-2 text-gray-400">Correct total</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r) => (
                  <tr key={r.stakeId} className="border-b border-[#3d4046]/50">
                    <td className="py-2 pr-2 text-white">{r.name ?? '—'} / {r.telegramId}</td>
                    <td className="py-2 pr-2">{Number(r.amountLocked).toLocaleString()}</td>
                    <td className="py-2 pr-2">{r.duration}</td>
                    <td className="py-2 pr-2 text-amber-400">{r.storedBonusPercent}</td>
                    <td className="py-2 pr-2 text-emerald-400">{r.expectedBonusPercent}</td>
                    <td className="py-2 pr-2">{r.claimedAt ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-2 text-red-400">{Number(r.wrongTotalIfClaimed).toLocaleString()}</td>
                    <td className="py-2 text-emerald-400">{Number(r.correctTotalReturn).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
