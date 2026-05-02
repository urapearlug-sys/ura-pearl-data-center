'use client';

import { useEffect, useState } from 'react';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';

export type PublishedActivityItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  linkLabel: string | null;
  createdAt: string;
  /** Admin announcements vs earn tasks (tasks also appear under Activities for visibility) */
  kind?: 'post' | 'task';
  points?: number;
  category?: string;
};

type Props = {
  /** @deprecated No longer sent; API is public read. Prop kept for call-site compatibility */
  initData?: string;
};

export default function PublishedActivitiesFeed(_props: Props) {
  const [items, setItems] = useState<PublishedActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/published-activities', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'Failed to load');
        if (!cancelled) setItems(Array.isArray(data?.activities) ? data.activities : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-8 border-t border-[#2d2f38] pt-6" aria-label="Published activities">
      <h2 className="text-lg font-bold text-white tracking-tight mb-1">Activities</h2>
      <p className="text-[11px] text-gray-500 mb-4">New updates appear at the top.</p>

      {loading ? (
        <p className="text-sm text-gray-500 py-4 text-center">Loading activities…</p>
      ) : error ? (
        <p className="text-sm text-rose-400/90 py-2">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500 py-3 rounded-xl border border-dashed border-[#2d2f38] px-3 text-center">
          No updates yet. Admins can add announcements under Published activities or earn tasks under Manage
          tasks.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-[#2d2f38] bg-[#141821] p-3 text-left shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 gap-y-1">
                <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                {item.kind === 'task' ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-200/90 bg-amber-500/15 border border-amber-500/35 rounded px-1.5 py-0.5">
                    Task
                  </span>
                ) : null}
              </div>
              {item.kind === 'task' && typeof item.points === 'number' ? (
                <p className="text-[11px] text-[#f3ba2f] font-semibold mt-1">+{formatNumber(item.points)} pearls</p>
              ) : null}
              <p className="text-xs text-gray-300 mt-2 whitespace-pre-wrap leading-relaxed">{item.body}</p>
              <p className="text-[10px] text-gray-500 mt-2 tabular-nums">
                {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHapticFeedback(window)}
                  className="mt-3 inline-flex items-center justify-center rounded-lg border border-cyan-500/50 bg-cyan-950/30 px-3 py-2 text-xs font-semibold text-cyan-200 hover:border-cyan-400"
                >
                  {item.linkLabel || 'Open link'}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
