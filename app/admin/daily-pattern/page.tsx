'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import { PATTERN_DOTS_REWARD, PATTERN_GRID_SIZE, PATTERN_MIN_DOTS, PATTERN_MAX_DOTS } from '@/utils/consts';

/** Visual 4x3 grid (12 dots) for display only. */
function PatternGrid({ pattern }: { pattern: string }) {
  const indices = pattern.split('-').map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n) && n >= 0 && n < PATTERN_GRID_SIZE);
  const filled = new Set(indices);
  return (
    <div className="inline-grid grid-cols-4 gap-2 p-4 bg-[#1d2025] rounded-xl border border-[#3d4046]">
      {Array.from({ length: PATTERN_GRID_SIZE }, (_, i) => (
        <div
          key={i}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono ${
            filled.has(i) ? 'bg-[#f3ba2f] text-black' : 'bg-[#3d4046] text-gray-500'
          }`}
        >
          {i}
        </div>
      ))}
    </div>
  );
}

export default function AdminDailyPatternPage() {
  const showToast = useToast();
  const [pattern, setPattern] = useState('');
  const [patternDisplay, setPatternDisplay] = useState('');
  const [reward, setReward] = useState<number>(PATTERN_DOTS_REWARD);
  const [enabled, setEnabled] = useState(true);
  const [overrideInput, setOverrideInput] = useState('');
  const [rewardInput, setRewardInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchToday = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/daily-pattern', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setPattern(data.pattern ?? '');
      setPatternDisplay(data.patternDisplay ?? data.pattern ?? '');
      setReward(typeof data.reward === 'number' ? data.reward : PATTERN_DOTS_REWARD);
      setEnabled(data.enabled !== false);
    } catch (e) {
      showToast('Failed to load today\'s pattern', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleSetEnabled = async (value: boolean) => {
    setToggling(true);
    try {
      const res = await fetch('/api/admin/daily-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setEnabled', enabled: value }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setEnabled(!!data.enabled);
      showToast(data.enabled ? 'Game is now visible to users' : 'Game is now hidden from users', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setToggling(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const handleSetOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = overrideInput.trim();
    if (!trimmed) {
      showToast(`Enter a pattern (${PATTERN_MIN_DOTS}–${PATTERN_MAX_DOTS} dots, indices 0–${PATTERN_GRID_SIZE - 1})`, 'error');
      return;
    }
    const rewardNum = rewardInput.trim() !== '' ? parseFloat(rewardInput) : undefined;
    if (rewardNum !== undefined && (Number.isNaN(rewardNum) || rewardNum < 0)) {
      showToast('Reward must be a non-negative number', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/daily-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setOverride', pattern: trimmed, reward: rewardNum }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setPattern(data.pattern ?? '');
      setPatternDisplay(data.patternDisplay ?? data.pattern ?? '');
      if (typeof data.reward === 'number') setReward(data.reward);
      setOverrideInput('');
      setRewardInput('');
      showToast('Override set for today', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1d2025] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="text-[#f3ba2f] hover:underline mb-4 inline-block">← Back to Admin</Link>
        <h1 className="text-3xl font-bold text-[#f3ba2f] mb-2">Daily Pattern</h1>
        <p className="text-gray-400 mb-6">
          Today&apos;s correct pattern for the 12-dot minigame (Earn → Daily Pattern). Today&apos;s reward: {reward.toLocaleString()} ALM. Pattern rotates automatically each day (UTC).
        </p>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <>
            <div className="bg-[#272a2f] p-6 rounded-xl mb-6">
              <h2 className="text-lg font-semibold mb-2">Game visibility</h2>
              <p className="text-sm text-gray-400 mb-3">
                {enabled ? 'Daily Pattern is visible on Earn (Daily Pattern card).' : 'Daily Pattern is hidden from users.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleSetEnabled(true)}
                  disabled={toggling || enabled}
                  className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {toggling ? '…' : 'Enable game'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSetEnabled(false)}
                  disabled={toggling || !enabled}
                  className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-rose-600 hover:bg-rose-500 text-white"
                >
                  {toggling ? '…' : 'Disable game'}
                </button>
              </div>
            </div>

            <div className="bg-[#272a2f] p-6 rounded-xl mb-6">
              <h2 className="text-lg font-semibold mb-2">Today&apos;s pattern (UTC)</h2>
              <p className="text-sm text-gray-400 mb-3">Sequence: {patternDisplay || '—'} · Reward: {reward.toLocaleString()} ALM</p>
              <PatternGrid pattern={pattern} />
            </div>

            <div className="bg-[#272a2f] p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-2">Override for today</h2>
              <p className="text-sm text-gray-400 mb-3">Set any pattern ({PATTERN_MIN_DOTS}–{PATTERN_MAX_DOTS} dots, indices 0–{PATTERN_GRID_SIZE - 1}) and optional reward (ALM). Leave reward empty to keep default.</p>
              <form onSubmit={handleSetOverride} className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    value={overrideInput}
                    onChange={(e) => setOverrideInput(e.target.value)}
                    placeholder={`0-1-2-4-5-6-8-9 (${PATTERN_MIN_DOTS}–${PATTERN_MAX_DOTS} dots)`}
                    className="flex-1 min-w-[200px] bg-[#1d2025] border border-[#3d4046] rounded-lg px-3 py-2 text-white font-mono"
                  />
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={rewardInput}
                    onChange={(e) => setRewardInput(e.target.value)}
                    placeholder="Reward (ALM)"
                    className="w-36 bg-[#1d2025] border border-[#3d4046] rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#f3ba2f] text-black font-semibold rounded-lg disabled:opacity-50">
                  {submitting ? 'Setting…' : 'Set override'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
