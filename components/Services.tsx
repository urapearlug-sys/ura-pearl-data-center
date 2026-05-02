'use client';

import { useMemo, useState } from 'react';
import {
  GROUP_THEME,
  URA_SERVICE_CATEGORIES,
  URA_SERVICES_DEFAULT_CATEGORY_ID,
  type UraServiceCategory,
  type UraServiceItem,
} from '@/data/ura-services-catalog';
import { triggerHapticFeedback } from '@/utils/ui';
import TaxCalculatorModal from '@/components/TaxCalculatorModal';

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

type SearchHit = { item: UraServiceItem; categoryLabel: string; categoryId: string };

/** Preserve catalog order: first occurrence of each listSection defines bucket order. */
function groupServicesByListSection(services: UraServiceItem[]): { heading: string | null; items: UraServiceItem[] }[] {
  const order: string[] = [];
  const buckets = new Map<string, UraServiceItem[]>();
  for (const item of services) {
    const key = item.listSection?.trim() ?? '';
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(item);
  }
  return order.map((key) => ({
    heading: key ? key : null,
    items: buckets.get(key)!,
  }));
}

function subsectionTitle(
  heading: string | null,
  sectionCount: number
): string | null {
  if (sectionCount <= 1 && !heading) return null;
  if (heading) return heading;
  return 'General';
}

