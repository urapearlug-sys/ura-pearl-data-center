'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { defaultProfileAvatar, uraFiscalFunBanner } from '@/images';
import { useGameStore } from '@/utils/game-mechanics';
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
  const { userTelegramName } = useGameStore();

  const actionItems = useMemo(() => ACTION_BY_TAB[activeTab], [activeTab]);

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

            <div className="mt-4 rounded-2xl border border-[#2c2f38] bg-gradient-to-br from-[#1a1d26] via-[#151a22] to-[#0f1320] overflow-hidden">
              <div className="px-4 pt-4 pb-2 border-b border-[#2d2f38]">
                <h3 className="text-base font-bold text-[var(--ura-yellow)]">URA Daily Pearl</h3>
                <p className="text-xs text-gray-400 mt-0.5">Your daily insight — artwork coming soon</p>
              </div>
              <div className="relative aspect-[16/9] w-full bg-[#0c0e12] flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 45%),
                      radial-gradient(circle at 70% 55%, rgba(243,186,47,0.12) 0%, transparent 40%),
                      radial-gradient(circle at 50% 80%, rgba(95,168,255,0.1) 0%, transparent 35%)`,
                  }}
                />
                <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
                  <span className="text-4xl" aria-hidden>
                    ⚪
                  </span>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Pearl image will appear here when you provide the asset.
                  </p>
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
