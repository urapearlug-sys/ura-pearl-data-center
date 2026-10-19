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
  // careers: career or legacy "opportunity"
  return c === 'career' || c === 'opportunity';
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
          <ul className="space-y-3">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-[#8bb4ef]/40 border-t-[3px] border-t-[#f3ba2f] bg-gradient-to-br from-[#0f315f]/95 to-[#061428] px-4 py-3.5"
              >
                <p className="text-white font-bold text-sm leading-snug">{item.title}</p>
                {item.body ? (
                  <p className="mt-2 text-[13px] text-blue-100/80 leading-relaxed whitespace-pre-wrap">
                    {item.body}
                  </p>
                ) : null}
                {item.link ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      openExternal(item.link!);
                    }}
                    className="mt-3 w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#0a1628]"
                  >
                    {item.linkLabel || 'Open details'}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
