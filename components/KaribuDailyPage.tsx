'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import IceCube from '@/icons/IceCube';
import { useGameStore } from '@/utils/game-mechanics';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';
import { pearlWhite } from '@/images';
import { notifyPearlBalancesRefresh } from '@/utils/pearl-balance-events';
import type { DailyRewardStatus } from '@/utils/karibu-daily-ui';
import { getKaribuDayState } from '@/utils/karibu-daily-ui';
import { consumeKaribuDailyBack } from '@/utils/karibu-navigation';

interface KaribuDailyPageProps {
  setCurrentView: (view: string) => void;
}

export default function KaribuDailyPage({ setCurrentView }: KaribuDailyPageProps) {
  const { userTelegramInitData, incrementPoints, setPoints, setPointsBalance } = useGameStore();
  const [status, setStatus] = useState<DailyRewardStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const showToast = useToast();

  const fetchStatus = useCallback(async () => {
    if (!userTelegramInitData) return;
    try {
      const res = await fetch(
        `/api/daily-reward?initData=${encodeURIComponent(userTelegramInitData)}`
      );
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [userTelegramInitData]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onRefresh = () => {
      void fetchStatus();
    };
    window.addEventListener('karibu-daily-status-changed', onRefresh);
    return () => window.removeEventListener('karibu-daily-status-changed', onRefresh);
  }, [fetchStatus]);

  const handleClose = () => {
    triggerHapticFeedback(window);
    const v = consumeKaribuDailyBack();
    setCurrentView(v);
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
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="karibu-daily-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[#8bb4ef]/40 border-t-[3px] border-t-[#f3ba2f] bg-gradient-to-b from-[#0f315f] to-[#061428] shadow-[0_20px_48px_rgba(0,0,0,0.45)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#123f78]/80 flex items-center justify-center ring-2 ring-[#f3ba2f]/40 shrink-0">
              <Image src={pearlWhite} alt="" width={22} height={22} className="rounded" />
            </div>
            <div className="min-w-0">
              <h2 id="karibu-daily-title" className="text-base font-bold text-white leading-tight">
                Karibu Daily
              </h2>
              <p className="text-[11px] text-blue-100/70 mt-0.5">Days 1–10 · miss a day and streak resets</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-xl border border-[#8bb4ef]/35 w-9 h-9 flex items-center justify-center text-blue-100 hover:bg-white/10 hover:border-[#f3ba2f]/40 transition-colors text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="px-3.5 py-3.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-2 border-[#f3ba2f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-1.5">
                {status?.rewards.map((reward, dayIndex) => {
                  const state = getKaribuDayState(dayIndex, status);
                  const isClaimed = state === 'claimed';
                  const isToday = state === 'today';
                  const isFuture = state === 'future';
                  const canClaim = isToday && status.canClaimToday && !status.claimedToday;

                  return (
                    <button
                      key={dayIndex}
                      type="button"
                      disabled={!canClaim || isClaiming}
                      onClick={() => {
                        if (canClaim) void handleClaim();
                      }}
                      className={`
                        relative rounded-lg px-1 py-2 flex flex-col items-center justify-center min-h-[68px]
                        transition-all duration-200
                        ${isClaimed ? 'bg-emerald-500/15 border border-emerald-500/30' : ''}
                        ${isToday && canClaim ? 'bg-gradient-to-b from-amber-500/25 to-[#f3ba2f]/15 border-2 border-[#f3ba2f] shadow-md shadow-amber-500/20 pulse-animation' : ''}
                        ${isToday && status.claimedToday ? 'bg-emerald-500/15 border border-emerald-500/30' : ''}
                        ${isFuture ? 'bg-[#0a1f3d]/80 border border-[#8bb4ef]/25 opacity-55' : ''}
                        ${canClaim ? 'cursor-pointer active:scale-[0.97]' : 'cursor-default'}
                      `}
                    >
                      <span
                        className={`text-[10px] font-semibold mb-0.5 ${
                          isClaimed
                            ? 'text-emerald-400'
                            : isToday && canClaim
                              ? 'text-amber-300'
                              : isFuture
                                ? 'text-gray-500'
                                : 'text-white'
                        }`}
                      >
                        Day {dayIndex + 1}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <IceCube className={`w-3 h-3 ${isFuture ? 'opacity-50' : ''}`} />
                        <span className={`text-[11px] font-bold ${isFuture ? 'text-gray-500' : 'text-white'}`}>
                          {formatNumber(reward)}
                        </span>
                      </div>
                      {isClaimed && (
                        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500/90 flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {canClaim && (
                        <span className="mt-1 text-[9px] font-bold text-[#0a1628] bg-[#f3ba2f] rounded px-1 py-0.5">
                          {isClaiming ? '…' : 'Claim'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {status?.claimedToday && (
                <p className="text-center text-emerald-400 text-xs mt-3 font-medium">
                  Come back tomorrow for the next reward!
                </p>
              )}
              {status && !status.claimedToday && status.canClaimToday && (
                <p className="text-center text-amber-300 text-xs mt-3 font-medium">
                  Tap Day {status.currentStreakDay + 1} to claim today&apos;s pearls.
                </p>
              )}
              {status && !status.claimedToday && !status.canClaimToday && (
                <p className="text-center text-gray-400 text-xs mt-3">Unable to load claim status. Try again later.</p>
              )}
              {!status && !isLoading && (
                <p className="text-center text-gray-400 text-xs mt-3">Could not load Karibu Daily.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
