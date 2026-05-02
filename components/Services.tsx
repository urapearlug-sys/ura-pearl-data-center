'use client';

import { useMemo, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import {
  announcements,
  baseGift,
  blockchain,
  collection,
  dailyCipher,
  dailyCombo,
  dailyReward,
  earnRewardsIcon,
  friends,
  game,
  mitroplus,
  navServices,
  paidTrophy1,
  pearlBlue,
  pearlGolden,
  pearlWhite,
  telegram,
  total,
  uraFiscalFunBanner,
  uraLanding,
  uraTreasuryCounter,
  website,
  zoom,
} from '@/images';
import {
  URA_SERVICE_CATEGORIES,
  type ServiceImageKey,
  type UraServiceCategoryId,
  type UraServiceItem,
} from '@/data/ura-services-catalog';
import { triggerHapticFeedback } from '@/utils/ui';
import TaxCalculatorModal from '@/components/TaxCalculatorModal';

const SERVICE_IMAGES: Record<ServiceImageKey, StaticImageData> = {
  dailyReward,
  dailyCipher,
  dailyCombo,
  uraTreasuryCounter,
  pearlWhite,
  pearlBlue,
  pearlGolden,
  collection,
  baseGift,
  blockchain,
  uraFiscalFunBanner,
  earnRewardsIcon,
  uraLanding,
  announcements,
  total,
  game,
  friends,
  telegram,
  navServices,
  paidTrophy1,
  mitroplus,
  zoom,
  website,
};

function openServiceUrl(url: string) {
  triggerHapticFeedback(window);
  if (typeof window === 'undefined') return;
  const tg = (window as unknown as { Telegram?: { WebApp?: { openLink?: (u: string, o?: { try_instant_view?: boolean }) => void } } })
    .Telegram?.WebApp;
  if (tg?.openLink) {
    tg.openLink(url, { try_instant_view: false });
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

type SearchHit = { item: UraServiceItem; categoryLabel: string; categoryId: UraServiceCategoryId };

export default function Services() {
  const [activeCategoryId, setActiveCategoryId] = useState<UraServiceCategoryId>('domestic-etax');
  const [search, setSearch] = useState('');
  const [taxCalculatorOpen, setTaxCalculatorOpen] = useState(false);
  const [taxCalculatorRefUrl, setTaxCalculatorRefUrl] = useState('https://ura.go.ug/en/domestic-taxes/');

  const activateService = (item: UraServiceItem) => {
    if (item.inApp === 'tax-calculator') {
      triggerHapticFeedback(window);
      setTaxCalculatorRefUrl(item.url);
      setTaxCalculatorOpen(true);
      return;
    }
    openServiceUrl(item.url);
  };

  const activeCategory = useMemo(
    () => URA_SERVICE_CATEGORIES.find((c) => c.id === activeCategoryId) ?? URA_SERVICE_CATEGORIES[0],
    [activeCategoryId]
  );

  const searchHits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [] as SearchHit[];
    const hits: SearchHit[] = [];
    for (const cat of URA_SERVICE_CATEGORIES) {
      for (const item of cat.services) {
        if (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
        ) {
          hits.push({ item, categoryLabel: cat.shortLabel, categoryId: cat.id });
        }
      }
    }
    return hits;
  }, [search]);

  const showSearchResults = search.trim().length > 0;

  return (
    <div className="bg-black min-h-screen flex justify-center pb-28">
      <div className="w-full max-w-xl flex text-white min-h-screen">
        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col border-r border-white/[0.06]">
          <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-white/[0.08] px-3 pt-4 pb-3">
            <h1 className="text-xl font-bold tracking-tight text-white px-1">URA Services</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 px-1 mb-3">
              Live links to official portals — register, file, pay, and trade in one hub.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden>
                🔍
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by service, sector…"
                className="w-full rounded-2xl bg-[#1a1d24] border border-[#2d323c] pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex-1 px-3 py-4">
            {showSearchResults ? (
              <>
                <h2 className="text-sm font-bold uppercase tracking-wider text-sky-300 mb-3">
                  Search results ({searchHits.length})
                </h2>
                {searchHits.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center rounded-xl border border-dashed border-[#2d323c]">
                    No services match “{search.trim()}”. Try another keyword or pick a category.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {searchHits.map(({ item, categoryLabel, categoryId }) => {
                      const catMeta = URA_SERVICE_CATEGORIES.find((c) => c.id === categoryId)!;
                      return (
                        <ServiceCard
                          key={`${item.id}-search`}
                          item={item}
                          badge={categoryLabel}
                          accentClass={catMeta.accentClass}
                          onActivate={activateService}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className={`text-base font-bold mb-1 ${activeCategory.accentClass}`}>{activeCategory.title}</h2>
                <p className="text-[11px] text-slate-500 mb-4">{activeCategory.services.length} digital entry points</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {activeCategory.services.map((item) => (
                    <ServiceCard key={item.id} item={item} accentClass={activeCategory.accentClass} onActivate={activateService} />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>

        {/* Right category rail (reference layout) */}
        <aside
          className="w-[4.5rem] sm:w-[5.25rem] shrink-0 bg-[#0c0e12] flex flex-col items-stretch py-3 gap-1 border-l border-white/[0.06]"
          aria-label="Service categories"
        >
          {URA_SERVICE_CATEGORIES.map((cat) => {
            const isActive = !showSearchResults && cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setActiveCategoryId(cat.id);
                  setSearch('');
                }}
                className={`mx-1.5 flex flex-col items-center justify-center gap-1 rounded-xl py-3 px-1 transition-all duration-200 border ${
                  isActive ? cat.activeClass : 'border-transparent bg-transparent hover:bg-white/[0.04]'
                }`}
              >
                <span
                  className={`text-2xl leading-none transition-colors ${
                    isActive ? cat.activeIconClass : cat.idleIconClass
                  }`}
                >
                  {cat.sidebarIcon}
                </span>
                <span
                  className={`text-[9px] font-bold text-center leading-tight max-w-[4rem] ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {cat.shortLabel}
                </span>
              </button>
            );
          })}
        </aside>
      </div>

      {taxCalculatorOpen ? (
        <TaxCalculatorModal referenceUrl={taxCalculatorRefUrl} onClose={() => setTaxCalculatorOpen(false)} />
      ) : null}
    </div>
  );
}

function ServiceCard({
  item,
  badge,
  accentClass,
  onActivate,
}: {
  item: UraServiceItem;
  badge?: string;
  accentClass: string;
  onActivate: (item: UraServiceItem) => void;
}) {
  const img = SERVICE_IMAGES[item.imageKey] ?? uraTreasuryCounter;

  return (
    <button
      type="button"
      title={item.description}
      onClick={() => onActivate(item)}
      className="group flex flex-col rounded-2xl bg-gradient-to-b from-[#1e222b] to-[#14171e] border border-[#2a3038] p-2 sm:p-2.5 text-center transition-all duration-200 hover:border-sky-400/35 hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
    >
      <div className="relative mx-auto w-full aspect-square max-h-[4.5rem] sm:max-h-[5.25rem] rounded-xl overflow-hidden bg-[#0f1218] border border-white/[0.06] mb-1.5">
        <Image src={img} alt="" fill className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300" sizes="120px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 pointer-events-none" />
      </div>
      {badge ? (
        <span className={`text-[8px] font-bold uppercase tracking-wide mb-0.5 ${accentClass}`}>{badge}</span>
      ) : null}
      <span className="text-[10px] sm:text-[11px] font-semibold text-white leading-tight line-clamp-3 min-h-[2.5rem] text-center">
        {item.title}
      </span>
    </button>
  );
}
