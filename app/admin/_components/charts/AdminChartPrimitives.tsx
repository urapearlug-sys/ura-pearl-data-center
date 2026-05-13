'use client';

import type { ReactNode } from 'react';

/**
 * Lightweight admin visualizations (no chart library): bars, donut, load stars.
 */

export type BarDatum = { label: string; value: number; color: string };

export function AdminSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">{children}</p>
  );
}

/** Normalized horizontal bars — good for comparing magnitudes on one scale. */
export function AdminHorizontalBars({ items, emptyLabel = 'No data' }: { items: BarDatum[]; emptyLabel?: string }) {
  const max = Math.max(0, ...items.map((i) => i.value));
  if (max === 0 && items.every((i) => i.value === 0)) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }
  const denom = max > 0 ? max : 1;
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between gap-2 text-xs mb-1">
            <span className="text-slate-400 truncate">{item.label}</span>
            <span className="text-slate-200 tabular-nums shrink-0 font-medium">{item.value.toLocaleString()}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden ring-1 ring-white/[0.04]">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${Math.min(100, (item.value / denom) * 100)}%`,
                backgroundColor: item.color,
                boxShadow: item.value > 0 ? `0 0 12px ${item.color}55` : undefined,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Five-point load indicator (e.g. queue pressure). */
export function AdminLoadStars({
  score,
  maxForFive = 24,
  caption,
}: {
  score: number;
  /** Score at or above this maps to 5 filled stars. */
  maxForFive?: number;
  caption?: string;
}) {
  const level = Math.max(0, Math.min(5, Math.round((Math.max(0, score) / Math.max(1, maxForFive)) * 5)));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1" role="img" aria-label={`Load ${level} of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`text-lg leading-none select-none ${i < level ? 'text-[#f3ba2f] drop-shadow-[0_0_6px_rgba(243,186,47,0.35)]' : 'text-slate-700'}`}
            aria-hidden
          >
            ★
          </span>
        ))}
      </div>
      {caption ? <p className="text-[11px] text-slate-500 leading-snug">{caption}</p> : null}
    </div>
  );
}

type DonutSlice = { label: string; value: number; color: string };

/** CSS conic-gradient donut — values should be non-negative. */
export function AdminDonutChart({
  slices,
  size = 140,
  hole = 0.62,
}: {
  slices: DonutSlice[];
  size?: number;
  hole?: number;
}) {
  const sum = slices.reduce((a, s) => a + Math.max(0, s.value), 0);
  if (sum <= 0) {
    return (
      <div
        className="rounded-full border border-dashed border-white/15 flex items-center justify-center text-xs text-slate-500 mx-auto"
        style={{ width: size, height: size }}
      >
        No split
      </div>
    );
  }
  let acc = 0;
  const parts: string[] = [];
  for (const s of slices) {
    const v = Math.max(0, s.value);
    if (v <= 0) continue;
    const start = (acc / sum) * 360;
    const span = (v / sum) * 360;
    parts.push(`${s.color} ${start}deg ${start + span}deg`);
    acc += v;
  }
  const gradient = `conic-gradient(${parts.join(', ')})`;
  const innerPct = hole * 50;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div
        className="shrink-0 rounded-full border border-white/[0.08] shadow-[inset_0_0_20px_rgba(0,0,0,0.35)]"
        style={{
          width: size,
          height: size,
          background: gradient,
          mask: `radial-gradient(farthest-side, transparent calc(${innerPct}% - 1px), #000 ${innerPct}%)`,
          WebkitMask: `radial-gradient(farthest-side, transparent calc(${innerPct}% - 1px), #000 ${innerPct}%)`,
        }}
      />
      <ul className="text-xs space-y-1.5 min-w-[8rem]">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-400 truncate">
              <span className="h-2 w-2 rounded-full shrink-0 ring-1 ring-white/20" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
            <span className="text-slate-200 tabular-nums font-medium">{s.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
