// components/popups/DailyLoginPopup.tsx

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

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import IceCube from '@/icons/IceCube';
import { useGameStore } from '@/utils/game-mechanics';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';
import { dailyReward } from '@/images';
import { notifyPearlBalancesRefresh } from '@/utils/pearl-balance-events';

export interface DailyRewardStatus {
  canClaimToday: boolean;
  claimedToday: boolean;
  currentStreakDay: number;
  lastDailyRewardClaimedAt: string | null;
  rewards: number[];
}

interface DailyLoginPopupProps {
  onClose: () => void;
}

export default function DailyLoginPopup({ onClose }: DailyLoginPopupProps) {
  const { userTelegramInitData, incrementPoints, setPoints, setPointsBalance } = useGameStore();
  const [status, setStatus] = useState<DailyRewardStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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
      showToast(`+${formatNumber(data.claimedReward)} PEARLS claimed!`, 'success');
      notifyPearlBalancesRefresh();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Claim failed', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClose = () => {
    triggerHapticFeedback(window);
    setIsClosing(true);
    setTimeout(onClose, 280);
  };

  const getDayState = (dayIndex: number): 'claimed' | 'today' | 'future' => {
    if (!status) return 'future';
    const { currentStreakDay, claimedToday } = status;
    const todayClaimedIndex = currentStreakDay === 0 ? 9 : currentStreakDay - 1;
    if (dayIndex < currentStreakDay) return 'claimed';
    if (claimedToday && dayIndex === todayClaimedIndex) return 'claimed';
    if (dayIndex === currentStreakDay && !claimedToday) return 'today';
    return 'future';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
        <div className="bg-[#1d2025] rounded-t-3xl p-6 w-full max-w-xl min-h-[320px] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#f3ba2f] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
      <div
        className={`bg-[#1d2025] rounded-t-3xl w-full max-w-xl overflow-hidden ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}
      >
        <div className="bg-gradient-to-b from-[#2a2d33] to-[#1d2025] px-5 pt-6 pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#272a2f] flex items-center justify-center ring-2 ring-[#f3ba2f]/40">
                <Image src={dailyReward} alt="Karibu Daily" width={28} height={28} className="rounded" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Karibu Daily</h2>
                <p className="text-sm text-gray-400">Log in 10 days in a row for bigger rewards</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="px-4 pb-8 pt-2">
          <div className="grid grid-cols-5 gap-2">
            {status?.rewards.map((reward, dayIndex) => {
              const state = getDayState(dayIndex);
              const isClaimed = state === 'claimed';
              const isToday = state === 'today';
              const isFuture = state === 'future';
              const canClaim = isToday && status.canClaimToday && !status.claimedToday;

              return (
                <div
                  key={dayIndex}
                  className={`
                    relative rounded-xl p-3 flex flex-col items-center justify-center min-h-[72px]
                    transition-all duration-200
                    ${isClaimed ? 'bg-emerald-500/15 border border-emerald-500/30' : ''}
                    ${isToday && canClaim ? 'bg-gradient-to-b from-amber-500/25 to-[#f3ba2f]/15 border-2 border-[#f3ba2f] shadow-lg shadow-amber-500/20 pulse-animation' : ''}
                    ${isToday && status.claimedToday ? 'bg-emerald-500/15 border border-emerald-500/30' : ''}
                    ${isFuture ? 'bg-[#272a2f]/80 border border-[#3d4046] opacity-60' : ''}
                  `}
                >
                  <span
                    className={`text-xs font-semibold mb-0.5 ${isClaimed ? 'text-emerald-400' : isToday && canClaim ? 'text-amber-300' : isFuture ? 'text-gray-500' : 'text-white'}`}
                  >
                    Day {dayIndex + 1}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <IceCube className={`w-4 h-4 ${isFuture ? 'opacity-50' : ''}`} />
                    <span
                      className={`text-sm font-bold ${isFuture ? 'text-gray-500' : 'text-white'}`}
                    >
                      {formatNumber(reward)}
                    </span>
                  </div>
                  {isClaimed && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500/90 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {canClaim && (
                    <button
                      onClick={handleClaim}
                      disabled={isClaiming}
                      className="mt-2 w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-[#f3ba2f] text-black text-xs font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isClaiming ? (
                        <span className="inline-block w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        'Claim'
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {status?.claimedToday && (
            <p className="text-center text-emerald-400 text-sm mt-4 font-medium">
              Come back tomorrow for the next reward!
            </p>
          )}
          {status && !status.claimedToday && status.canClaimToday && (
            <p className="text-center text-amber-300 text-sm mt-4 font-medium">
              Tap Claim to get your Day {status.currentStreakDay + 1} reward
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
