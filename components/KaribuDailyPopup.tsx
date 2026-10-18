'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import IceCube from '@/icons/IceCube';
import { useGameStore } from '@/utils/game-mechanics';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';
import { pearlWhite } from '@/images';
import { notifyPearlBalancesRefresh } from '@/utils/pearl-balance-events';
import type { DailyRewardStatus } from '@/utils/karibu-daily-ui';
import { getKaribuDayState } from '@/utils/karibu-daily-ui';

type Props = {
  onClose: () => void;
};

export default function KaribuDailyPopup({ onClose }: Props) {
  const { userTelegramInitData, incrementPoints, setPoints, setPointsBalance } = useGameStore();
  const [status, setStatus] = useState<DailyRewardStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const showToast = useToast();

  const fetchStatus = useCallback(async () => {
    if (!userTelegramInitData) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/daily-reward?initData=${encodeURIComponent(userTelegramInitData)}`
      );
      if (!res.ok) throw new Error('Failed to load');
      setStatus(await res.json());
    } catch {
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [userTelegramInitData]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleClose = () => {
    triggerHapticFeedback(window);
    onClose();
  };

  const handleClaim = async () => {
    if (!userTelegramInitData || !status?.canClaimToday || isClaiming) return;
    setIsClaiming(true);
    triggerHapticFeedback(window);
    try {
      const res = await fetch('/api/daily-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: userTelegramInitData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Claim failed');
      incrementPoints(data.claimedReward);
      if (data.points != null) setPoints(data.points);
      if (data.pointsBalance != null) setPointsBalance(data.pointsBalance);
      if (data.status) setStatus(data.status);
      showToast(`+${formatNumber(data.claimedReward)} white pearls claimed!`, 'success');
      notifyPearlBalancesRefresh();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('karibu-daily-status-changed'));
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Claim failed', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="karibu-daily-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--ura-yellow)]/40 border-t-[3px] border-t-[var(--ura-yellow)] bg-gradient-to-b from-[#0f315f] to-[#061428] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 px-3.5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-[var(--ura-yellow)]/40 shrink-0">
              <Image src={pearlWhite} alt="" width={22} height={22} className="rounded" />
            </div>
            <div className="min-w-0">
              <h2 id="karibu-daily-title" className="text-base font-extrabold text-white leading-tight">
                Karibu Daily
              </h2>
              <p className="text-[11px] text-blue-100/70 truncate">Day 1–10 · claim white pearls</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-xl border border-[#8bb4ef]/40 px-3 py-1.5 text-sm font-semibold text-blue-50 hover:bg-white/10 hover:border-[var(--ura-yellow)]/45"
          >
            Close
          </button>
        </div>

        <div className="px-3.5 py-3.5">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 rounded-full border-2 border-[var(--ura-yellow)]/30 border-t-[var(--ura-yellow)] animate-spin" />
            </div>
          ) : !status ? (
            <p className="text-center text-sm text-blue-100/70 py-6">
              {userTelegramInitData
                ? 'Could not load Karibu Daily. Try again later.'
                : 'Open URAPearls from Telegram to claim.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-1.5">
                {status.rewards.map((reward, dayIndex) => {
                  const state = getKaribuDayState(dayIndex, status);
                  const isClaimed = state === 'claimed';
                  const isToday = state === 'today';
                  const isFuture = state === 'future';
                  const canClaim = isToday && status.canClaimToday && !status.claimedToday;

                  return (
                    <div
                      key={dayIndex}
                      className={`relative rounded-xl px-1 py-2 flex flex-col items-center justify-center min-h-[72px] ${
                        isClaimed
                          ? 'bg-emerald-500/15 border border-emerald-500/35'
                          : canClaim
                            ? 'bg-gradient-to-b from-amber-500/25 to-[#f3ba2f]/15 border-2 border-[#f3ba2f] shadow-md shadow-amber-500/15'
                            : isToday && status.claimedToday
                              ? 'bg-emerald-500/15 border border-emerald-500/35'
                              : 'bg-[#0a1628]/80 border border-[#8bb4ef]/25 opacity-70'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold mb-0.5 ${
                          canClaim ? 'text-amber-300' : isClaimed ? 'text-emerald-400' : 'text-blue-100/80'
                        }`}
                      >
                        D{dayIndex + 1}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <IceCube className={`w-3.5 h-3.5 ${isFuture ? 'opacity-50' : ''}`} />
                        <span className={`text-[11px] font-bold tabular-nums ${isFuture ? 'text-gray-500' : 'text-white'}`}>
                          {formatNumber(reward)}
                        </span>
                      </div>
                      {isClaimed ? (
                        <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : null}
                      {canClaim ? (
                        <button
                          type="button"
                          onClick={() => void handleClaim()}
                          disabled={isClaiming}
                          className="mt-1.5 w-full py-1 rounded-md bg-gradient-to-r from-amber-500 to-[#f3ba2f] text-black text-[10px] font-extrabold disabled:opacity-50"
                        >
                          {isClaiming ? '…' : 'Claim'}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-center text-[11px] text-blue-100/65 leading-snug">
                {status.claimedToday
                  ? 'Claimed today — come back tomorrow for the next day.'
                  : status.canClaimToday
                    ? `Claim Day ${status.currentStreakDay + 1} to collect today’s pearls.`
                    : 'Miss a day and the streak resets.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
