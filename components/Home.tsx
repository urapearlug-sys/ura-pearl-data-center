'use client';

import { useEffect, useMemo, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { dailyCipher, dailyCombo, dailyReward, defaultProfileAvatar, pearlBlue, pearlGolden, pearlWhite, rankBlue, rankGold, rankSilver, rankWhite, uraFiscalFunHomeBanner, uraTreasuryCounter } from '@/images';
import { calculateLevelIndex, useGameStore } from '@/utils/game-mechanics';
import { LEVELS } from '@/utils/consts';
import { triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';
import { PEARLS_BALANCE_REFRESH_EVENT } from '@/utils/pearl-balance-events';
import { applyPearlsMeClientPayload } from '@/utils/apply-pearls-me-client';
import { EcosystemRadialDashboard, type EcosystemBottomNavKey, type EcosystemDashboardModule } from '@/components/ecosystem';
import { queueEarnBootstrap, type EarnBootstrapPayload } from '@/utils/earn-bootstrap';
import { karibuDaysCompleted } from '@/utils/karibu-daily-ui';
import SupportChatWidget from '@/components/SupportChatWidget';
import NotificationCenter from '@/components/NotificationCenter';
import UraTaxCalculatorsModal, {
  type UraTaxCalcCategory,
} from '@/components/UraTaxCalculatorsModal';
import KaribuDailyPopup from '@/components/KaribuDailyPopup';
import HomeNoticesTicker from '@/components/HomeNoticesTicker';
import KamisonaChatPopup from '@/components/quick-access/KamisonaChatPopup';
import PayAgainstPrnPopup from '@/components/quick-access/PayAgainstPrnPopup';
import RegisterPaymentPopup from '@/components/quick-access/RegisterPaymentPopup';

type QuickAccessId = 'pay-prn' | 'register-payment' | 'ask-kamisona';

const HOME_QUICK_ACCESS: { id: QuickAccessId; title: string; emoji: string }[] = [
  { id: 'register-payment', title: 'Register new payment', emoji: '🎫' },
  { id: 'pay-prn', title: 'Pay against PRN', emoji: '💳' },
  { id: 'ask-kamisona', title: 'Ask the Kamisona', emoji: '🗣️' },
];

type ActionCenterTab = 'most-used' | 'favorites';

const HOME_ECOSYSTEM_ICONS: Record<string, string> = {
  'register-payment': '🎫',
  'pay-prn': '💳',
  'ask-kamisona': '🗣️',
  'ura-tv': '📺',
  opportunities: '🏛️',
  'ura-fc': '⚽',
  'tax-calculators': '🧮',
  'ura-quiz': '📝',
  'true-false': '⚖️',
  'receipt-rush': '🧾',
  'voice-reports': '🎙️',
  'whistle-blower': '📣',
  'rate-service': '⭐',
  'earn-tenure': '🤝',
  services: '🔗',
  'karibu-daily': '📅',
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
  { id: 'receipt', title: 'Receipt Rush', subtitle: 'Blue pearls · needs approval', pearlType: 'blue', route: 'earn', group: 'play', icon: dailyCombo },
  { id: 'truefalse', title: 'True or False — Uganda tax edition', subtitle: 'White pearls · no approval', pearlType: 'white', group: 'play', icon: dailyCipher },
  { id: 'leaderboard', title: 'Level & Leaderboard', subtitle: 'Track total pearl progress', route: 'game', group: 'play', icon: dailyCombo },
  { id: 'karibu', title: 'Karibu Daily', subtitle: 'White pearls · no approval', pearlType: 'white', route: 'earn', group: 'play', icon: dailyReward },
  { id: 'social-earn', title: 'Earn activities', subtitle: 'White pearls · no approval', pearlType: 'white', route: 'earn', group: 'learn', icon: dailyReward },
  { id: 'tax-trivia', title: 'Tax Trivia Live Events', subtitle: 'White pearls · no approval', pearlType: 'white', route: 'earn', group: 'learn', icon: dailyCipher },
  { id: 'voice', title: 'Voice reports', subtitle: 'Blue pearls · needs approval', pearlType: 'blue', route: 'earn', group: 'earn', icon: dailyCombo },
  { id: 'whistle', title: 'Whistle blower', subtitle: 'Blue pearls · needs approval', pearlType: 'blue', route: 'earn', group: 'earn', icon: dailyCombo },
];

/** Shared URA chrome for home Action Center pins (navy / gold / medium blue). */
const URA_PIN_CARD =
  'rounded-2xl border border-[var(--ura-yellow)]/45 bg-[#f4f8ff] px-3 py-3 text-left transition-colors hover:bg-[#e8f0ff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ura-yellow)]/40';
const URA_PIN_ICON =
  'mt-0.5 inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--ura-blue-medium)]/35 bg-white text-lg';
const URA_PIN_TITLE = 'text-sm font-extrabold leading-tight text-[#123f78]';
const URA_PIN_SUB = 'mt-1 text-[13px] leading-snug text-[#335f97]';

const HOME_MOST_USED_KARIBU: ActionItem = {
  id: 'karibu',
  title: 'Karibu Daily',
  subtitle: '10-day login · white pearls',
  pearlType: 'white',
  route: 'earn',
  group: 'play',
  icon: dailyReward,
};

const HOME_MOST_USED_SHORTCUTS: ActionItem[] = [
  { id: 'quiz', title: 'URA Quiz', subtitle: 'Quiz and earn PEARLS', pearlType: 'white', route: 'earn', group: 'play', icon: dailyCipher },
  { id: 'receipt', title: 'Receipt Rush', subtitle: 'Receipt activity tracking', pearlType: 'blue', route: 'earn', group: 'play', icon: dailyCombo },
];

const HOME_SHORTCUT_EMOJI: Record<string, string> = {
  quiz: '📝',
  receipt: '🧾',
};

const HOME_MOST_USED_PINNED_IDS = new Set<string>(['tax-calculators', 'karibu', 'quiz', 'receipt']);

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
  const { userTelegramName, points, pointsBalance, bluePearlsTotal, userTelegramInitData, unsynchronizedPoints } =
    useGameStore();
  const [goldishPearls, setGoldishPearls] = useState(0);
  const [karibuHomeSubtitle, setKaribuHomeSubtitle] = useState('10-day login · 100–1000 white pearls');
  const [taxCalcOpen, setTaxCalcOpen] = useState(false);
  const [taxCalcCategory, setTaxCalcCategory] = useState<UraTaxCalcCategory>('paye');
  const [karibuPopupOpen, setKaribuPopupOpen] = useState(false);
  const [quickAccessOpen, setQuickAccessOpen] = useState(false);
  const [quickAccessFlow, setQuickAccessFlow] = useState<QuickAccessId | null>(null);
  const [payPrnPrefill, setPayPrnPrefill] = useState<string | null>(null);
  const [pearlsHidden, setPearlsHidden] = useState(false);

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
  const pearlsHiddenStorageKey = `ura:home:pearls-hidden:${storagePrefix}`;

  useEffect(() => {
    try {
      setPearlsHidden(localStorage.getItem(pearlsHiddenStorageKey) === '1');
    } catch {
      setPearlsHidden(false);
    }
  }, [pearlsHiddenStorageKey]);

  const togglePearlsHidden = () => {
    triggerHapticFeedback(window);
    setPearlsHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(pearlsHiddenStorageKey, next ? '1' : '0');
      } catch {
        /* quota */
      }
      return next;
    });
  };

  const maskPearls = (value: number | string) => (pearlsHidden ? '•••••' : value);

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

  /** Most-used scores excluding pinned tiles so they are not listed twice. */
  const mostUsedRest = useMemo(
    () => mostUsedItems.filter((item) => !HOME_MOST_USED_PINNED_IDS.has(item.id)),
    [mostUsedItems]
  );

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
        applyPearlsMeClientPayload(data, useGameStore.getState());
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
    if (!userTelegramInitData) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/daily-reward?initData=${encodeURIComponent(userTelegramInitData)}`
        );
        if (!res.ok || cancelled) return;
        const s = await res.json();
        const c = karibuDaysCompleted(s);
        const line = s.claimedToday
          ? `Day ${c}/10 · claimed today`
          : s.canClaimToday
            ? `Day ${c}/10 · open to claim`
            : `Day ${c}/10 · Karibu Daily`;
        setKaribuHomeSubtitle(line);
      } catch {
        /* keep default */
      }
    };
    void load();
    const onKaribu = () => {
      void load();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('karibu-daily-status-changed', onKaribu);
    }
    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') {
        window.removeEventListener('karibu-daily-status-changed', onKaribu);
      }
    };
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
    if (item.route === 'services') {
      setCurrentView('services');
      return;
    }
    if (item.route === 'earn') {
      switch (item.id) {
        case 'karibu':
          setKaribuPopupOpen(true);
          return;
        case 'quiz':
          queueEarnBootstrap({ openMitrolabsQuiz: true });
          setCurrentView('earn');
          return;
        case 'tax-trivia':
          queueEarnBootstrap({ openTaxTriviaLive: true });
          setCurrentView('earn');
          return;
        case 'truefalse':
          queueEarnBootstrap({ openTrueFalse: true });
          setCurrentView('earn');
          return;
        case 'receipt':
          queueEarnBootstrap({ openReceiptRush: true });
          setCurrentView('earn');
          return;
        case 'voice':
          queueEarnBootstrap({ openVoiceReports: true });
          setCurrentView('earn');
          return;
        case 'whistle':
          queueEarnBootstrap({ openWhistleBlower: true });
          setCurrentView('earn');
          return;
        default:
          setCurrentView('earn');
          return;
      }
    }
    if (item.route) {
      setCurrentView(item.route);
      return;
    }
    showToast(`${item.title} — coming soon`, 'success');
  };

  const renderActionCenterItem = (item: ActionItem, rowKey: string) => (
    <button
      key={rowKey}
      type="button"
      onClick={() => handleAction(item)}
      className="w-full rounded-xl border border-[#8bb4ef]/35 bg-[#f4f8ff] px-4 py-3 text-left hover:border-[#f3ba2f]/55 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg border border-[#cfe0ff] bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
          {item.icon ? (
            <Image src={item.icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          ) : (
            <span className="text-xs font-bold text-[#335f97]">{item.title.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#123f78] text-sm leading-snug">{item.title}</p>
          {item.subtitle ? <p className="text-xs text-[#335f97] mt-1">{item.subtitle}</p> : null}
        </div>
      </div>
      {item.group ? <p className="mt-1 text-[11px] text-[#5a7bb0] uppercase tracking-wide">{item.group}</p> : null}
      {item.pearlType ? (
        <p className="mt-1 text-[11px]">
          <span className={item.pearlType === 'white' ? 'text-[#335f97]' : 'text-[#2563c4]'}>
            {item.pearlType === 'white' ? 'White pearl activity' : 'Blue pearl activity'}
          </span>
        </p>
      ) : null}
    </button>
  );

  const openTaxCalculator = (category: UraTaxCalcCategory = 'paye') => {
    triggerHapticFeedback(window);
    setVisitCounts((prev) => ({
      ...prev,
      'tax-calculators': (prev['tax-calculators'] ?? 0) + 1,
    }));
    setTaxCalcCategory(category);
    setTaxCalcOpen(true);
  };

  const renderMostUsedPinned = () => (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => {
          triggerHapticFeedback(window);
          setVisitCounts((prev) => ({
            ...prev,
            'quick-access': (prev['quick-access'] ?? 0) + 1,
          }));
          setQuickAccessOpen(true);
        }}
        className={`w-full ${URA_PIN_CARD} py-3.5`}
      >
        <div className="flex items-start gap-3">
          <span className={`${URA_PIN_ICON} h-10 min-w-10 text-xl`} aria-hidden>
            ⚡
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-extrabold leading-tight text-[#123f78]">Quick access</p>
            <p className="mt-1 text-sm leading-snug text-[#335f97]">
              Register · Pay PRN · Kamisona
            </p>
          </div>
        </div>
      </button>

      <button type="button" onClick={() => openTaxCalculator('paye')} className={`w-full ${URA_PIN_CARD} py-3.5`}>
        <div className="flex items-start gap-3">
          <span className={`${URA_PIN_ICON} h-10 min-w-10 text-xl`} aria-hidden>
            🧮
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-extrabold leading-tight text-[#123f78]">URA Tax Calculators</p>
            <p className="mt-1 text-sm leading-snug text-[#335f97]">
              MV import · PAYE · Rental · Advance MV
            </p>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => handleAction(HOME_MOST_USED_KARIBU)}
        className={`w-full ${URA_PIN_CARD} py-3.5`}
      >
        <div className="flex items-start gap-3">
          <span className={`${URA_PIN_ICON} h-10 min-w-10 text-xl`} aria-hidden>
            📅
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-extrabold leading-tight text-[#123f78]">{HOME_MOST_USED_KARIBU.title}</p>
            <p className="mt-1 text-sm leading-snug text-[#335f97]">{karibuHomeSubtitle}</p>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {HOME_MOST_USED_SHORTCUTS.map((item) => (
          <button key={item.id} type="button" onClick={() => handleAction(item)} className={URA_PIN_CARD}>
            <div className="flex items-start gap-2">
              <span className={URA_PIN_ICON} aria-hidden>
                {HOME_SHORTCUT_EMOJI[item.id] ?? '⭐'}
              </span>
              <div className="min-w-0">
                <p className={URA_PIN_TITLE}>{item.title}</p>
                <p className={URA_PIN_SUB}>{item.subtitle}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

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
    const closeEco = () => setShowEcosystemDashboard(false);
    const goEarn = (payload: EarnBootstrapPayload) => {
      queueEarnBootstrap(payload);
      closeEco();
      setCurrentView('earn');
    };
    const goView = (view: string) => {
      closeEco();
      setCurrentView(view);
    };
    const ic = HOME_ECOSYSTEM_ICONS;
    return [
      {
        id: 'register-payment',
        title: 'Register payment',
        subtitle: 'Simulated PRN registration',
        icon: ic['register-payment'],
        onClick: () => {
          closeEco();
          setQuickAccessFlow('register-payment');
        },
      },
      {
        id: 'pay-prn',
        title: 'Pay PRN',
        subtitle: 'Pay against a registered PRN',
        icon: ic['pay-prn'],
        onClick: () => {
          closeEco();
          setPayPrnPrefill(null);
          setQuickAccessFlow('pay-prn');
        },
      },
      {
        id: 'ask-kamisona',
        title: 'Kamisona',
        subtitle: 'Ask URA · FAQs · handoff',
        icon: ic['ask-kamisona'],
        onClick: () => {
          closeEco();
          setQuickAccessFlow('ask-kamisona');
        },
      },
      {
        id: 'ura-tv',
        title: 'URA TV',
        subtitle: 'Official programmes & feedback',
        icon: ic['ura-tv'],
        onClick: () => goView('ura-tv'),
      },
      {
        id: 'opportunities',
        title: 'Opportunities',
        subtitle: 'Auctions · careers · tenders',
        icon: ic.opportunities,
        onClick: () => goView('opportunities'),
      },
      {
        id: 'ura-fc',
        title: 'URA FC',
        subtitle: 'Fixtures and club news',
        icon: ic['ura-fc'],
        onClick: () => goView('ura-fc'),
      },
      {
        id: 'tax-calculators',
        title: 'Tax calc',
        subtitle: 'PAYE · rental · motor import',
        icon: ic['tax-calculators'],
        onClick: () => {
          closeEco();
          setTaxCalcOpen(true);
        },
      },
      {
        id: 'ura-quiz',
        title: 'URA Quiz',
        subtitle: 'Tax quiz · earn PEARLS',
        icon: ic['ura-quiz'],
        onClick: () => goEarn({ openMitrolabsQuiz: true }),
      },
      {
        id: 'true-false',
        title: 'True / False',
        subtitle: 'Uganda tax · 3 for PEARLS',
        icon: ic['true-false'],
        onClick: () => goEarn({ openTrueFalse: true }),
      },
      {
        id: 'receipt-rush',
        title: 'Receipt Rush',
        subtitle: 'Submit tax receipts',
        icon: ic['receipt-rush'],
        onClick: () => goEarn({ openReceiptRush: true }),
      },
      {
        id: 'voice-reports',
        title: 'Voice report',
        subtitle: 'Share feedback with URA',
        icon: ic['voice-reports'],
        onClick: () => goEarn({ openVoiceReports: true }),
      },
      {
        id: 'whistle-blower',
        title: 'Whistle blow',
        subtitle: 'Report tax evasion',
        icon: ic['whistle-blower'],
        onClick: () => goEarn({ openWhistleBlower: true }),
      },
      {
        id: 'rate-service',
        title: 'Rate service',
        subtitle: 'Warehousing & URA experience',
        icon: ic['rate-service'],
        onClick: () => goEarn({ openRateService: 'warehousing' }),
      },
      {
        id: 'earn-tenure',
        title: 'Earn tenure',
        subtitle: 'Citizen tax pledge',
        icon: ic['earn-tenure'],
        onClick: () => goEarn({ openEarnTenure: true }),
      },
      {
        id: 'services',
        title: 'URA Services',
        subtitle: 'Official ura.go.ug links',
        icon: ic.services,
        onClick: () => goView('services'),
      },
      {
        id: 'karibu-daily',
        title: 'Karibu Daily',
        subtitle: 'Login streak · white PEARLS',
        icon: ic['karibu-daily'],
        onClick: () => {
          closeEco();
          setKaribuPopupOpen(true);
        },
      },
    ];
  }, [setCurrentView]);

  useEffect(() => {
    if (!showEcosystemDashboard || typeof document === 'undefined') return;
    const el = document.getElementById('home-ecosystem-panel');
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [showEcosystemDashboard]);

  return (
    <div className="bg-[#0f3c86] flex justify-center min-h-screen">
      {/* Side drawer-handle: opens ecosystem popup (matches edge tab + left chevron pattern) */}
      <button
        type="button"
        onClick={() => {
          triggerHapticFeedback(window);
          setShowEcosystemDashboard((open) => !open);
        }}
        aria-label={showEcosystemDashboard ? 'Hide URA Civilizational Ecosystem' : 'Open URA Civilizational Ecosystem'}
        aria-expanded={showEcosystemDashboard}
        className="fixed right-0 top-1/2 z-[45] -translate-y-1/2 flex items-center justify-center rounded-l-2xl border border-r-0 border-[#8bb4ef]/45 bg-[#0f315f]/95 py-6 pl-2.5 pr-1 shadow-[-6px_0_16px_rgba(15,49,95,0.45)] transition-colors hover:bg-[#123f78] active:bg-[#0f315f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3ba2f]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f3c86]"
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

      <div className="w-full bg-[#0f3c86] text-white flex flex-col max-w-xl pb-24">
        <div className="px-4 pt-4">
          <div className="w-full rounded-2xl border border-[#8bb4ef]/35 bg-[#f4f8ff] p-3 flex items-center gap-3 hover:border-[#f3ba2f]/55 transition-colors">
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(window);
                setCurrentView('settings');
              }}
              className="min-w-0 flex-1 flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3ba2f]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f8ff] rounded-xl"
            >
              <div className="w-10 h-10 rounded-full border border-[#8bb4ef]/50 overflow-hidden bg-white flex-shrink-0 relative">
                <Image src={defaultProfileAvatar} alt="Profile" fill className="object-cover" sizes="40px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[#335f97]">URA Platform · Profile</p>
                <p className="font-semibold truncate text-[#123f78]">{userTelegramName || 'Citizen'}</p>
              </div>
            </button>
            <div className="shrink-0 flex items-center justify-center pl-1 pr-2 border-l border-[#8bb4ef]/40">
              <div className="rounded-full bg-[#e8eef9] border border-[#8bb4ef]/55 p-1 shadow-sm">
                <NotificationCenter />
              </div>
            </div>
            <div
              className="shrink-0 flex flex-col items-center justify-center px-2 py-1 border-l border-[#8bb4ef]/40 min-w-[4.5rem]"
              title={
                unsynchronizedPoints >= 1
                  ? 'Taps are syncing to the server in the background.'
                  : 'Connected to server (sync active).'
              }
            >
              <p className="text-[10px] font-semibold text-[#5a7bb0] uppercase tracking-wide">Sync</p>
              <div className="flex items-center justify-center mt-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    unsynchronizedPoints >= 1 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 animate-pulse'
                  }`}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <HomeNoticesTicker
              storageKey={`ura:home:notices-read:${storagePrefix}`}
              onOpenCategory={(category) => {
                setCurrentView(category === 'tender' ? 'tenders' : 'opportunities');
              }}
            />
          </div>

          <div className="mt-2 rounded-2xl overflow-hidden border border-[#8bb4ef]/35 bg-[#f5f0e8]">
            <Image
              src={uraFiscalFunHomeBanner}
              alt="Fiscal Fun — Uganda Revenue Authority"
              width={640}
              height={360}
              className="w-full h-auto object-cover"
              sizes="(max-width: 576px) 100vw, 576px"
              priority
            />
          </div>

          {showEcosystemDashboard ? (
            <div
              className="mt-4 rounded-xl border border-[#8bb4ef]/35 bg-[#f4f8ff] p-2 scroll-mt-4"
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
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-[#335f97] transition-colors hover:bg-white/80 hover:text-[#123f78] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3ba2f]/40"
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
                      setCurrentView('eearn');
                      break;
                    case 'earn':
                      setCurrentView('earn');
                      break;
                    case 'engage':
                      queueEarnBootstrap({ activeTabAll: true });
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

            <div className="rounded-xl border border-[#8bb4ef]/35 bg-[#f4f8ff] p-3">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#c9a227] tracking-tight">Total PEARLS</h3>
                  <button
                    type="button"
                    onClick={togglePearlsHidden}
                    aria-pressed={pearlsHidden}
                    aria-label={pearlsHidden ? 'Show pearl values' : 'Hide pearl values'}
                    className="rounded-lg border border-[#8bb4ef]/45 bg-white p-2 text-[#123f78] hover:border-[#f3ba2f]/50"
                  >
                    {pearlsHidden ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                        <circle cx="12" cy="12" r="3" />
                        <path d="M3 3l18 18" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={uraTreasuryCounter}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 flex-shrink-0 object-contain"
                  />
                  <span className="text-2xl font-bold text-[#123f78] tabular-nums tracking-tight">
                    {maskPearls(pearlsDisplay)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setShowRanksPopup(true);
                  }}
                  aria-label={`Rank: ${rankTierName}, step ${rankStepDisplay} of 4. Tap for details.`}
                  className="mt-1.5 w-full text-left text-xs bg-transparent border-0 p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3ba2f]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f8ff] rounded-sm transition-colors hover:opacity-95 active:opacity-85"
                >
                  <span className="text-[#c9a227] font-semibold underline-offset-2 decoration-[#f3ba2f]/50 hover:underline">{rankTierName}</span>
                  <span className="text-[#8aa3c4] mx-1">·</span>
                  <span className="text-[#16427f] font-medium tabular-nums">{rankStepDisplay}</span>
                  <span className="text-[#5a7bb0] tabular-nums"> / 4</span>
                  <span className="ml-1.5 text-[10px] font-normal text-[#5a7bb0]">Tap for details</span>
                </button>
                <div className="mt-4 space-y-2">
                  {[
                    { key: 'white', label: 'White pearl', value: liveWhitePearls, color: 'text-[#335f97]', hint: 'From taps & instant approved tasks', image: pearlWhite },
                    { key: 'blue', label: 'Blue pearl', value: bluePearlsTotal, color: 'text-[#2563c4]', hint: 'Pending + approved (includes wallet white→blue)', image: pearlBlue },
                    { key: 'goldish', label: 'Golden Pearl', value: goldishPearls, color: 'text-[#c9a227]', hint: 'Approved & withdraw-ready pearls', image: pearlGolden },
                  ].map((item) => (
                    <div key={item.key} className="rounded-lg border border-[#dbe9ff] bg-white px-2.5 py-2 flex items-center gap-2">
                      <Image src={item.image} alt={item.label} width={28} height={28} className="h-7 w-7 object-contain flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold ${item.color}`}>{item.label}</p>
                        <p className="text-[10px] text-[#5a7bb0] truncate">{item.hint}</p>
                      </div>
                      <p className="text-sm font-bold text-[#123f78] tabular-nums">
                        {maskPearls(item.value.toLocaleString())}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#8bb4ef]/35 bg-[#0f315f]/90 p-1 grid grid-cols-2 gap-1">
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
                    activeActionTab === key ? 'bg-[#f4f8ff] text-[#123f78] border border-[#f3ba2f]/45' : 'text-blue-100/90'
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
                  className="w-full rounded-lg border border-[#8bb4ef]/35 bg-white px-3 py-2 text-sm font-semibold text-[#123f78] hover:border-[#f3ba2f]/55 transition-colors"
                >
                  + Manage favorites
                </button>
              </div>
            ) : null}

            <div className="mt-4 space-y-2">
              {activeActionTab === 'most-used' ? (
                <>
                  {renderMostUsedPinned()}
                  {mostUsedRest.length > 0 ? (
                    <>
                      <p className="mt-4 pt-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100/80">Your most used</p>
                      <div className="space-y-2">{mostUsedRest.map((item) => renderActionCenterItem(item, item.id))}</div>
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  {favoriteItems.map((item) => renderActionCenterItem(item, item.id))}
                  {favoriteItems.length === 0 ? (
                    <div className="w-full rounded-xl border border-dashed border-[#8bb4ef]/45 bg-[#f4f8ff] px-4 py-3 text-left">
                      <p className="font-semibold text-[#123f78] text-sm">No favorites yet</p>
                      <p className="text-xs text-[#335f97] mt-1">Open “Manage favorites” to add items by search or manual entry.</p>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {showFavoritesManager && (
        <div className="fixed inset-0 z-50 bg-[#0f315f]/55 backdrop-blur-[1px] p-4 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-[#8bb4ef]/35 bg-[#f4f8ff] p-4 max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#123f78]">Manage favorites</h3>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setShowFavoritesManager(false);
                }}
                className="text-sm text-[#335f97] hover:text-[#123f78]"
              >
                Close
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <input
                value={favoritesSearch}
                onChange={(e) => setFavoritesSearch(e.target.value)}
                placeholder="Search activities to add"
                className="w-full rounded-lg border border-[#8bb4ef]/40 bg-white px-3 py-2 text-sm text-[#123f78] placeholder:text-[#5a7bb0] outline-none focus:border-[#f3ba2f]/70"
              />
              <div className="space-y-2">
                {availableFavoriteOptions.slice(0, 8).map((item) => (
                  <div key={item.id} className="rounded-lg border border-[#8bb4ef]/30 bg-white px-3 py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#123f78] truncate">{item.title}</p>
                      {item.subtitle ? <p className="text-xs text-[#335f97] truncate">{item.subtitle}</p> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => addCatalogFavorite(item.id)}
                      className="text-xs rounded-md border border-[#8bb4ef]/45 px-2 py-1 text-[#16427f] hover:border-[#f3ba2f]/60"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-[#dbe9ff] pt-3">
              <p className="text-sm font-semibold text-[#123f78]">Add manually</p>
              <div className="mt-2 space-y-2">
                <input
                  value={manualFavoriteTitle}
                  onChange={(e) => setManualFavoriteTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full rounded-lg border border-[#8bb4ef]/40 bg-white px-3 py-2 text-sm text-[#123f78] placeholder:text-[#5a7bb0] outline-none focus:border-[#f3ba2f]/70"
                />
                <input
                  value={manualFavoriteSubtitle}
                  onChange={(e) => setManualFavoriteSubtitle(e.target.value)}
                  placeholder="Subtitle (optional)"
                  className="w-full rounded-lg border border-[#8bb4ef]/40 bg-white px-3 py-2 text-sm text-[#123f78] placeholder:text-[#5a7bb0] outline-none focus:border-[#f3ba2f]/70"
                />
                <input
                  value={manualFavoriteRoute}
                  onChange={(e) => setManualFavoriteRoute(e.target.value)}
                  placeholder="Route (e.g. earn, game) optional"
                  className="w-full rounded-lg border border-[#8bb4ef]/40 bg-white px-3 py-2 text-sm text-[#123f78] placeholder:text-[#5a7bb0] outline-none focus:border-[#f3ba2f]/70"
                />
                <button
                  type="button"
                  onClick={addManualFavorite}
                  className="w-full rounded-lg border border-[#8bb4ef]/35 bg-[#e8f1ff] px-3 py-2 text-sm font-semibold text-[#123f78] hover:border-[#f3ba2f]/55"
                >
                  Add manual favorite
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-[#dbe9ff] pt-3">
              <p className="text-sm font-semibold text-[#123f78]">Current favorites</p>
              <div className="mt-2 space-y-2">
                {favoriteIds.map((id) => {
                  const item = ACTION_CATALOG.find((x) => x.id === id);
                  if (!item) return null;
                  return (
                    <div key={item.id} className="rounded-lg border border-[#8bb4ef]/30 bg-white px-3 py-2 flex items-center justify-between gap-2">
                      <p className="text-sm text-[#123f78] truncate">{item.title}</p>
                      <button
                        type="button"
                        onClick={() => removeCatalogFavorite(item.id)}
                        className="text-xs rounded-md border border-[#8bb4ef]/45 px-2 py-1 text-[#16427f] hover:border-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
                {customFavorites.map((item) => (
                  <div key={item.id} className="rounded-lg border border-[#8bb4ef]/30 bg-white px-3 py-2 flex items-center justify-between gap-2">
                    <p className="text-sm text-[#123f78] truncate">{item.title}</p>
                    <button
                      type="button"
                      onClick={() => setCustomFavorites((prev) => prev.filter((x) => x.id !== item.id))}
                      className="text-xs rounded-md border border-[#8bb4ef]/45 px-2 py-1 text-[#16427f] hover:border-red-400"
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
        <div className="fixed inset-0 z-50 bg-[#0f315f]/55 backdrop-blur-[1px] p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-[#8bb4ef]/35 bg-[#f4f8ff] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#123f78]">Ranks</h3>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setShowRanksPopup(false);
                }}
                className="text-sm text-[#335f97] hover:text-[#123f78]"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-xs text-[#335f97]">
              Current status: <span className="text-[#123f78] font-semibold">{ranks[userRankIndex].name}</span>
            </p>

            <div className="mt-3 space-y-2">
              {ranks.map((rank) => {
                const isCurrent = rank.id === userRankIndex;
                return (
                  <div
                    key={rank.id}
                    className={`rounded-xl border px-3 py-2 ${rank.tone} ${isCurrent ? 'ring-2 ring-[#f3ba2f]/70' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Image src={rank.image} alt={`${rank.color} rank`} width={28} height={28} className="h-7 w-7 rounded-md object-cover border border-[#8bb4ef]/40" />
                        <p className="text-sm font-semibold text-[#123f78] truncate">{rank.color} - {rank.name}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {isCurrent ? (
                          <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-[#f3ba2f] text-[#123f78]">CURRENT</span>
                        ) : (
                          <span className="text-[10px] text-[#5a7bb0]">Locked</span>
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

      {taxCalcOpen ? (
        <UraTaxCalculatorsModal
          initialCategory={taxCalcCategory}
          onClose={() => setTaxCalcOpen(false)}
        />
      ) : null}

      {karibuPopupOpen ? <KaribuDailyPopup onClose={() => setKaribuPopupOpen(false)} /> : null}

      {quickAccessFlow === 'ask-kamisona' ? (
        <KamisonaChatPopup onClose={() => setQuickAccessFlow(null)} />
      ) : null}
      {quickAccessFlow === 'pay-prn' ? (
        <PayAgainstPrnPopup
          initialPrn={payPrnPrefill ?? undefined}
          onClose={() => {
            setPayPrnPrefill(null);
            setQuickAccessFlow(null);
          }}
        />
      ) : null}
      {quickAccessFlow === 'register-payment' ? (
        <RegisterPaymentPopup
          onClose={() => setQuickAccessFlow(null)}
          onPayPrn={(prn) => {
            setQuickAccessFlow(null);
            setPayPrnPrefill(prn);
            setQuickAccessFlow('pay-prn');
          }}
        />
      ) : null}

      {quickAccessOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-access-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuickAccessOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--ura-yellow)]/40 border-t-[3px] border-t-[var(--ura-yellow)] bg-[#f4f8ff] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-3.5 py-3 border-b border-[#8bb4ef]/35 bg-[#0f315f]">
              <div className="min-w-0">
                <h2 id="quick-access-title" className="text-base font-extrabold text-white leading-tight">
                  Quick access
                </h2>
                <p className="text-[11px] text-blue-100/75">In-app simulated services & Kamisona AI</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setQuickAccessOpen(false);
                }}
                className="shrink-0 rounded-xl border border-[#8bb4ef]/40 px-3 py-1.5 text-sm font-semibold text-blue-50 hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="p-3 space-y-2">
              {HOME_QUICK_ACCESS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setVisitCounts((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }));
                    setQuickAccessOpen(false);
                    setQuickAccessFlow(item.id);
                  }}
                  className="w-full rounded-xl border border-[#8bb4ef]/40 bg-white px-3 py-3 text-left hover:border-[var(--ura-yellow)]/55 transition-colors flex items-center gap-3"
                >
                  <span
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#cfe0ff] bg-[#f4f8ff] text-lg"
                    aria-hidden
                  >
                    {item.emoji}
                  </span>
                  <span className="text-sm font-bold text-[#123f78] leading-snug">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <SupportChatWidget placement="clicker" />
    </div>
  );
}
