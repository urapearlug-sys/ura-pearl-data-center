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
  /** Overlay on banner image without taking layout space */
  floating?: boolean;
};

/** Right-to-left scrolling titles of published opportunities & tenders. */
export default function HomeNoticesTicker({ onOpenCategory, floating = false }: Props) {
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
    return [...notices, ...notices];
  }, [notices]);

  if (titles.length === 0) return null;

  return (
    <section
      className={
        floating
          ? 'pointer-events-auto absolute inset-x-0 top-0 z-10 overflow-hidden rounded-t-2xl bg-[#0f315f]/92 border-b border-[var(--ura-yellow)]/45 shadow-[0_4px_14px_rgba(0,0,0,0.25)] backdrop-blur-[2px]'
          : 'mt-4 overflow-hidden rounded-xl border border-[var(--ura-yellow)]/40 bg-[#0f315f]/95'
      }
      aria-label="Published opportunities and tenders"
    >
      <div className="relative overflow-hidden py-2 pl-2 pr-2">
        <div className="ura-ticker-track flex w-max items-center gap-6 whitespace-nowrap will-change-transform">
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
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                  n.category === 'tender'
                    ? 'bg-[#f3ba2f] text-[#0a1628]'
                    : 'bg-[#5fa8ff] text-[#0a1628]'
                }`}
              >
                {n.category === 'tender' ? 'Tender' : 'Opportunity'}
              </span>
              <span className="text-[12px] sm:text-sm font-semibold text-white drop-shadow-sm">
                {n.title}
              </span>
              <span className="text-[var(--ura-yellow)]" aria-hidden>
                •
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
