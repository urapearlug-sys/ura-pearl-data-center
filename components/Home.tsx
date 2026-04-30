'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { defaultProfileAvatar, uraDailyPearlCoins, uraFiscalFunBanner } from '@/images';
import { calculateLevelIndex, useGameStore } from '@/utils/game-mechanics';
import { LEVELS } from '@/utils/consts';
import { triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';

type ActionTab = 'play' | 'learn' | 'earn';

type ActionItem = {
  id: string;
  title: string;
  subtitle?: string;
  /** 'earn' | 'game' etc., or null for coming-soon toast */
  route?: string;
};

const ACTION_BY_TAB: Record<ActionTab, ActionItem[]> = {
  play: [
    { id: 'quiz', title: 'URA Quiz', subtitle: 'Test your knowledge', route: 'earn' },
    { id: 'receipt', title: 'Receipt Rush', subtitle: 'Speed challenge' },
    { id: 'truefalse', title: 'True or False — Uganda tax edition', subtitle: 'Quick facts' },
    { id: 'leaderboard', title: 'Level & Leaderboard', subtitle: 'Rankings', route: 'game' },
    { id: 'karibu', title: 'Karibu Daily', subtitle: 'Daily rewards', route: 'earn' },
  ],
  learn: [
    {
      id: 'social-earn',
      title: 'Earn activities',
      subtitle: 'Social media engagement',
      route: 'earn',
    },
    { id: 'tax-trivia', title: 'Tax Trivia Live Events', subtitle: 'Scheduled learning sessions' },
  ],
  earn: [
    { id: 'voice', title: 'Voice reports', subtitle: 'Submit audio updates' },
    { id: 'whistle', title: 'Whistle blower', subtitle: 'Confidential reporting' },
  ],
};

interface HomeProps {
  setCurrentView: (view: string) => void;
}

export default function Home({ setCurrentView }: HomeProps) {
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState<ActionTab>('play');
  const { userTelegramName, points } = useGameStore();

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

            <div className="rounded-xl border border-[#2d2f38] bg-[#161923] p-1 grid grid-cols-3 gap-1">
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

            <div className="mt-4 rounded-xl border border-[#2d2f38] bg-[#151821] p-3 flex gap-3">
              <div
                className="w-11 h-11 flex-shrink-0 rounded-lg border border-dashed border-[#3d4046] bg-[#12141a]"
                aria-label="Daily Pearl icon (coming soon)"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[var(--ura-yellow)] tracking-tight">URA Daily Pearl</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Pearls accumulated (total ALM)</p>
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={uraDailyPearlCoins}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 flex-shrink-0 object-contain"
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
              </div>
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
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
