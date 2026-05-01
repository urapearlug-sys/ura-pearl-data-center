'use client';

import { useEffect, useMemo, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { dailyCipher, dailyCombo, dailyReward, defaultProfileAvatar, pearlBlue, pearlGolden, pearlWhite, rankBlue, rankGold, rankSilver, rankWhite, uraFiscalFunBanner, uraTreasuryCounter } from '@/images';
import { calculateLevelIndex, useGameStore } from '@/utils/game-mechanics';
import { LEVELS } from '@/utils/consts';
import { triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';
import { PEARLS_BALANCE_REFRESH_EVENT } from '@/utils/pearl-balance-events';
import { EcosystemRadialDashboard, type EcosystemBottomNavKey, type EcosystemDashboardModule } from '@/components/ecosystem';
import { queueEarnBootstrap, type EarnBootstrapPayload } from '@/utils/earn-bootstrap';

type ActionCenterTab = 'most-used' | 'favorites';

const HOME_ECOSYSTEM_ICONS: Record<string, string> = {
  tasks: '✅',
  decode: '🔐',
  matrix: '🎴',
  'collection-cards': '🗂️',
  'weekly-event': '🎁',
  'global-joinable-tasks': '🌍',
  'ura-quiz': '📝',
  'receipt-rush': '🧾',
  'true-false': '⚖️',
  leaderboard: '🏆',
  'karibu-daily': '📅',
  'tap-arena': '🎮',
  'mine-flow': '⛏️',
  'pearls-collection': '🧊',
  'citizen-network': '👥',
  'pearls-airdrop': '🎈',
};

type ActionItem = {
  id: string;
  title: string;
  subtitle?: string;
  pearlType?: 'white' | 'blue';
  group?: 'play' | 'learn' | 'earn';
  icon?: StaticImageData;
  /** 'earn' | 'game' etc., or null for coming-soon toast */
  route?: string;
};

const ACTION_CATALOG: ActionItem[] = [
  { id: 'quiz', title: 'URA Quiz', subtitle: 'White pearls · no approval', pearlType: 'white', route: 'earn', group: 'play', icon: dailyCipher },
  { id: 'receipt', title: 'Receipt Rush', subtitle: 'Blue pearls · needs approval', pearlType: 'blue', group: 'play', icon: dailyCombo },
  { id: 'truefalse', title: 'True or False — Uganda tax edition', subtitle: 'White pearls · no approval', pearlType: 'white', group: 'play', icon: dailyCipher },
  { id: 'leaderboard', title: 'Level & Leaderboard', subtitle: 'Track total pearl progress', route: 'game', group: 'play', icon: dailyCombo },
  { id: 'karibu', title: 'Karibu Daily', subtitle: 'White pearls · no approval', pearlType: 'white', route: 'earn', group: 'play', icon: dailyReward },
  { id: 'social-earn', title: 'Earn activities', subtitle: 'White pearls · no approval', pearlType: 'white', route: 'earn', group: 'learn', icon: dailyReward },
  { id: 'tax-trivia', title: 'Tax Trivia Live Events', subtitle: 'White pearls · no approval', pearlType: 'white', group: 'learn', icon: dailyCipher },
  { id: 'voice', title: 'Voice reports', subtitle: 'Blue pearls · needs approval', pearlType: 'blue', group: 'earn', icon: dailyCombo },
  { id: 'whistle', title: 'Whistle blower', subtitle: 'Blue pearls · needs approval', pearlType: 'blue', group: 'earn', icon: dailyCombo },
];

interface HomeProps {
  setCurrentView: (view: string) => void;
}

export default function Home({ setCurrentView }: HomeProps) {
  const showToast = useToast();
  const [activeActionTab, setActiveActionTab] = useState<ActionCenterTab>('most-used');
  const [showFavoritesManager, setShowFavoritesManager] = useState(false);
  const [favoritesSearch, setFavoritesSearch] = useState('');
  const [manualFavoriteTitle, setManualFavoriteTitle] = useState('');
  const [manualFavoriteSubtitle, setManualFavoriteSubtitle] = useState('');
  const [manualFavoriteRoute, setManualFavoriteRoute] = useState('');
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [customFavorites, setCustomFavorites] = useState<ActionItem[]>([]);
  const [showRanksPopup, setShowRanksPopup] = useState(false);
  const [showEcosystemDashboard, setShowEcosystemDashboard] = useState(false);
  const { userTelegramName, points, pointsBalance, userTelegramInitData } = useGameStore();
  const [bluePearls, setBluePearls] = useState(0);
  const [goldishPearls, setGoldishPearls] = useState(0);

  const storagePrefix = useMemo(() => {
    const fallback = 'anon';
    if (!userTelegramInitData) return fallback;
    try {
      const rawUser = new URLSearchParams(userTelegramInitData).get('user');
      if (!rawUser) return fallback;
      const parsed = JSON.parse(decodeURIComponent(rawUser)) as { id?: string | number };
      return String(parsed?.id ?? fallback);
    } catch {
      return fallback;
    }
  }, [userTelegramInitData]);
  const visitsStorageKey = `ura:home:visits:${storagePrefix}`;
  const favoritesStorageKey = `ura:home:favorites:${storagePrefix}`;
  const customFavoritesStorageKey = `ura:home:favorites:custom:${storagePrefix}`;

  const mostUsedItems = useMemo(() => {
    const scored = ACTION_CATALOG.map((item, index) => ({
      item,
      score: visitCounts[item.id] ?? 0,
      index,
    }))
      .filter((x) => x.score > 0)
      .sort((a, b) => (b.score - a.score) || (a.index - b.index));
    return scored.slice(0, 6).map((x) => x.item);
  }, [visitCounts]);

  const favoriteItems = useMemo(() => {
    const catalogById = new Map(ACTION_CATALOG.map((x) => [x.id, x]));
    const pickedCatalog = favoriteIds.map((id) => catalogById.get(id)).filter((x): x is ActionItem => Boolean(x));
    return [...pickedCatalog, ...customFavorites];
  }, [favoriteIds, customFavorites]);

  const displayedItems = useMemo(() => {
    if (activeActionTab === 'favorites') return favoriteItems;
    return mostUsedItems;
  }, [activeActionTab, favoriteItems, mostUsedItems]);

  const availableFavoriteOptions = useMemo(() => {
    const q = favoritesSearch.trim().toLowerCase();
    return ACTION_CATALOG.filter((item) => !favoriteIds.includes(item.id))
      .filter((item) => !q || item.title.toLowerCase().includes(q) || (item.subtitle ?? '').toLowerCase().includes(q));
  }, [favoritesSearch, favoriteIds]);

  const levelIndex = useMemo(() => calculateLevelIndex(points), [points]);
  const pearlsDisplay = Math.floor(points).toLocaleString();
  const liveWhitePearls = Math.max(0, Math.floor(pointsBalance));
  const rankStep = Math.min(levelIndex + 1, LEVELS.length);
  const rankTotal = LEVELS.length;
  const ranks = useMemo(
    () => [
      { id: 0, color: 'White', name: 'Novice', tone: 'border-slate-300/40 bg-slate-100/5', image: rankWhite },
      { id: 1, color: 'Silver', name: 'Citizen', tone: 'border-gray-300/40 bg-gray-100/5', image: rankSilver },
      { id: 2, color: 'Blue', name: 'Patriot', tone: 'border-[#5fa8ff]/50 bg-[#5fa8ff]/10', image: rankBlue },
      { id: 3, color: 'Gold', name: 'Guardian', tone: 'border-[var(--ura-yellow)]/50 bg-[var(--ura-yellow)]/10', image: rankGold },
    ],
    []
  );
  const userRankIndex = useMemo(() => {
    if (rankTotal <= 1) return 0;
    const normalized = (rankStep - 1) / (rankTotal - 1);
    return Math.max(0, Math.min(3, Math.floor(normalized * 4)));
  }, [rankStep, rankTotal]);
  const rankTierName = ranks[userRankIndex].name;
  const rankStepDisplay = userRankIndex + 1;

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
        setBluePearls(Math.floor(data?.balances?.bluePending ?? 0));
        setGoldishPearls(Math.floor(data?.balances?.goldish ?? 0));
      } catch {
        // Keep UI responsive with zero fallback if pearls API is unavailable.
      }
    };
    loadPearls();
    const onRefresh = () => {
      void loadPearls();
    };
    window.addEventListener(PEARLS_BALANCE_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(PEARLS_BALANCE_REFRESH_EVENT, onRefresh);
  }, [userTelegramInitData]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const parsedVisits = JSON.parse(window.localStorage.getItem(visitsStorageKey) ?? '{}') as Record<string, number>;
      setVisitCounts(parsedVisits);
      const parsedFavorites = JSON.parse(window.localStorage.getItem(favoritesStorageKey) ?? '[]') as string[];
      setFavoriteIds(Array.isArray(parsedFavorites) ? parsedFavorites : []);
      const parsedCustom = JSON.parse(window.localStorage.getItem(customFavoritesStorageKey) ?? '[]') as ActionItem[];
      setCustomFavorites(Array.isArray(parsedCustom) ? parsedCustom : []);
    } catch {
      setVisitCounts({});
      setFavoriteIds([]);
      setCustomFavorites([]);
    }
  }, [customFavoritesStorageKey, favoritesStorageKey, visitsStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(visitsStorageKey, JSON.stringify(visitCounts));
  }, [visitCounts, visitsStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(favoritesStorageKey, JSON.stringify(favoriteIds));
  }, [favoriteIds, favoritesStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(customFavoritesStorageKey, JSON.stringify(customFavorites));
  }, [customFavorites, customFavoritesStorageKey]);

  const handleAction = (item: ActionItem) => {
    triggerHapticFeedback(window);
    setVisitCounts((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }));
    if (item.route) {
      setCurrentView(item.route);
      return;
    }
    showToast(`${item.title} — coming soon`, 'success');
  };

  const addCatalogFavorite = (id: string) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeCatalogFavorite = (id: string) => {
    setFavoriteIds((prev) => prev.filter((x) => x !== id));
  };

  const addManualFavorite = () => {
    const title = manualFavoriteTitle.trim();
    if (!title) {
      showToast('Add a title for your favorite', 'error');
      return;
    }
    const route = manualFavoriteRoute.trim();
    const subtitle = manualFavoriteSubtitle.trim();
    const id = `manual:${Date.now()}`;
    setCustomFavorites((prev) => [...prev, { id, title, subtitle: subtitle || undefined, route: route || undefined }]);
    setManualFavoriteTitle('');
    setManualFavoriteSubtitle('');
    setManualFavoriteRoute('');
    showToast('Favorite added', 'success');
  };

  const homeEcosystemModules = useMemo((): EcosystemDashboardModule[] => {
    const goEarn = (payload: EarnBootstrapPayload) => {
      queueEarnBootstrap(payload);
      setShowEcosystemDashboard(false);
      setCurrentView('earn');
    };
    const goView = (view: string) => {
      setShowEcosystemDashboard(false);
      setCurrentView(view);
    };
    const ic = HOME_ECOSYSTEM_ICONS;
    return [
      { id: 'tasks', title: 'Tasks', subtitle: 'Open all earn activities', icon: ic.tasks, onClick: () => goEarn({ earnFeatureTab: 'play', activeTabAll: true }) },
      { id: 'decode', title: 'Decode', subtitle: 'Daily cipher challenge', icon: ic.decode, onClick: () => goEarn({ earnFeatureTab: 'play', openDailyCipher: true }) },
      { id: 'matrix', title: 'Matrix', subtitle: 'Daily combo challenge', icon: ic.matrix, onClick: () => goEarn({ earnFeatureTab: 'play', openDailyCombo: true }) },
      { id: 'collection-cards', title: 'Collection Cards', subtitle: 'Open card collection progression', icon: ic['collection-cards'], onClick: () => goView('collection') },
      { id: 'weekly-event', title: 'Weekly Event', subtitle: 'Complete weekly objectives', icon: ic['weekly-event'], onClick: () => goEarn({ earnFeatureTab: 'play', openWeeklyEvent: true }) },
      { id: 'global-joinable-tasks', title: 'Global Joinable Tasks', subtitle: 'Join league/team global competitions', icon: ic['global-joinable-tasks'], onClick: () => goEarn({ earnFeatureTab: 'play', openGlobalTasks: true }) },
      { id: 'ura-quiz', title: 'URA Quiz', subtitle: 'Quiz and earn PEARLS', icon: ic['ura-quiz'], onClick: () => goEarn({ earnFeatureTab: 'play', openMitrolabsQuiz: true }) },
      { id: 'receipt-rush', title: 'Receipt Rush', subtitle: 'Receipt activity tracking', icon: ic['receipt-rush'], onClick: () => goEarn({ earnFeatureTab: 'play', activeTabAll: true }) },
      {
        id: 'true-false',
        title: 'True or False – Uganda Tax Edition',
        subtitle: 'Tax knowledge challenge',
        icon: ic['true-false'],
        onClick: () => goEarn({ earnFeatureTab: 'play', activeTabAll: true }),
      },
      { id: 'leaderboard', title: 'Level & Leaderboard', subtitle: 'Track your ranking progress', icon: ic.leaderboard, onClick: () => goView('game') },
      { id: 'karibu-daily', title: 'Karibu Daily', subtitle: 'Daily reward check-in', icon: ic['karibu-daily'], onClick: () => goEarn({ earnFeatureTab: 'play', openDailyLogin: true }) },
      { id: 'tap-arena', title: 'Tap Arena', subtitle: 'Classic tap gameplay (rebranded from Game)', icon: ic['tap-arena'], onClick: () => goView('game') },
      { id: 'mine-flow', title: 'Mine Flow', subtitle: 'Passive mining mode (rebranded from Mine)', icon: ic['mine-flow'], onClick: () => goView('mine') },
      { id: 'pearls-collection', title: 'PEARLS Collection', subtitle: 'Card/progression collection', icon: ic['pearls-collection'], onClick: () => goView('collection') },
      { id: 'citizen-network', title: 'Citizen Network', subtitle: 'Referrals and social growth (from Friends)', icon: ic['citizen-network'], onClick: () => goView('friends') },
      { id: 'pearls-airdrop', title: 'PEARLS Airdrop', subtitle: 'Airdrop and campaign rewards', icon: ic['pearls-airdrop'], onClick: () => goView('airdrop') },
    ];
  }, [setCurrentView]);

  useEffect(() => {
    if (!showEcosystemDashboard || typeof document === 'undefined') return;
    const el = document.getElementById('home-ecosystem-panel');
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [showEcosystemDashboard]);

  return (
    <div className="bg-black flex justify-center min-h-screen">
      {/* Side drawer-handle: opens ecosystem popup (matches edge tab + left chevron pattern) */}
      <button
        type="button"
        onClick={() => {
          triggerHapticFeedback(window);
          setShowEcosystemDashboard((open) => !open);
        }}
        aria-label={showEcosystemDashboard ? 'Hide URA Civilizational Ecosystem' : 'Open URA Civilizational Ecosystem'}
        aria-expanded={showEcosystemDashboard}
        className="fixed right-0 top-1/2 z-[45] -translate-y-1/2 flex items-center justify-center rounded-l-2xl border border-r-0 border-white/12 bg-[#1f2229] py-6 pl-2.5 pr-1 shadow-[-6px_0_16px_rgba(0,0,0,0.35)] transition-colors hover:bg-[#262a32] active:bg-[#181b21] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          className={`h-5 w-5 text-white transition-transform duration-200 ${showEcosystemDashboard ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>

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

          {showEcosystemDashboard ? (
            <div
              className="mt-4 rounded-xl border border-[#2d2f38] bg-[#11141d] p-2 scroll-mt-4"
              id="home-ecosystem-panel"
              role="region"
              aria-label="URA Civilizational Ecosystem"
            >
              <div className="mb-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setShowEcosystemDashboard(false);
                  }}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Close
                </button>
              </div>
              <EcosystemRadialDashboard
                modules={homeEcosystemModules}
                onHaptic={() => triggerHapticFeedback(window)}
                onBottomNav={(key: EcosystemBottomNavKey) => {
                  setShowEcosystemDashboard(false);
                  switch (key) {
                    case 'learn':
                      queueEarnBootstrap({ earnFeatureTab: 'learn' });
                      setCurrentView('earn');
                      break;
                    case 'earn':
                      queueEarnBootstrap({ earnFeatureTab: 'earn' });
                      setCurrentView('earn');
                      break;
                    case 'engage':
                      queueEarnBootstrap({ earnFeatureTab: 'play', activeTabAll: true });
                      setCurrentView('earn');
                      break;
                    case 'empower':
                      setCurrentView('airdrop');
                      break;
                    case 'elevate':
                      setCurrentView('game');
                      break;
                    default:
                      break;
                  }
                }}
              />
            </div>
          ) : null}

          <section className="mt-6" aria-label="Action Center">
            <h2 className="text-lg font-bold text-white tracking-tight mb-3">Action Center</h2>

            <div className="rounded-xl border border-[#2d2f38] bg-[#151821] p-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[var(--ura-yellow)] tracking-tight">Total PEARLS</h3>
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
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setShowRanksPopup(true);
                  }}
                  aria-label={`Rank: ${rankTierName}, step ${rankStepDisplay} of 4. Tap for details.`}
                  className="mt-1.5 w-full text-left text-xs bg-transparent border-0 p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ura-yellow)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#151821] rounded-sm transition-colors hover:opacity-95 active:opacity-85"
                >
                  <span className="text-[var(--ura-yellow)] font-semibold underline-offset-2 decoration-[var(--ura-yellow)]/40 hover:underline">{rankTierName}</span>
                  <span className="text-gray-600 mx-1">·</span>
                  <span className="text-white font-medium tabular-nums">{rankStepDisplay}</span>
                  <span className="text-gray-500 tabular-nums"> / 4</span>
                  <span className="ml-1.5 text-[10px] font-normal text-gray-500">Tap for details</span>
                </button>
                <div className="mt-4 space-y-2">
                  {[
                    { key: 'white', label: 'White pearl', value: liveWhitePearls, color: 'text-slate-200', hint: 'From taps & instant approved tasks', image: pearlWhite },
                    { key: 'blue', label: 'Blue pearl', value: bluePearls, color: 'text-[#5fa8ff]', hint: 'From approval-required tasks', image: pearlBlue },
                    { key: 'goldish', label: 'Golden Pearl', value: goldishPearls, color: 'text-[var(--ura-yellow)]', hint: 'Approved & withdraw-ready pearls', image: pearlGolden },
                  ].map((item) => (
                    <div key={item.key} className="rounded-lg border border-[#2a2d38] bg-[#12141a] px-2.5 py-2 flex items-center gap-2">
                      <Image src={item.image} alt={item.label} width={28} height={28} className="h-7 w-7 object-contain flex-shrink-0" />
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

            <div className="mt-4 rounded-xl border border-[#2d2f38] bg-[#161923] p-1 grid grid-cols-2 gap-1">
              {(
                [
                  { key: 'most-used' as const, label: 'Most used' },
                  { key: 'favorites' as const, label: 'Favorites' },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setActiveActionTab(key);
                  }}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    activeActionTab === key ? 'bg-[var(--ura-blue-dark)] text-white' : 'text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeActionTab === 'favorites' ? (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setShowFavoritesManager(true);
                  }}
                  className="w-full rounded-lg border border-[#2d2f38] bg-[#11141b] px-3 py-2 text-sm font-semibold text-gray-200 hover:border-[var(--ura-yellow)] transition-colors"
                >
                  + Manage favorites
                </button>
              </div>
            ) : null}

            <div className="mt-4 space-y-2">
              {displayedItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAction(item)}
                  className="w-full rounded-xl border border-[#2d2f38] bg-[#151821] px-4 py-3 text-left hover:border-[var(--ura-yellow)] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg border border-[#2f3340] bg-[#0f1218] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.icon ? (
                        <Image src={item.icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-gray-300">{item.title.slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm leading-snug">{item.title}</p>
                      {item.subtitle ? (
                        <p className="text-xs text-gray-400 mt-1">{item.subtitle}</p>
                      ) : null}
                    </div>
                  </div>
                  {item.group ? (
                    <p className="mt-1 text-[11px] text-gray-500 uppercase tracking-wide">{item.group}</p>
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
              {displayedItems.length === 0 ? (
                <div className="w-full rounded-xl border border-dashed border-[#2d2f38] bg-[#151821] px-4 py-3 text-left">
                  <p className="font-semibold text-white text-sm">{activeActionTab === 'most-used' ? 'No most-used items yet' : 'No favorites yet'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activeActionTab === 'most-used'
                      ? 'Use activities and your most visited options will appear here automatically.'
                      : 'Open “Manage favorites” to add items by search or manual entry.'}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      {showFavoritesManager && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[1px] p-4 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-[#2d2f38] bg-[#13161d] p-4 max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Manage favorites</h3>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setShowFavoritesManager(false);
                }}
                className="text-sm text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <input
                value={favoritesSearch}
                onChange={(e) => setFavoritesSearch(e.target.value)}
                placeholder="Search activities to add"
                className="w-full rounded-lg border border-[#2d2f38] bg-[#0f1218] px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[var(--ura-yellow)]"
              />
              <div className="space-y-2">
                {availableFavoriteOptions.slice(0, 8).map((item) => (
                  <div key={item.id} className="rounded-lg border border-[#2d2f38] bg-[#11141b] px-3 py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                      {item.subtitle ? <p className="text-xs text-gray-400 truncate">{item.subtitle}</p> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => addCatalogFavorite(item.id)}
                      className="text-xs rounded-md border border-[#3a3f4d] px-2 py-1 text-gray-200 hover:border-[var(--ura-yellow)]"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-[#2a2f39] pt-3">
              <p className="text-sm font-semibold text-white">Add manually</p>
              <div className="mt-2 space-y-2">
                <input
                  value={manualFavoriteTitle}
                  onChange={(e) => setManualFavoriteTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full rounded-lg border border-[#2d2f38] bg-[#0f1218] px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[var(--ura-yellow)]"
                />
                <input
                  value={manualFavoriteSubtitle}
                  onChange={(e) => setManualFavoriteSubtitle(e.target.value)}
                  placeholder="Subtitle (optional)"
                  className="w-full rounded-lg border border-[#2d2f38] bg-[#0f1218] px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[var(--ura-yellow)]"
                />
                <input
                  value={manualFavoriteRoute}
                  onChange={(e) => setManualFavoriteRoute(e.target.value)}
                  placeholder="Route (e.g. earn, game) optional"
                  className="w-full rounded-lg border border-[#2d2f38] bg-[#0f1218] px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[var(--ura-yellow)]"
                />
                <button
                  type="button"
                  onClick={addManualFavorite}
                  className="w-full rounded-lg border border-[#2d2f38] bg-[#11141b] px-3 py-2 text-sm font-semibold text-gray-100 hover:border-[var(--ura-yellow)]"
                >
                  Add manual favorite
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-[#2a2f39] pt-3">
              <p className="text-sm font-semibold text-white">Current favorites</p>
              <div className="mt-2 space-y-2">
                {favoriteIds.map((id) => {
                  const item = ACTION_CATALOG.find((x) => x.id === id);
                  if (!item) return null;
                  return (
                    <div key={item.id} className="rounded-lg border border-[#2d2f38] bg-[#11141b] px-3 py-2 flex items-center justify-between gap-2">
                      <p className="text-sm text-white truncate">{item.title}</p>
                      <button
                        type="button"
                        onClick={() => removeCatalogFavorite(item.id)}
                        className="text-xs rounded-md border border-[#3a3f4d] px-2 py-1 text-gray-200 hover:border-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
                {customFavorites.map((item) => (
                  <div key={item.id} className="rounded-lg border border-[#2d2f38] bg-[#11141b] px-3 py-2 flex items-center justify-between gap-2">
                    <p className="text-sm text-white truncate">{item.title}</p>
                    <button
                      type="button"
                      onClick={() => setCustomFavorites((prev) => prev.filter((x) => x.id !== item.id))}
                      className="text-xs rounded-md border border-[#3a3f4d] px-2 py-1 text-gray-200 hover:border-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showRanksPopup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[1px] p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-[#2d2f38] bg-[#13161d] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Ranks</h3>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setShowRanksPopup(false);
                }}
                className="text-sm text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Current status: <span className="text-white font-semibold">{ranks[userRankIndex].name}</span>
            </p>

            <div className="mt-3 space-y-2">
              {ranks.map((rank) => {
                const isCurrent = rank.id === userRankIndex;
                return (
                  <div
                    key={rank.id}
                    className={`rounded-xl border px-3 py-2 ${rank.tone} ${isCurrent ? 'ring-1 ring-[var(--ura-yellow)]' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Image src={rank.image} alt={`${rank.color} rank`} width={28} height={28} className="h-7 w-7 rounded-md object-cover border border-[#3a3d46]" />
                        <p className="text-sm font-semibold text-white truncate">{rank.color} - {rank.name}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {isCurrent ? (
                          <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-[var(--ura-yellow)] text-black">CURRENT</span>
                        ) : (
                          <span className="text-[10px] text-gray-400">Locked</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
