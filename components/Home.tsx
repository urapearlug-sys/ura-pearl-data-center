'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { defaultProfileAvatar, uraDailyPearlCoins, uraFiscalFunBanner, uraTreasuryCounter } from '@/images';
import { calculateLevelIndex, useGameStore } from '@/utils/game-mechanics';
import { LEVELS } from '@/utils/consts';
import { triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';

type ActionTab = 'play' | 'learn' | 'earn';

type ActionItem = {
  id: string;
  title: string;
  subtitle?: string;
  pearlType?: 'white' | 'blue';
  /** 'earn' | 'game' etc., or null for coming-soon toast */
  route?: string;
};

const ACTION_BY_TAB: Record<ActionTab, ActionItem[]> = {
  play: [
    { id: 'quiz', title: 'URA Quiz', subtitle: 'White pearls · no approval', pearlType: 'white', route: 'earn' },
    { id: 'receipt', title: 'Receipt Rush', subtitle: 'Blue pearls · needs approval', pearlType: 'blue' },
    { id: 'truefalse', title: 'True or False — Uganda tax edition', subtitle: 'White pearls · no approval', pearlType: 'white' },
    { id: 'leaderboard', title: 'Level & Leaderboard', subtitle: 'Track total pearl progress', route: 'game' },
    { id: 'karibu', title: 'Karibu Daily', subtitle: 'White pearls · no approval', pearlType: 'white', route: 'earn' },
  ],
  learn: [
    {
      id: 'social-earn',
      title: 'Earn activities',
      subtitle: 'White pearls · no approval',
      pearlType: 'white',
      route: 'earn',
    },
    { id: 'tax-trivia', title: 'Tax Trivia Live Events', subtitle: 'White pearls · no approval', pearlType: 'white' },
  ],
  earn: [
    { id: 'voice', title: 'Voice reports', subtitle: 'Blue pearls · needs approval', pearlType: 'blue' },
    { id: 'whistle', title: 'Whistle blower', subtitle: 'Blue pearls · needs approval', pearlType: 'blue' },
  ],
};

interface HomeProps {
  setCurrentView: (view: string) => void;
}

export default function Home({ setCurrentView }: HomeProps) {
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState<ActionTab>('play');
  const { userTelegramName, points, userTelegramInitData } = useGameStore();
  const [whitePearls, setWhitePearls] = useState(0);
  const [bluePearls, setBluePearls] = useState(0);
  const [goldishPearls, setGoldishPearls] = useState(0);

  const actionItems = useMemo(() => ACTION_BY_TAB[activeTab], [activeTab]);

  const levelIndex = useMemo(() => calculateLevelIndex(points), [points]);
  const pearlsDisplay = Math.floor(points).toLocaleString();
  const levelName = LEVELS[Math.min(levelIndex, LEVELS.length - 1)]?.name ?? 'Baobab';
  const rankStep = Math.min(levelIndex + 1, LEVELS.length);
  const rankTotal = LEVELS.length;

  const levelProgressPct = useMemo(() => {
    const cur = LEVELS[levelIndex];
    const next = LEVELS[levelIndex + 1];
    if (!cur) return 100;
    if (!next) return 100;
    const span = next.minPoints - cur.minPoints;
    if (span <= 0) return 100;
    const p = ((points - cur.minPoints) / span) * 100;
    return Math.max(0, Math.min(100, p));
  }, [levelIndex, points]);

  useEffect(() => {
    const loadPearls = async () => {
      if (!userTelegramInitData) return;
      try {
        const res = await fetch('/api/pearls/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: userTelegramInitData }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setWhitePearls(Math.floor(data?.balances?.white ?? 0));
        setBluePearls(Math.floor(data?.balances?.bluePending ?? 0));
        setGoldishPearls(Math.floor(data?.balances?.goldish ?? 0));
      } catch {
        // Keep UI responsive with zero fallback if pearls API is unavailable.
      }
    };
    loadPearls();
  }, [userTelegramInitData]);

  const handleAction = (item: ActionItem) => {
    triggerHapticFeedback(window);
    if (item.route) {
      setCurrentView(item.route);
      return;
    }
    showToast(`${item.title} — coming soon`, 'success');
  };

  return (
    <div className="bg-black flex justify-center min-h-screen">
      <div className="w-full bg-black text-white flex flex-col max-w-xl pb-24">
        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              setCurrentView('settings');
            }}
            className="w-full rounded-2xl border border-[#2c2f38] bg-[#12141a] p-3 flex items-center gap-3 text-left hover:border-[var(--ura-yellow)] transition-colors"
          >
            <div className="w-10 h-10 rounded-full border border-[var(--ura-blue-medium)] overflow-hidden bg-[#1f2330] flex-shrink-0 relative">
              <Image src={defaultProfileAvatar} alt="Profile" fill className="object-cover" sizes="40px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400">URA Platform · Profile</p>
              <p className="font-semibold truncate">{userTelegramName || 'Citizen'}</p>
            </div>
          </button>

          <div className="mt-4 rounded-2xl overflow-hidden border border-[#2c2f38] bg-[#f5f0e8]">
            <Image
              src={uraFiscalFunBanner}
              alt="Fiscal Fun — Uganda Revenue Authority"
              width={1024}
              height={682}
              className="w-full h-auto object-cover"
              sizes="(max-width: 576px) 100vw, 576px"
              priority
            />
          </div>

          <section className="mt-6" aria-label="Action Center">
            <h2 className="text-lg font-bold text-white tracking-tight mb-3">Action Center</h2>

            <div className="rounded-xl border border-[#2d2f38] bg-[#151821] p-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[var(--ura-yellow)] tracking-tight">URA Tresurely Counter</h3>
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={uraTreasuryCounter}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 flex-shrink-0 object-contain"
                  />
                  <span className="text-2xl font-bold text-white tabular-nums tracking-tight">{pearlsDisplay}</span>
                </div>
                <p className="mt-1.5 text-xs">
                  <span className="text-slate-400">{levelName}</span>
                  <span className="text-gray-600 mx-1">·</span>
                  <span className="text-white font-medium tabular-nums">{rankStep}</span>
                  <span className="text-gray-500 tabular-nums"> / {rankTotal}</span>
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                    <span>Rank progress</span>
                    <span>{Math.round(levelProgressPct)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#2a2d38] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--ura-blue-dark)] to-[var(--ura-blue-medium)] transition-[width] duration-300"
                      style={{ width: `${levelProgressPct}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 border-t border-[#2a2d38] pt-3 space-y-2">
                  {[
                    { key: 'white', label: 'White pearl', value: whitePearls, color: 'text-slate-200', hint: 'From instant approved tasks' },
                    { key: 'blue', label: 'Blue pearl', value: bluePearls, color: 'text-[#5fa8ff]', hint: 'From approval-required tasks' },
                    { key: 'goldish', label: 'Golden Pearl', value: goldishPearls, color: 'text-[var(--ura-yellow)]', hint: 'Approved & withdraw-ready pearls' },
                  ].map((item) => (
                    <div key={item.key} className="rounded-lg border border-[#2a2d38] bg-[#12141a] px-2.5 py-2 flex items-center gap-2">
                      <Image src={uraDailyPearlCoins} alt={item.label} width={28} height={28} className="h-7 w-7 object-contain flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold ${item.color}`}>{item.label}</p>
                        <p className="text-[10px] text-gray-500 truncate">{item.hint}</p>
                      </div>
                      <p className="text-sm font-bold text-white tabular-nums">{item.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#2d2f38] bg-[#161923] p-1 grid grid-cols-3 gap-1">
              {(
                [
                  { key: 'play' as const, label: 'Play' },
                  { key: 'learn' as const, label: 'Learn' },
                  { key: 'earn' as const, label: 'Earn' },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setActiveTab(key);
                  }}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === key ? 'bg-[var(--ura-blue-dark)] text-white' : 'text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {actionItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAction(item)}
                  className="w-full rounded-xl border border-[#2d2f38] bg-[#151821] px-4 py-3 text-left hover:border-[var(--ura-yellow)] transition-colors"
                >
                  <p className="font-semibold text-white text-sm leading-snug">{item.title}</p>
                  {item.subtitle ? (
                    <p className="text-xs text-gray-400 mt-1">{item.subtitle}</p>
                  ) : null}
                  {item.pearlType ? (
                    <p className="mt-1 text-[11px]">
                      <span
                        className={
                          item.pearlType === 'white'
                            ? 'text-slate-300'
                            : 'text-[#5fa8ff]'
                        }
                      >
                        {item.pearlType === 'white' ? 'White pearl activity' : 'Blue pearl activity'}
                      </span>
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
