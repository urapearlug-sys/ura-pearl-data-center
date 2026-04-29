// components/popups/StakingPopup.tsx

/**
 * Staking - lock points for duration, get bonus on unlock
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import IceCubes from '@/icons/IceCubes';
import { useGameStore } from '@/utils/game-mechanics';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';
import { STAKING_PACKAGES } from '@/utils/consts';

interface StakeItem {
  id: string;
  amountLocked: number;
  bonusPercent: number;
  duration: string;
  lockedAt: string;
  unlocksAt: string;
  claimedAt: string | null;
  bonusAmount: number;
  totalReturn: number;
}

interface StakingPopupProps {
  onClose: () => void;
}

function formatTimeLeft(unlocksAt: string): string {
  const diff = new Date(unlocksAt).getTime() - Date.now();
  if (diff <= 0) return 'Ready';
  const h = Math.floor(diff / (60 * 60 * 1000));
  const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  return `${h}h ${m}m`;
}

export default function StakingPopup({ onClose }: StakingPopupProps) {
  const { userTelegramInitData, pointsBalance, setPointsBalance, incrementPoints, setPoints } = useGameStore();
  const [stakes, setStakes] = useState<StakeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('7d');
  const [isStaking, setIsStaking] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const showToast = useToast();

  const fetchStakes = useCallback(async () => {
    if (!userTelegramInitData) return;
    try {
      const res = await fetch(`/api/staking?initData=${encodeURIComponent(userTelegramInitData)}`);
      if (res.ok) {
        const data = await res.json();
        setStakes(data.stakes ?? []);
        if (data.pointsBalance != null) setPointsBalance(data.pointsBalance);
      }
    } catch {
      setStakes([]);
    } finally {
      setIsLoading(false);
    }
  }, [userTelegramInitData, setPointsBalance]);

  useEffect(() => {
    fetchStakes();
  }, [fetchStakes]);

  // Refresh countdown every 30s
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const durationConfig = STAKING_PACKAGES.find((d) => d.id === selectedDuration);
  const bonusAmount = durationConfig
    ? Math.floor((Number(stakeAmount) || 0) * durationConfig.bonusPercent / 100)
    : 0;
  const totalReturn = (Number(stakeAmount) || 0) + bonusAmount;

  const minAmountForPackage = durationConfig?.minAmount ?? 1_000;

  const handleStake = async () => {
    const amt = Math.floor(Number(stakeAmount));
    if (!userTelegramInitData || amt < minAmountForPackage || amt > pointsBalance || isStaking) return;
    setIsStaking(true);
    triggerHapticFeedback(window);
    try {
      const res = await fetch('/api/staking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: userTelegramInitData,
          action: 'stake',
          amount: amt,
          duration: selectedDuration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Stake failed');
      setPointsBalance(data.pointsBalance);
      setStakeAmount('');
      showToast(`Staked ${formatNumber(amt)} ALM for ${durationConfig?.label}. +${formatNumber(bonusAmount)} bonus when unlocked!`, 'success');
      fetchStakes();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Stake failed', 'error');
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaim = async (stakeId: string) => {
    if (!userTelegramInitData || claimingId) return;
    setClaimingId(stakeId);
    triggerHapticFeedback(window);
    try {
      const res = await fetch('/api/staking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: userTelegramInitData,
          action: 'claim',
          stakeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.message || data.error || 'Claim failed';
        throw new Error(msg);
      }
      incrementPoints(data.reward);
      if (data.points != null) setPoints(data.points);
      if (data.pointsBalance != null) setPointsBalance(data.pointsBalance);
      showToast(`+${formatNumber(data.reward)} ALM claimed!`, 'success');
      fetchStakes();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Claim failed', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  const handleClose = () => {
    triggerHapticFeedback(window);
    onClose();
  };

  const activeStakes = stakes.filter((s) => !s.claimedAt);
  const claimedStakes = stakes.filter((s) => s.claimedAt);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
      <div className="bg-[#1d2025] rounded-t-3xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
        <div className="px-5 pt-6 pb-4 flex justify-between items-start flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Stake ALM</h2>
            <p className="text-sm text-gray-400">Lock points, earn bonus on unlock</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl w-8 h-8">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8">
          <div className="bg-[#272a2f] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Available</span>
              <span className="text-[#f3ba2f] font-bold flex items-center gap-1">
                <IceCubes className="w-5 h-5" />
                {formatNumber(Math.floor(pointsBalance))}
              </span>
            </div>
          </div>

          <div className="bg-[#272a2f] rounded-xl p-4 mb-4">
            <h3 className="text-base font-bold text-emerald-400 mb-3">Stake ALM</h3>
            <p className="text-sm text-gray-400 mb-3">Minimum lock period is 1 week. Choose amount and duration.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {STAKING_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedDuration(pkg.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDuration === pkg.id ? 'bg-emerald-500 text-white' : 'bg-[#3d4046] text-gray-300 hover:bg-[#4d5056]'}`}
                  title={`Min ${formatNumber(pkg.minAmount)} ALM`}
                >
                  {pkg.label} (min {formatNumber(pkg.minAmount)})
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center mb-3">
              <input
                type="number"
                min={minAmountForPackage}
                placeholder={`Min ${formatNumber(minAmountForPackage)} ALM`}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="flex-1 bg-[#1d2025] border border-[#3d4046] rounded-lg px-3 py-2 text-white"
              />
              <button
                type="button"
                onClick={handleStake}
                disabled={isStaking || !stakeAmount || Number(stakeAmount) < minAmountForPackage || Number(stakeAmount) > pointsBalance}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600"
              >
                {isStaking ? '...' : 'Stake ALM'}
              </button>
            </div>
            {durationConfig && Number(stakeAmount) >= minAmountForPackage && (
              <p className="text-sm text-gray-400">
                +{formatNumber(bonusAmount)} ALM bonus ({durationConfig.bonusPercent}%) → you receive {formatNumber(totalReturn)} ALM when unlocked.
              </p>
            )}
          </div>

          {activeStakes.length > 0 && (
            <>
              <h3 className="text-base font-bold text-white mb-3">Active stakes</h3>
              <div className="space-y-2 mb-4">
                {activeStakes.map((s) => {
                  const isReady = new Date(s.unlocksAt) <= new Date();
                  return (
                    <div key={s.id} className="bg-[#272a2f] rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold">{formatNumber(s.amountLocked)} ALM</p>
                        <p className="text-sm text-gray-400">
                          {isReady ? (
                            <span className="text-emerald-400">Ready to claim</span>
                          ) : (
                            <span>Unlocks in {formatTimeLeft(s.unlocksAt)}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">You receive</p>
                        <p className="text-[#f3ba2f] font-bold">{formatNumber(s.totalReturn)} ALM</p>
                        {isReady ? (
                          <button
                            onClick={() => handleClaim(s.id)}
                            disabled={claimingId === s.id}
                            className="mt-1 px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-bold disabled:opacity-50"
                          >
                            {claimingId === s.id ? '...' : `Claim ${formatNumber(s.totalReturn)} ALM`}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {claimedStakes.length > 0 && (
            <>
              <h3 className="text-base font-bold text-gray-400 mb-2">Claimed</h3>
              <div className="space-y-2">
                {claimedStakes.slice(0, 5).map((s) => (
                  <div key={s.id} className="bg-[#272a2f]/60 rounded-xl p-3 flex justify-between items-center opacity-75">
                    <span className="text-gray-400">{formatNumber(s.amountLocked)} ALM</span>
                    <span className="text-emerald-500 text-sm">Claimed</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
