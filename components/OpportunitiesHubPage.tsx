'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import UraStadiumPageHero from '@/components/UraStadiumPageHero';
import { navLearn } from '@/images';
import { triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';

type TabKey = 'auction' | 'career' | 'tender';

type Notice = {
  id: string;
  category: string;
  title: string;
  body: string | null;
  link: string | null;
  linkLabel: string | null;
  createdAt: string;
};

const TABS: { id: TabKey; label: string; emoji: string }[] = [
  { id: 'auction', label: 'Auctions', emoji: '🔨' },
  { id: 'career', label: 'Careers', emoji: '👔' },
  { id: 'tender', label: 'Tenders', emoji: '📋' },
];

function openExternal(url: string) {
  if (typeof window === 'undefined') return;
  const tg = (
    window as unknown as {
      Telegram?: { WebApp?: { openLink?: (u: string, o?: { try_instant_view?: boolean }) => void } };
    }
  ).Telegram?.WebApp;
  if (tg?.openLink) tg.openLink(url, { try_instant_view: false });
  else window.open(url, '_blank', 'noopener,noreferrer');
}

function matchesTab(category: string, tab: TabKey): boolean {
  const c = category.toLowerCase();
  if (tab === 'tender') return c === 'tender';
  if (tab === 'auction') return c === 'auction';
  return c === 'career' || c === 'opportunity';
}

function formatPosted(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

type Props = {
  setCurrentView: (view: string) => void;
  initialTab?: TabKey;
};

export default function OpportunitiesHubPage({ setCurrentView, initialTab = 'career' }: Props) {
  const showToast = useToast();
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notice | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/opportunity-notices', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Failed');
      setItems(Array.isArray(data.notices) ? data.notices : []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not load', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const filtered = useMemo(() => items.filter((n) => matchesTab(n.category, tab)), [items, tab]);

  return (
    <div className="relative bg-[#0f3c86] min-h-screen pb-28">
      <UraStadiumPageHero
        title="Opportunities"
        description="Auctions, careers, and tenders — published notices from URA."
        icon={navLearn}
      />
      <div className="relative w-full max-w-xl mx-auto px-4 pt-3 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              setCurrentView('eearn');
            }}
            className="rounded-xl border border-[#8bb4ef]/45 bg-[#0f315f]/80 px-4 py-2.5 text-sm font-semibold text-blue-50"
          >
            ← Learn
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl border border-[#f3ba2f]/55 bg-[#f3ba2f]/12 px-4 py-2.5 text-sm font-bold text-[#f3ba2f]"
          >
            Refresh
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Opportunity categories"
          className="grid grid-cols-3 gap-1 rounded-2xl border border-[#8bb4ef]/40 bg-[#061428]/90 p-1"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                triggerHapticFeedback(window);
                setTab(t.id);
                setSelected(null);
              }}
              className={`rounded-xl py-2.5 px-1 text-center transition-colors ${
                tab === t.id
                  ? 'bg-[#f3ba2f] text-[#0a1628] shadow-sm'
                  : 'text-blue-100/80 hover:text-white'
              }`}
            >
              <span className="block text-base leading-none" aria-hidden>
                {t.emoji}
              </span>
              <span className="mt-1 block text-[11px] font-extrabold tracking-wide">{t.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-blue-100/70 text-center py-10">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-blue-100/70 rounded-2xl border border-dashed border-[#8bb4ef]/40 bg-[#0f315f]/40 px-4 py-7 text-center">
            No published {TABS.find((t) => t.id === tab)?.label.toLowerCase()} yet. Admins can publish them
            under Opportunities.
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setSelected(item);
                  }}
                  className="w-full rounded-2xl border border-[#8bb4ef]/40 border-l-[3px] border-l-[#f3ba2f] bg-gradient-to-br from-[#0f315f]/95 to-[#061428] px-4 py-3.5 text-left hover:border-[#f3ba2f]/45 transition-colors"
                >
                  <p className="text-white font-bold text-sm leading-snug pr-6">{item.title}</p>
                  <p className="mt-1 text-[11px] text-blue-100/55">
                    Posted {formatPosted(item.createdAt)} · Tap for full details
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="opportunity-detail-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div
            className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl border border-[#8bb4ef]/40 border-t-[3px] border-t-[#f3ba2f] bg-gradient-to-b from-[#0f315f] to-[#061428] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex justify-between items-start gap-2 px-4 py-3 border-b border-white/10 bg-[#0a1f3d]/95 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#f3ba2f]">
                {TABS.find((t) => matchesTab(selected.category, t.id))?.label ?? 'Notice'}
              </p>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setSelected(null);
                }}
                className="shrink-0 rounded-xl border border-[#8bb4ef]/35 px-3 py-1.5 text-sm font-semibold text-blue-100"
              >
                Close
              </button>
            </div>
            <div className="px-4 py-4 space-y-3">
              <h2 id="opportunity-detail-title" className="text-white font-extrabold text-base leading-snug">
                {selected.title}
              </h2>
              <p className="text-[11px] text-blue-100/60">Published {formatPosted(selected.createdAt)}</p>
              {selected.body ? (
                <div className="rounded-xl border border-[#8bb4ef]/25 bg-[#061428]/80 px-3 py-3">
                  <p className="text-[13px] text-blue-100/90 leading-relaxed whitespace-pre-wrap">{selected.body}</p>
                </div>
              ) : (
                <p className="text-sm text-blue-100/60">No additional details published.</p>
              )}
              {selected.link ? (
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    openExternal(selected.link!);
                  }}
                  className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#0a1628]"
                >
                  {selected.linkLabel || 'Open on URA website'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
