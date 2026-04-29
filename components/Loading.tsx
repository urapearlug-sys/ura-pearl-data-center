// components/Loading.tsx

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

'use client'

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { botUrlQr, uraLanding } from '@/images';
import IceCube from '@/icons/IceCube';
import { calculateEnergyLimit, calculateLevelIndex, calculatePointsPerClick, calculateProfitPerHour, GameState, InitialGameState, useGameStore } from '@/utils/game-mechanics';
import WebApp from '@twa-dev/sdk';
import UAParser from 'ua-parser-js';
import Link from 'next/link';
import { ALLOW_ALL_DEVICES } from '@/utils/consts';
import { hasAcceptedLegal, setLegalAccepted } from '@/utils/legal-acceptance';
import { triggerHapticFeedback } from '@/utils/ui';

interface LoadingProps {
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentView: (view: string) => void;
}

export default function Loading({ setIsInitialized, setCurrentView }: LoadingProps) {
  const initializeState = useGameStore((state: GameState) => state.initializeState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const openTimestampRef = useRef(Date.now());
  const hasInitializedRef = useRef(false);
  const [isAppropriateDevice, setIsAppropriateDevice] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchOrCreateUser = useCallback(async () => {
    setLoadError(null);
    try {
      let initData: string | undefined, telegramId, username, telegramName: string | undefined, startParam;

      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        initData = WebApp.initData;
        telegramId = WebApp.initDataUnsafe.user?.id.toString();
        username = WebApp.initDataUnsafe.user?.username || 'Unknown User';
        telegramName = WebApp.initDataUnsafe.user?.first_name || 'Unknown User';
        startParam = WebApp.initDataUnsafe.start_param;
        // Fallback: referral link may pass startapp in URL when opening the app
        if (!startParam && window.location?.search) {
          const params = new URLSearchParams(window.location.search);
          startParam = params.get('startapp') ?? params.get('start_param') ?? undefined;
        }
      }

      const normalizedStartParam = startParam ? String(startParam).trim() : '';
      const referrerTelegramId = normalizedStartParam
        ? normalizedStartParam.replace(/^(kentId|ref_)/i, '').trim() || null
        : null;

      if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
        initData = "temp";
      } else if (!initData && process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH !== 'false') {
        initData = "temp";
      }

      const apiUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/user` : '/api/user';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramInitData: initData || '',
          referrerTelegramId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = typeof data?.message === 'string' ? data.message : (typeof data?.error === 'string' ? data.error : `Request failed (${response.status})`);
        throw new Error(msg);
      }

      const userData = data;

      if (!initData) {
        throw new Error('initData is undefined');
      }
      if (!telegramName) {
        throw new Error('telegramName is undefined');
      }

      // Restore any pending points and totalTaps that weren't synced before close (same persistence as Settings/notifications)
      let unsynchronizedPoints = 0;
      let restoredTotalTaps: number | null = null;
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('clicker_pending_sync') : null;
        if (raw) {
          const saved = JSON.parse(raw) as { unsynchronizedPoints?: number; totalTaps?: number; savedAt?: number };
          const age = saved.savedAt != null ? Date.now() - saved.savedAt : Infinity;
          if (age < 5 * 60 * 1000 && typeof saved.unsynchronizedPoints === 'number' && saved.unsynchronizedPoints > 0) {
            unsynchronizedPoints = saved.unsynchronizedPoints;
            if (typeof saved.totalTaps === 'number') restoredTotalTaps = saved.totalTaps;
          }
          localStorage.removeItem('clicker_pending_sync');
        }
      } catch { /* ignore */ }

      const serverTotalTaps = typeof userData.totalTaps === 'number' ? userData.totalTaps : 0;
      const totalTaps = restoredTotalTaps != null ? restoredTotalTaps : serverTotalTaps;

      const initialState: InitialGameState = {
        userTelegramInitData: initData,
        userTelegramName: telegramName,
        lastClickTimestamp: userData.lastPointsUpdateTimestamp,
        gameLevelIndex: calculateLevelIndex(userData.points, totalTaps),
        points: userData.points,
        pointsBalance: userData.pointsBalance,
        totalTaps,
        unsynchronizedPoints,
        multitapLevelIndex: userData.multitapLevelIndex,
        pointsPerClick: calculatePointsPerClick(userData.multitapLevelIndex),
        energy: userData.energy,
        maxEnergy: calculateEnergyLimit(userData.energyLimitLevelIndex),
        energyRefillsLeft: userData.energyRefillsLeft,
        energyLimitLevelIndex: userData.energyLimitLevelIndex,
        lastEnergyRefillTimestamp: userData.lastEnergyRefillsTimestamp,
        mineLevelIndex: userData.mineLevelIndex,
        profitPerHour: calculateProfitPerHour(userData.mineLevelIndex),
        tonWalletAddress: userData?.tonWalletAddress,
        totalDonatedPoints: typeof userData.totalDonatedPoints === 'number' ? userData.totalDonatedPoints : 0,
        isFrozen: Boolean(userData.isFrozen),
        suspensionReason: typeof userData.suspensionReason === 'string' ? userData.suspensionReason : null,
      };

      // Only initialize state once. A second run (e.g. Strict Mode or effect re-run) would
      // overwrite with server data that doesn't include taps yet and make new users' tap points disappear.
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        initializeState(initialState);
      }
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      const message = error instanceof Error ? error.message : 'Connection failed. Check your network.';
      setLoadError(message);
    }
  }, [initializeState]);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    fetchOrCreateUser().finally(() => setIsRetrying(false));
  }, [fetchOrCreateUser]);

  useEffect(() => {
    const parser = new UAParser();
    const device = parser.getDevice();
    const isAppropriate = ALLOW_ALL_DEVICES || device.type === 'mobile' || device.type === 'tablet';
    setIsAppropriateDevice(isAppropriate);

    if (isAppropriate) {
      fetchOrCreateUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOrCreateUser]);

  useEffect(() => {
    if (isDataLoaded && hasAcceptedLegal()) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - openTimestampRef.current;
      const remainingTime = Math.max(3000 - elapsedTime, 0);

      const timer = setTimeout(() => {
        setCurrentView('game');
        setIsInitialized(true);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isDataLoaded, setIsInitialized, setCurrentView]);

  if (!isAppropriateDevice) {
    return (
      <div className="bg-[#1d2025] flex justify-center items-center h-screen">
        <div className="w-full max-w-xl text-white flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Play on your mobile</h1>
          <Image
            className="bg-white p-2 rounded-xl"
            src={botUrlQr}
            alt="QR Code"
            width={200}
            height={200}
          />
          <p className="mt-4">@{process.env.NEXT_PUBLIC_BOT_USERNAME || 'bot'}</p>
          <p className="mt-2">Developed by Nikandr Surkov</p>
        </div>
      </div>
    );
  }

  if (isDataLoaded && !hasAcceptedLegal()) {
    return (
      <div className="bg-[#1d2025] flex justify-center items-center min-h-screen px-4">
        <div className="w-full max-w-xl text-white flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to AfroLumens</h1>
          <p className="text-gray-400 text-sm mb-6">
            Please read and accept our Privacy Policy and Terms of Service to continue.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs mb-6">
            <Link
              href="/clicker/privacy"
              onClick={() => triggerHapticFeedback(window)}
              className="py-3 px-4 rounded-xl bg-[#272a2f] border border-[#3d4046] text-[#f3ba2f] font-medium text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/clicker/terms"
              onClick={() => triggerHapticFeedback(window)}
              className="py-3 px-4 rounded-xl bg-[#272a2f] border border-[#3d4046] text-[#f3ba2f] font-medium text-sm"
            >
              Terms of Service
            </Link>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              setLegalAccepted();
              setCurrentView('game');
              setIsInitialized(true);
            }}
            className="w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-[#f3ba2f] to-amber-500 text-black font-bold"
          >
            I Accept
          </button>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-[#1d2025] flex justify-center items-center min-h-screen px-4 py-8">
        <div className="w-full max-w-xl text-white flex flex-col items-center text-center">
          <div className="w-64 h-64 rounded-full circle-outer p-2 mb-6">
            <div className="w-full h-full rounded-full circle-inner overflow-hidden relative">
              <Image src={uraLanding} alt="URA Landing" fill style={{ objectFit: 'cover', objectPosition: 'center' }} />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Unable to load</h1>
          <p className="text-gray-400 text-sm mb-4 max-w-md">{loadError}</p>
          <p className="text-gray-500 text-xs mb-6">Open from Telegram or check your connection. If it still fails, the server or database may be unavailable.</p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full max-w-xs px-6 py-3 bg-[#272a2f] border border-[#3d4046] text-gray-200 font-semibold rounded-xl hover:bg-[#2d3038] disabled:opacity-50 transition-colors mb-4"
          >
            {isRetrying ? 'Retrying…' : 'Retry'}
          </button>
          <div className="w-full max-w-xs border-t border-[#3d4046] pt-6 mt-2">
            <p className="text-gray-400 text-sm mb-3">Accept terms and continue to the app</p>
            <div className="flex flex-col gap-3 mb-4">
              <Link
                href="/clicker/privacy"
                onClick={() => triggerHapticFeedback(window)}
                className="py-2.5 px-4 rounded-xl bg-[#272a2f] border border-[#3d4046] text-[#f3ba2f] font-medium text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/clicker/terms"
                onClick={() => triggerHapticFeedback(window)}
                className="py-2.5 px-4 rounded-xl bg-[#272a2f] border border-[#3d4046] text-[#f3ba2f] font-medium text-sm"
              >
                Terms of Service
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(window);
                setLegalAccepted();
                handleRetry();
              }}
              disabled={isRetrying}
              className="w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-[#f3ba2f] to-amber-500 text-black font-bold disabled:opacity-50 hover:opacity-95 transition-opacity"
            >
              I Accept and continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Image src={uraLanding} alt="URA Landing" fill priority style={{ objectFit: 'cover', objectPosition: 'center' }} />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Loading URA PEARLS Platform</h1>
        <div className="flex items-center gap-2" aria-label="Loading">
          <span className="h-3 w-3 rounded-full bg-[#f3ba2f] animate-bounce [animation-delay:0ms]" />
          <span className="h-3 w-3 rounded-full bg-[#f3ba2f] animate-bounce [animation-delay:150ms]" />
          <span className="h-3 w-3 rounded-full bg-[#f3ba2f] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}