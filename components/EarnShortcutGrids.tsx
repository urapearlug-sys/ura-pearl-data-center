'use client';

import { triggerHapticFeedback } from '@/utils/ui';
import { queueEarnBootstrap, type EarnBootstrapPayload } from '@/utils/earn-bootstrap';

export type EarnShortcutGridsProps = {
  setCurrentView: (view: string) => void;
  /** When the user is already on Earn, open popups / tab changes without remounting */
  applyEarnBootstrap?: (p: EarnBootstrapPayload) => void;
};

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

export default function EarnShortcutGrids({ setCurrentView, applyEarnBootstrap }: EarnShortcutGridsProps) {
  const goEarn = (payload: EarnBootstrapPayload) => {
    if (applyEarnBootstrap) {
      applyEarnBootstrap(payload);
      return;
    }
    queueEarnBootstrap(payload);
    setCurrentView('earn');
  };

  const highlights = [
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

  const pearlClassic = [
    { id: 'tap-arena', title: 'Tap Arena', subtitle: 'Classic tap gameplay (rebranded from Game)', onClick: () => setCurrentView('game') },
    { id: 'mine-flow', title: 'Mine Flow', subtitle: 'Passive mining mode (rebranded from Mine)', onClick: () => setCurrentView('mine') },
    { id: 'pearls-collection', title: 'PEARLS Collection', subtitle: 'Card/progression collection', onClick: () => setCurrentView('collection') },
    { id: 'citizen-network', title: 'Citizen Network', subtitle: 'Referrals and social growth (from Friends)', onClick: () => setCurrentView('friends') },
    { id: 'pearls-airdrop', title: 'PEARLS Airdrop', subtitle: 'Airdrop and campaign rewards', onClick: () => setCurrentView('airdrop') },
  ];

  const learningFun = [
    { id: 'social-engagement', title: 'Earn activities - social media engagement', subtitle: 'Complete social tasks', onClick: () => goEarn({ activeTabAll: true }) },
    { id: 'tax-trivia-live', title: 'Tax Trivia Live Events', subtitle: 'Live learning events', onClick: () => goEarn({ openWeeklyEvent: true }) },
    { id: 'mini-games', title: 'Mini games', subtitle: 'Open mini games hub', onClick: () => goEarn({ openMiniGamesHub: true }) },
    { id: 'decode', title: 'Decode', subtitle: 'Cipher challenge mode', onClick: () => goEarn({ openDailyCipher: true }) },
    { id: 'spin-wheel', title: 'Spin wheel', subtitle: 'Daily lucky spin', onClick: () => goEarn({ openLuckySpin: true }) },
  ];

  const earnPlatform = [
    { id: 'voice-reports', title: 'Voice reports', subtitle: 'Approval-required blue pearls', onClick: () => goEarn({ activeTabAll: true }) },
    { id: 'whistle-blower', title: 'Whistle blower', subtitle: 'Protected reporting tasks', onClick: () => goEarn({ activeTabAll: true }) },
  ];

  const renderHighlightGrid = (items: typeof highlights) => (
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

  const renderListColumn = (
    items: Array<{ id: string; title: string; subtitle: string; onClick: () => void }>,
    variant: 'learn' | 'earn'
  ) => (
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
    <div className="mt-2 space-y-8">
      <div>
        <h2 className="text-white text-lg font-bold tracking-tight">Pearls, games & activities</h2>
        <p className="text-gray-400 text-xs mt-1">Tap to open modes or tasks below.</p>
      </div>

      <section aria-labelledby="earn-tab-highlights-heading">
        <h3 id="earn-tab-highlights-heading" className="text-sm font-bold uppercase tracking-wide text-[#f3ba2f] mb-3">
          Highlights
        </h3>
        {renderHighlightGrid(highlights)}
      </section>

      <section aria-labelledby="earn-tab-pearl-classic-heading">
        <h3 id="earn-tab-pearl-classic-heading" className="text-sm font-bold uppercase tracking-wide text-emerald-300/95 mb-3">
          Pearl Classic
        </h3>
        {renderHighlightGrid(pearlClassic)}
      </section>

      <section aria-labelledby="earn-tab-learning-fun-heading">
        <h3 id="earn-tab-learning-fun-heading" className="text-sm font-bold uppercase tracking-wide text-amber-200/90 mb-3">
          Learning & fun
        </h3>
        {renderListColumn(learningFun, 'learn')}
      </section>

      <section aria-labelledby="earn-tab-platform-heading">
        <h3 id="earn-tab-platform-heading" className="text-sm font-bold uppercase tracking-wide text-cyan-200/90 mb-3">
          On-platform earn
        </h3>
        {renderListColumn(earnPlatform, 'earn')}
      </section>
    </div>
  );
}
