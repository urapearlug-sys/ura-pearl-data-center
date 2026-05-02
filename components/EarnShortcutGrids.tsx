'use client';

import { useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { queueEarnBootstrap, type EarnBootstrapPayload } from '@/utils/earn-bootstrap';

export type EarnShortcutGridsProps = {
  setCurrentView: (view: string) => void;
  /** When the user is already on Earn, open popups / tab changes without remounting */
  applyEarnBootstrap?: (p: EarnBootstrapPayload) => void;
};

type ShortcutItem = { id: string; title: string; subtitle: string; onClick: () => void };

const PLAY_CARD_APPEARANCE: Record<string, { tone: string; icon: string }> = {
  tasks: { tone: 'from-[#4a3a16] to-[#6b5118] border-[#d9a63a]/60', icon: '✅' },
  decode: { tone: 'from-[#0f3f55] to-[#10506b] border-[#2ac4e0]/55', icon: '🔐' },
  matrix: { tone: 'from-[#2b235a] to-[#3b2e7a] border-[#8a6dff]/55', icon: '🎴' },
  'collection-cards': { tone: 'from-[#1f314f] to-[#28456e] border-[#78a8ff]/50', icon: '🗂️' },
  'weekly-event': { tone: 'from-[#5a1f3a] to-[#732445] border-[#ff6f97]/50', icon: '🎁' },
  'global-joinable-tasks': { tone: 'from-[#1a4b3f] to-[#1f6554] border-[#3ad1a7]/50', icon: '🌍' },
  'ura-quiz': { tone: 'from-[#4a3a16] to-[#6b5118] border-[#d9a63a]/60', icon: '📝' },
  'receipt-rush': { tone: 'from-[#17334d] to-[#234a6d] border-[#6eb4ff]/50', icon: '🧾' },
  'true-false': { tone: 'from-[#24434c] to-[#2b5b68] border-[#74d1e2]/50', icon: '⚖️' },
  leaderboard: { tone: 'from-[#273046] to-[#364465] border-[#93a8d8]/45', icon: '🏆' },
  'karibu-daily': { tone: 'from-[#4a3a16] to-[#6b5118] border-[#d9a63a]/60', icon: '📅' },
  'tap-arena': { tone: 'from-[#1e365a] to-[#2c4f7d] border-[#82b4ff]/50', icon: '🎮' },
  'mine-flow': { tone: 'from-[#274b44] to-[#2d6258] border-[#69c9b2]/50', icon: '⛏️' },
  'pearls-collection': { tone: 'from-[#26345d] to-[#3a4a78] border-[#8ea3df]/45', icon: '🧊' },
  'citizen-network': { tone: 'from-[#224b58] to-[#2a6170] border-[#71c9dd]/45', icon: '👥' },
  'pearls-airdrop': { tone: 'from-[#4a3a16] to-[#6b5118] border-[#d9a63a]/60', icon: '🎈' },
  'mini-games': { tone: 'from-[#2b235a] to-[#3b2e7a] border-[#8a6dff]/55', icon: '🕹️' },
  'tax-trivia-live': { tone: 'from-[#5a1f3a] to-[#732445] border-[#ff6f97]/50', icon: '🎤' },
  'spin-wheel': { tone: 'from-[#1f314f] to-[#28456e] border-[#78a8ff]/50', icon: '🎡' },
};

/** Top of Earn tab: fixed shortcuts; everything else lives under “More”. */
const PRIMARY_SHORTCUT_IDS: string[] = [
  'ura-quiz',
  'receipt-rush',
  'karibu-daily',
  'true-false',
  'tap-arena',
  'pearls-airdrop',
];

const PRIMARY_ID_SET = new Set(PRIMARY_SHORTCUT_IDS);

export default function EarnShortcutGrids({ setCurrentView, applyEarnBootstrap }: EarnShortcutGridsProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const goEarn = (payload: EarnBootstrapPayload) => {
    if (applyEarnBootstrap) {
      applyEarnBootstrap(payload);
      return;
    }
    queueEarnBootstrap(payload);
    setCurrentView('earn');
  };

  const highlights: ShortcutItem[] = [
    { id: 'tasks', title: 'Tasks', subtitle: 'Open all earn activities', onClick: () => goEarn({ activeTabAll: true }) },
    { id: 'decode', title: 'Decode', subtitle: 'Daily cipher challenge', onClick: () => goEarn({ openDailyCipher: true }) },
    { id: 'matrix', title: 'Matrix', subtitle: 'Daily combo challenge', onClick: () => goEarn({ openDailyCombo: true }) },
    { id: 'collection-cards', title: 'Collection Cards', subtitle: 'Open card collection progression', onClick: () => setCurrentView('collection') },
    { id: 'weekly-event', title: 'Weekly Event', subtitle: 'Complete weekly objectives', onClick: () => goEarn({ openWeeklyEvent: true }) },
    { id: 'global-joinable-tasks', title: 'Global Joinable Tasks', subtitle: 'Join league/team global competitions', onClick: () => goEarn({ openGlobalTasks: true }) },
    { id: 'ura-quiz', title: 'URA Quiz', subtitle: 'Quiz and earn PEARLS', onClick: () => goEarn({ openMitrolabsQuiz: true }) },
    { id: 'receipt-rush', title: 'Receipt Rush', subtitle: 'Receipt activity tracking', onClick: () => goEarn({ activeTabAll: true }) },
    {
      id: 'true-false',
      title: 'True or False – Uganda Tax Edition',
      subtitle: 'Tax knowledge challenge',
      onClick: () => goEarn({ activeTabAll: true }),
    },
    { id: 'leaderboard', title: 'Level & Leaderboard', subtitle: 'Track your ranking progress', onClick: () => setCurrentView('game') },
    { id: 'karibu-daily', title: 'Karibu Daily', subtitle: 'Daily reward check-in', onClick: () => goEarn({ openDailyLogin: true }) },
  ];

  const pearlClassic: ShortcutItem[] = [
    { id: 'tap-arena', title: 'Tap Arena', subtitle: 'Classic tap gameplay (rebranded from Game)', onClick: () => setCurrentView('game') },
    { id: 'mine-flow', title: 'Mine Flow', subtitle: 'Passive mining mode (rebranded from Mine)', onClick: () => setCurrentView('mine') },
    { id: 'pearls-collection', title: 'PEARLS Collection', subtitle: 'Card/progression collection', onClick: () => setCurrentView('collection') },
    { id: 'citizen-network', title: 'Citizen Network', subtitle: 'Referrals and social growth (from Friends)', onClick: () => setCurrentView('friends') },
    { id: 'pearls-airdrop', title: 'PEARLS Airdrop', subtitle: 'Airdrop and campaign rewards', onClick: () => setCurrentView('airdrop') },
  ];

  const learningFun: ShortcutItem[] = [
    { id: 'social-engagement', title: 'Earn activities - social media engagement', subtitle: 'Complete social tasks', onClick: () => goEarn({ activeTabAll: true }) },
    { id: 'tax-trivia-live', title: 'Tax Trivia Live Events', subtitle: 'Live learning events', onClick: () => goEarn({ openWeeklyEvent: true }) },
    { id: 'mini-games', title: 'Mini games', subtitle: 'Open mini games hub', onClick: () => goEarn({ openMiniGamesHub: true }) },
    { id: 'decode', title: 'Decode', subtitle: 'Cipher challenge mode', onClick: () => goEarn({ openDailyCipher: true }) },
    { id: 'spin-wheel', title: 'Spin wheel', subtitle: 'Daily lucky spin', onClick: () => goEarn({ openLuckySpin: true }) },
  ];

  const earnPlatform: ShortcutItem[] = [
    { id: 'voice-reports', title: 'Voice reports', subtitle: 'Approval-required blue pearls', onClick: () => goEarn({ activeTabAll: true }) },
    { id: 'whistle-blower', title: 'Whistle blower', subtitle: 'Protected reporting tasks', onClick: () => goEarn({ activeTabAll: true }) },
  ];

  const byId = new Map<string, ShortcutItem>();
  for (const item of highlights) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  for (const item of pearlClassic) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }

  const primaryItems: ShortcutItem[] = PRIMARY_SHORTCUT_IDS.map((id) => {
    const item = byId.get(id);
    if (!item) {
      throw new Error(`EarnShortcutGrids: missing primary shortcut "${id}"`);
    }
    return item;
  });

  const moreHighlights = highlights.filter((h) => !PRIMARY_ID_SET.has(h.id));
  const morePearlClassic = pearlClassic.filter((p) => !PRIMARY_ID_SET.has(p.id));
  const moreLearning = learningFun.filter(
    (l) => !PRIMARY_ID_SET.has(l.id) && !moreHighlights.some((h) => h.id === l.id)
  );

  const renderHighlightGrid = (items: ShortcutItem[]) => (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const appearance = PLAY_CARD_APPEARANCE[item.id] ?? {
          tone: 'from-[#1e365a] to-[#2c4f7d] border-[#82b4ff]/50',
          icon: '⭐',
        };
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              item.onClick();
            }}
            className={`rounded-2xl border bg-gradient-to-br ${appearance.tone} px-3 py-3 text-left transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#111621]/75 border border-white/20 text-xl">
                {appearance.icon}
              </span>
              <div className="min-w-0">
                <p className="text-base font-extrabold text-white leading-tight">{item.title}</p>
                <p className="text-sm text-blue-100/95 mt-1 leading-snug">{item.subtitle}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderListColumn = (items: ShortcutItem[], variant: 'learn' | 'earn') => (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            triggerHapticFeedback(window);
            item.onClick();
          }}
          className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
            variant === 'learn'
              ? 'border-[var(--ura-yellow)]/55 bg-[var(--ura-yellow)]/10 hover:border-[var(--ura-yellow)]'
              : 'border-cyan-500/50 bg-cyan-900/20 hover:border-cyan-400'
          }`}
        >
          <p className="text-sm font-bold text-white">{item.title}</p>
          <p className="text-xs text-gray-300 mt-1">{item.subtitle}</p>
        </button>
      ))}
    </div>
  );

  return (
    <div className="mt-2 space-y-6">
      <div>
        <h2 className="text-white text-lg font-bold tracking-tight">Pearls, games & activities</h2>
        <p className="text-gray-400 text-xs mt-1">Tap a shortcut below. Open More for the full list.</p>
      </div>

      <section aria-labelledby="earn-primary-shortcuts-heading">
        <h3 id="earn-primary-shortcuts-heading" className="sr-only">
          Primary shortcuts
        </h3>
        {renderHighlightGrid(primaryItems)}
      </section>

      <div className="rounded-2xl border border-[#3d4046] bg-[#141821] overflow-hidden">
        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback(window);
            setMoreOpen((o) => !o);
          }}
          aria-expanded={moreOpen}
          className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#1a1d26]"
        >
          <div className="min-w-0">
            <p className="text-base font-extrabold text-white">More</p>
            <p className="text-xs text-gray-500 mt-0.5">Tasks, decode, collection, leagues, and more</p>
          </div>
          <span className="text-gray-400 text-sm font-semibold tabular-nums shrink-0">{moreOpen ? '▲' : '▼'}</span>
        </button>
        {moreOpen ? (
          <div className="px-3 pb-4 pt-2 space-y-6 border-t border-[#2d2f38]">
            {moreHighlights.length > 0 ? (
              <section aria-labelledby="earn-more-highlights-heading">
                <h4 id="earn-more-highlights-heading" className="text-sm font-bold uppercase tracking-wide text-[#f3ba2f] mb-3">
                  Highlights
                </h4>
                {renderHighlightGrid(moreHighlights)}
              </section>
            ) : null}
            {morePearlClassic.length > 0 ? (
              <section aria-labelledby="earn-more-pearl-heading">
                <h4 id="earn-more-pearl-heading" className="text-sm font-bold uppercase tracking-wide text-emerald-300/95 mb-3">
                  Pearl Classic
                </h4>
                {renderHighlightGrid(morePearlClassic)}
              </section>
            ) : null}
            {moreLearning.length > 0 ? (
              <section aria-labelledby="earn-more-learning-heading">
                <h4 id="earn-more-learning-heading" className="text-sm font-bold uppercase tracking-wide text-amber-200/90 mb-3">
                  Learning & fun
                </h4>
                {renderListColumn(moreLearning, 'learn')}
              </section>
            ) : null}
            {earnPlatform.length > 0 ? (
              <section aria-labelledby="earn-more-platform-heading">
                <h4 id="earn-more-platform-heading" className="text-sm font-bold uppercase tracking-wide text-cyan-200/90 mb-3">
                  On-platform earn
                </h4>
                {renderListColumn(earnPlatform, 'earn')}
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
