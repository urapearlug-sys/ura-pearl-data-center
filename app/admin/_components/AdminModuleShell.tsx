'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

export type AdminKpi = {
  label: string;
  value: string | number;
  hint?: string;
};

type AdminModuleShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  kpis?: AdminKpi[];
  headerRight?: ReactNode;
  /** Wider main column for dense tables (e.g. user accounts). */
  wide?: boolean;
  children: ReactNode;
};

/**
 * Shared chrome for inner admin modules: dark surface, KPI strip, card-ready content area.
 */
export default function AdminModuleShell({
  eyebrow = 'Administration',
  title,
  description,
  backHref = '/admin',
  backLabel = '← Dashboard',
  kpis,
  headerRight,
  wide = false,
  children,
}: AdminModuleShellProps) {
  const max = wide ? 'max-w-7xl' : 'max-w-6xl';
  return (
    <div className="min-h-screen bg-[#0c1018] text-white">
      <div className="border-b border-white/[0.06] bg-gradient-to-b from-[#121a28] to-[#0c1018]">
        <div className={`${max} mx-auto px-6 py-8`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <Link href={backHref} className="text-sm font-semibold text-[#f3ba2f] hover:underline">
                {backLabel}
              </Link>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mt-3">{eyebrow}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">{title}</h1>
              {description ? <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">{description}</p> : null}
            </div>
            {headerRight ? <div className="shrink-0 flex flex-wrap gap-2">{headerRight}</div> : null}
          </div>

          {kpis && kpis.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {kpis.map((k) => (
                <div
                  key={k.label}
                  className="rounded-2xl border border-white/[0.08] bg-[#141c2c] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{k.label}</p>
                  <p className="text-xl font-bold text-white tabular-nums mt-1">{k.value}</p>
                  {k.hint ? <p className="text-xs text-slate-500 mt-1">{k.hint}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className={`${max} mx-auto px-6 py-8`}>{children}</div>
    </div>
  );
}
