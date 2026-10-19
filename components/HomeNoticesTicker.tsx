'use client';

import { useEffect, useMemo, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';

type Notice = {
  id: string;
  category: string;
  title: string;
};

type Props = {
  onOpenCategory?: (category: 'opportunity' | 'tender') => void;
};

/** Right-to-left scrolling titles of published opportunities & tenders. */
export default function HomeNoticesTicker({ onOpenCategory }: Props) {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/opportunity-notices', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) return;
        const list = Array.isArray(data.notices) ? data.notices : [];
        setNotices(
          list.map((n: Notice) => ({
            id: n.id,
            category: n.category,
            title: n.title,
          }))
        );
      } catch {
        /* keep empty — hide ticker */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const titles = useMemo(() => {
    if (notices.length === 0) return [];
    // Duplicate for seamless loop
    return [...notices, ...notices];
  }, [notices]);

  if (titles.length === 0) return null;

  return (
    <section
      className="mt-4 overflow-hidden rounded-xl border border-[var(--ura-yellow)]/40 bg-[#0f315f]/95"
      aria-label="Published opportunities and tenders"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--ura-yellow)]">Live</span>
        <span className="text-[11px] text-blue-100/75">Opportunities & Tenders</span>
      </div>
      <div className="relative overflow-hidden py-2.5">
        <div className="ura-ticker-track flex w-max gap-8 whitespace-nowrap will-change-transform">
          {titles.map((n, i) => (
            <button
              key={`${n.id}-${i}`}
              type="button"
              onClick={() => {
                triggerHapticFeedback(window);
                if (n.category === 'opportunity' || n.category === 'tender') {
                  onOpenCategory?.(n.category);
                }
              }}
              className="inline-flex items-center gap-2 px-1 text-left hover:opacity-90"
            >
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                  n.category === 'tender'
                    ? 'bg-[#f3ba2f]/20 text-[#f3ba2f]'
                    : 'bg-[#5fa8ff]/20 text-[#8bb4ef]'
                }`}
              >
                {n.category === 'tender' ? 'Tender' : 'Opportunity'}
              </span>
              <span className="text-sm font-semibold text-white">{n.title}</span>
              <span className="text-[var(--ura-yellow)]/70" aria-hidden>
                •
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