export default function Services() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(URA_SERVICES_DEFAULT_CATEGORY_ID);
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

  const activeTheme = GROUP_THEME[activeCategory.groupId];

  const searchHits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [] as SearchHit[];
    const hits: SearchHit[] = [];
    for (const cat of URA_SERVICE_CATEGORIES) {
      for (const item of cat.services) {
        if (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q) ||
          cat.shortLabel.toLowerCase().includes(q)
        ) {
          hits.push({ item, categoryLabel: cat.shortLabel, categoryId: cat.id });
        }
      }
    }
    return hits;
  }, [search]);

  const showSearchResults = search.trim().length > 0;

  const serviceSections = useMemo(
    () => groupServicesByListSection(activeCategory.services),
    [activeCategory]
  );

  const searchGroupedByCategory = useMemo(() => {
    if (!showSearchResults || searchHits.length === 0) return [] as { category: UraServiceCategory; hits: SearchHit[] }[];
    const map = new Map<string, SearchHit[]>();
    for (const hit of searchHits) {
      if (!map.has(hit.categoryId)) map.set(hit.categoryId, []);
      map.get(hit.categoryId)!.push(hit);
    }
    return URA_SERVICE_CATEGORIES.map((category) => ({
      category,
      hits: map.get(category.id) ?? [],
    })).filter((x) => x.hits.length > 0);
  }, [searchHits, showSearchResults]);

  return (
    <div className="bg-black min-h-screen flex justify-center pb-28">
      <div className="w-full max-w-xl flex text-white min-h-0 items-stretch">
        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col border-r border-white/[0.06]">
          <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-white/[0.08] px-3 pt-4 pb-3">
            <h1 className="text-xl font-bold tracking-tight text-white px-1">URA Services</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 px-1 mb-1">
              Official portals and tools — domestic tax, customs, Single Window (UESW), legal, careers, research, and partner links.
            </p>
            {!showSearchResults ? (
              <p className={`text-[10px] font-semibold uppercase tracking-wider px-1 mb-3 ${activeTheme.accentClass}`}>
                Viewing: {activeCategory.sidebarIcon} {activeCategory.shortLabel}
              </p>
            ) : (
              <p className="text-[10px] text-slate-600 px-1 mb-3">Search across all categories</p>
            )}
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
                    No services match “{search.trim()}”. Try another keyword or pick a category on the right.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {searchGroupedByCategory.map(({ category, hits }) => {
                      const th = GROUP_THEME[category.groupId];
                      return (
                        <section key={category.id} aria-labelledby={`search-cat-${category.id}`}>
                          <h3
                            id={`search-cat-${category.id}`}
                            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-white/[0.08] ${th.accentClass}`}
                          >
                            <span aria-hidden>{category.sidebarIcon}</span>
                            {category.shortLabel}
                            <span className="text-slate-500 font-normal normal-case">({hits.length})</span>
                          </h3>
                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                            {hits.map(({ item, categoryId }) => (
                              <ServiceCard
                                key={`${item.id}-${categoryId}-search`}
                                item={item}
                                badge={item.listSection}
                                accentClass={th.accentClass}
                                onActivate={activateService}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="rounded-xl border border-white/[0.09] bg-[#0e1116] px-3 py-3 mb-4 shadow-inner shadow-black/30">
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl leading-none shrink-0" aria-hidden>
                      {activeCategory.sidebarIcon}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.accentClass}`}>
                        {activeCategory.shortLabel}
                      </p>
                      <h2 className={`text-base font-bold leading-snug mt-0.5 ${activeTheme.accentClass}`}>
                        {activeCategory.title}
                      </h2>
                      {activeCategory.listIntro ? (
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{activeCategory.listIntro}</p>
                      ) : null}
                      <p className="text-[10px] text-slate-500 mt-2">{activeCategory.services.length} quick links</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {serviceSections.map(({ heading, items }, idx) => {
                    const st = subsectionTitle(heading, serviceSections.length);
                    return (
                      <section key={`sec-${idx}-${heading ?? 'ungrouped'}`} className="space-y-2">
                        {st ? (
                          <h3
                            className={`text-[11px] font-bold uppercase tracking-wide pl-0.5 border-l-2 border-current ${activeTheme.accentClass} opacity-90`}
                          >
                            {st}
                          </h3>
                        ) : null}
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {items.map((item) => (
                            <ServiceCard
                              key={item.id}
                              item={item}
                              accentClass={activeTheme.accentClass}
                              onActivate={activateService}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>

        {/* Right rail — category chips, evenly spaced to fill viewport */}
        <aside
          className="sticky top-0 w-[min(5.75rem,24vw)] sm:w-[7.25rem] shrink-0 bg-[#080a0d] flex flex-col border-l border-white/[0.08] px-1.5 py-3 gap-2 h-[calc(100dvh-7rem)] max-h-[calc(100dvh-7rem)]"
          aria-label="Service categories"
        >
          {URA_SERVICE_CATEGORIES.map((cat) => {
            const isActive = !showSearchResults && cat.id === activeCategoryId;
            const theme = GROUP_THEME[cat.groupId];
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setActiveCategoryId(cat.id);
                  setSearch('');
                }}
                className={`flex-1 min-h-0 flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 transition-all duration-200 border ${
                  isActive ? theme.activeClass : 'border-transparent bg-transparent hover:bg-white/[0.06]'
                }`}
              >
                <span
                  className={`text-xl sm:text-[1.35rem] leading-none transition-colors ${
                    isActive ? theme.activeIconClass : theme.idleIconClass
                  }`}
                  aria-hidden
                >
                  {cat.sidebarIcon}
                </span>
                <span
                  className={`text-[8px] sm:text-[9px] font-semibold text-center leading-snug px-0.5 ${
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
  return (
    <button
      type="button"
      title={item.description}
      onClick={() => onActivate(item)}
      className="group flex flex-col rounded-xl bg-gradient-to-b from-[#1c1f26] to-[#13161c] border border-[#2a3038] p-1.5 sm:p-2 text-center transition-all duration-200 hover:border-sky-400/30 hover:shadow-md hover:-translate-y-px active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/45"
    >
      <div
        className="mx-auto mb-1 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg bg-[#0d0f14] border border-white/[0.07] text-[1.35rem] sm:text-[1.45rem] leading-none shadow-inner group-hover:bg-[#12151c] transition-colors"
        aria-hidden
      >
        {item.serviceIcon}
      </div>
      {badge ? (
        <span className={`text-[7px] font-bold uppercase tracking-wide mb-0.5 ${accentClass}`}>{badge}</span>
      ) : null}
      <span className="text-[9px] sm:text-[10px] font-medium text-white/95 leading-snug line-clamp-3 min-h-[2.25rem] text-center">
        {item.title}
      </span>
    </button>
  );
}
