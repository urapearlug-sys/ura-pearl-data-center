'use client';

import { useCallback, useEffect, useState } from 'react';
import UraStadiumPageHero from '@/components/UraStadiumPageHero';
import { navLearn } from '@/images';
import { triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';

export type NoticeCategory = 'opportunity' | 'tender';

type Notice = {
  id: string;
  category: string;
  title: string;
  body: string | null;
  link: string | null;
  linkLabel: string | null;
  createdAt: string;
};

type Props = {
  category: NoticeCategory;
  setCurrentView: (view: string) => void;
};

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

export default function OpportunityNoticesPage({ category, setCurrentView }: Props) {
  const showToast = useToast();
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const isTender = category === 'tender';
  const title = isTender ? 'Tenders' : 'Opportunities';
  const description = isTender
    ? 'Published URA procurement notices and tender updates.'
    : 'Published URA career and opportunity notices.';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunity-notices?category=${category}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Failed to load');
      const list = Array.isArray(data.notices) ? data.notices : [];
      setItems(list);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not load notices', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="relative bg-[#0f3c86] min-h-screen pb-28">
      <UraStadiumPageHero title={title} description={description} icon={navLearn} />
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

        {loading ? (
          <p className="text-sm text-blue-100/70 text-center py-10">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-blue-100/70 rounded-2xl border border-dashed border-[#8bb4ef]/40 bg-[#0f315f]/40 px-4 py-7 text-center">
            No published {isTender ? 'tenders' : 'opportunities'} yet. Admins can publish them from the admin
            panel.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
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
