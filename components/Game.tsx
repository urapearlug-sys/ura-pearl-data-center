// components/Game.tsx

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

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { binanceLogo, dailyCipher, dailyCombo, dailyReward, dollarCoin, lightning, total } from '@/images';
import IceCube from '@/icons/IceCube';
import Rocket from '@/icons/Rocket';
import Energy from '@/icons/Energy';
import Link from 'next/link';
import { useGameStore } from '@/utils/game-mechanics';
import Snowflake from '@/icons/Snowflake';
import TopInfoSection from '@/components/TopInfoSection';
import NotificationBanner from '@/components/NotificationBanner';
import MyProgressModal from '@/components/popups/MyProgressModal';
import HowToPlayPopup from '@/components/popups/HowToPlayPopup';
import CongratulationsBanner from '@/components/CongratulationsBanner';
import { LEVELS } from '@/utils/consts';
import { triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';
import type { DailyRewardStatus } from '@/utils/karibu-daily-ui';
import { karibuDaysCompleted } from '@/utils/karibu-daily-ui';
import { navigateToKaribuDaily } from '@/utils/karibu-navigation';

interface GameProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Game({ currentView, setCurrentView }: GameProps) {
  const showToast = useToast();

  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);

  useEffect(() => {
    const storedAnimation = localStorage.getItem('animationEnabled');
    setIsAnimationEnabled(storedAnimation !== 'false');
  }, []);

  const handleViewChange = (view: string) => {
    console.log('Attempting to change view to:', view);
    if (typeof setCurrentView === 'function') {
      try {
        triggerHapticFeedback(window);
        setCurrentView(view);
        console.log('View change successful');
      } catch (error) {
        console.error('Error occurred while changing view:', error);
      }
    } else {
      console.error('setCurrentView is not a function:', setCurrentView);
    }
  };

  const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);

  const {
    points,
    pointsBalance,
    pointsPerClick,
    energy,
    maxEnergy,
    gameLevelIndex,
    clickTriggered,
    updateLastClickTimestamp,
    userTelegramInitData,
    isFrozen,
    suspensionReason,
  } = useGameStore();

  const [showMyProgress, setShowMyProgress] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [karibuStatus, setKaribuStatus] = useState<DailyRewardStatus | null>(null);

  const fetchKaribuDaily = useCallback(async () => {
    if (!userTelegramInitData) return;
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch(
        `${base}/api/daily-reward?initData=${encodeURIComponent(userTelegramInitData)}`
      );
      const data = await res.json();
      if (res.ok) setKaribuStatus(data);
    } catch {
      // ignore
    }
  }, [userTelegramInitData]);

  useEffect(() => {
    void fetchKaribuDaily();
  }, [fetchKaribuDaily]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onRefresh = () => {
      void fetchKaribuDaily();
    };
    window.addEventListener('karibu-daily-status-changed', onRefresh);
    return () => window.removeEventListener('karibu-daily-status-changed', onRefresh);
  }, [fetchKaribuDaily]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem('openHowToPlay') === '1') {
      window.sessionStorage.removeItem('openHowToPlay');
      setShowHowToPlay(true);
    }
  }, []);

  const calculateTimeLeft = (targetHour: number) => {
    const now = new Date();
    const target = new Date(now);
    target.setUTCHours(targetHour, 0, 0, 0);

    if (now.getUTCHours() >= targetHour) {
      target.setUTCDate(target.getUTCDate() + 1);
    }

    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}`;
  };


  const handleInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent default behavior
    if (isFrozen) return;

    if (karibuStatus && !karibuStatus.claimedToday) {
      triggerHapticFeedback(window);
      showToast('Claim Karibu Daily first to unlock tapping today.', 'error');
      return;
    }

    const processInteraction = (clientX: number, clientY: number, pageX: number, pageY: number) => {
      if (energy - pointsPerClick < 0) return;

      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;

      // Apply tilt effect
      card.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`;
      setTimeout(() => {
        card.style.transform = '';
      }, 100);

      updateLastClickTimestamp();
      clickTriggered();
      if (isAnimationEnabled) {
        setClicks(prevClicks => [...prevClicks, {
          id: Date.now(),
          x: pageX,
          y: pageY
        }]);
      }

      triggerHapticFeedback(window);
    };

    if (e.type === 'touchend') {
      const touchEvent = e as React.TouchEvent<HTMLDivElement>;
      Array.from(touchEvent.changedTouches).forEach(touch => {
        processInteraction(touch.clientX, touch.clientY, touch.pageX, touch.pageY);
      });
    } else {
      const mouseEvent = e as React.MouseEvent<HTMLDivElement>;
      processInteraction(mouseEvent.clientX, mouseEvent.clientY, mouseEvent.pageX, mouseEvent.pageY);
    }
  };

  const handleAnimationEnd = (id: number) => {
    setClicks((prevClicks) => prevClicks.filter(click => click.id !== id));
  };

  const energyProgressPercent = maxEnergy > 0 ? Math.min(100, (energy / maxEnergy) * 100) : 0;

  const safeLevelIndex = Math.min(Math.max(gameLevelIndex, 0), LEVELS.length - 1);
  const currentLevel = LEVELS[safeLevelIndex];
  const primary = currentLevel?.primaryColor ?? '#5B6C8F';
  const accent = currentLevel?.accentColor ?? '#AAB2C0';
  const isDarkLevel = gameLevelIndex >= 9; // Mansa
  const circleGradient = isDarkLevel
    ? `linear-gradient(to bottom, ${primary}, #1a1f2e)`
    : `linear-gradient(to bottom, ${primary}, ${primary}dd)`;
  const circleBorder = isDarkLevel ? `2px solid ${accent}` : `2px solid ${accent}99`;
  const circleShadow = `0 0 28px ${accent}40, 0 4px 12px rgba(0,0,0,0.3)`;

  const defaultSuspensionMessage = 'Cheating is bad. Your account has been suspended.';

  const karibuCompleted = karibuStatus ? karibuDaysCompleted(karibuStatus) : 0;
  const tapLocked = Boolean(karibuStatus && !karibuStatus.claimedToday);

  return (
    <div className="bg-ura-page flex justify-center min-h-screen">
      <div className="w-full bg-ura-page text-white h-screen font-bold flex flex-col max-w-xl relative">
        {isFrozen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ura-navy/95 px-4">
            <div className="w-full max-w-2xl mx-auto text-center">
              <div className="mb-6 flex justify-center">
                {/* Put your image in public/images/suspended-bot.png */}
                <Image
                  src="/images/suspended-bot.png"
                  alt=""
                  width={240}
                  height={240}
                  className="max-w-[200px] sm:max-w-[240px] h-auto object-contain"
                  unoptimized
                />
              </div>
              <div className="text-red-500 text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-tight mb-4">
                Account suspended
              </div>
              <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed">
                {suspensionReason || defaultSuspensionMessage}
              </p>
              <p className="text-gray-400 text-base sm:text-lg mt-6">
                If you believe this is a mistake, please contact support.
              </p>
            </div>
          </div>
        )}
        <TopInfoSection
          isGamePage={true}
          setCurrentView={setCurrentView}
          onOpenMyProgress={() => setShowMyProgress(true)}
        />

        <NotificationBanner />

        <div className="flex-grow mt-4 bg-ura-gold rounded-t-[48px] relative top-glow z-0">
          <div className="mt-[2px] bg-ura-panel rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
            <div className="px-4 pt-1 pb-24">

              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  navigateToKaribuDaily(setCurrentView, 'game');
                }}
                className="w-full mt-2 py-2 flex items-center justify-between text-left"
              >
                <span className="text-sm text-[#95908a]">Karibu Daily</span>
                <span className="flex items-center gap-2 text-sm font-medium text-white">
                  <span className="flex gap-0.5" aria-hidden>
                    {Array.from({ length: 10 }, (_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${i < karibuCompleted ? 'bg-emerald-400' : 'bg-[#43433b]'}`}
                      />
                    ))}
                  </span>
                  <span className="text-[#f3ba2f] shrink-0">
                    {karibuCompleted}/10{tapLocked ? ' · claim' : ''}
                  </span>
                </span>
              </button>

              <div className="px-4 mt-4 flex justify-center">
                <div className="px-4 py-2 flex items-center space-x-2">
                  <Image src="/pearls-bounce.png" alt="PEARLS" width={48} height={48} className="mx-auto rounded-full" />
                  <p className="text-4xl text-white" suppressHydrationWarning >{Math.floor(pointsBalance).toLocaleString()}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { triggerHapticFeedback(window); setShowMyProgress(true); }}
                className="flex justify-center gap-2 w-full"
              >
                <p style={{ color: primary, fontWeight: 700 }}>{LEVELS[safeLevelIndex].name}</p>
                <p className="text-[#95908a]" >&#8226;</p>
                <p>{gameLevelIndex + 1} <span className="text-[#95908a]">/ {LEVELS.length}</span></p>
              </button>

              <div className="px-4 mt-4 flex justify-center relative">
                {tapLocked && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-10 flex justify-center pointer-events-none">
                    <p className="text-center text-xs font-semibold text-amber-200/95 bg-black/55 px-3 py-2 rounded-xl border border-amber-500/40 max-w-[280px]">
                      Claim today&apos;s Karibu reward to unlock Tap Arena.
                    </p>
                  </div>
                )}
                <div
                  className={`w-80 h-80 p-4 rounded-full flex items-center justify-center transition-all duration-500 ${tapLocked ? 'opacity-45' : ''}`}
                  style={{
                    background: circleGradient,
                    border: circleBorder,
                    boxShadow: circleShadow,
                    maxWidth: 360,
                    maxHeight: 360,
                  }}
                  onClick={handleInteraction}
                  onTouchEnd={handleInteraction}
                >
                  <div
                    className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center"
                    style={{
                      background: isDarkLevel ? 'radial-gradient(circle, #1a1f2e 0%, #0B0F19 100%)' : `radial-gradient(circle, ${accent}22, #282e3e)`,
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Image
                      src="/tap-arena-center.png"
                      alt="Tap Arena Center"
                      fill
                      style={{
                        objectFit: 'contain',
                        objectPosition: 'center',
                        transform: 'scale(0.94)'
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', '/tap-arena-center.png');
                        console.error('Error:', e);
                      }}
                      priority
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between px-4 mt-4">
                <p className="flex justify-center items-center gap-1"><Image src={lightning} alt="Exchange" width={40} height={40} /><span className="flex flex-col"><span className="text-xl font-bold">{energy}</span><span className="text-base font-medium">/ {maxEnergy}</span></span></p>
                <button onClick={() => handleViewChange("boost")} className="flex justify-center items-center gap-1"><Rocket size={40} /><span className="text-xl">Boost</span></button>
              </div>

              <div className="w-full px-4 text-sm mt-2">
                <div className="flex items-center mt-1 border-2 border-[#43433b] rounded-full overflow-hidden">
                  <div className="w-full h-3 bg-[#43433b]/[0.6] rounded-full">
                    <div
                      className="h-3 rounded-full transition-[width] duration-300 ease-out"
                      style={{
                        width: `${energyProgressPercent}%`,
                        background: `linear-gradient(to right, ${primary}, ${accent})`,
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {showMyProgress && (
        <MyProgressModal
          onClose={() => setShowMyProgress(false)}
          onOpenGuide={() => setShowHowToPlay(true)}
        />
      )}

      {showHowToPlay && (
        <HowToPlayPopup onClose={() => setShowHowToPlay(false)} />
      )}

      <CongratulationsBanner />

      {clicks.map((click) => (
        <div
          key={click.id}
          className="absolute opacity-0 text-white pointer-events-none flex flex-col items-center justify-center"
          style={{
            top: `${click.y - 42}px`,
            left: `${click.x - 28}px`,
            animation: `float 1s ease-out`
          }}
          onAnimationEnd={() => handleAnimationEnd(click.id)}
        >
          <Image src="/pearls-bounce.png" alt="PEARLS" width={42} height={42} className="rounded-full" />
          <span className="mt-1 text-base font-bold text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]">+{pointsPerClick} PEARLS</span>
        </div>
      ))}
    </div>
  )
}