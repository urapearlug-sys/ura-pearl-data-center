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
    return [...notices, ...notices];
  }, [notices]);

  if (titles.length === 0) return null;

  return (
    <section
      className="overflow-hidden rounded-xl bg-[#123f78] border border-[#5fa8ff]/50 border-b-2 border-b-[#f3ba2f]"
      aria-label="Published opportunities and tenders"
    >
      <div className="relative overflow-hidden py-2.5 px-2">
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
              className="inline-flex items-center gap-2 px-1 text-left hover:opacity-95"
            >
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                  n.category === 'tender'
                    ? 'bg-[#f3ba2f] text-[#123f78]'
                    : 'bg-[#5fa8ff] text-[#0a1628]'
                }`}
              >
                {n.category === 'tender' ? 'Tender' : 'Opportunity'}
              </span>
              <span className="text-[13px] sm:text-sm font-bold text-white">
                {n.title}
              </span>
              <span className="text-[#f3ba2f] text-base font-bold" aria-hidden>
                •
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
