'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';

type Notice = {
  id: string;
  category: string;
  title: string;
};

type Props = {
  onOpenCategory?: (category: 'opportunity' | 'tender') => void;
  /** Optional user-scoped key so read state is per citizen */
  storageKey?: string;
};

const DEFAULT_READ_KEY = 'ura:home:notices-read';

function loadReadIds(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = JSON.parse(window.localStorage.getItem(key) ?? '[]') as unknown;
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(key: string, ids: Set<string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify([...ids]));
}

/** Right-to-left scrolling titles — disappears once the user has read them. */
export default function HomeNoticesTicker({
  onOpenCategory,
  storageKey = DEFAULT_READ_KEY,
}: Props) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setReadIds(loadReadIds(storageKey));
  }, [storageKey]);

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
        /* keep empty */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const unread = useMemo(
    () => notices.filter((n) => !readIds.has(n.id)),
    [notices, readIds]
  );

  const markRead = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      setReadIds((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.add(id);
        saveReadIds(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  const titles = useMemo(() => {
    if (unread.length === 0) return [];
    // Duplicate only when enough items for a smooth loop
    return unread.length === 1 ? unread : [...unread, ...unread];
  }, [unread]);

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
                // After reading, clear the ticker (all current items marked read)
                markRead(unread.map((x) => x.id));
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
              <span className="text-[13px] sm:text-sm font-bold text-white">{n.title}</span>
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
