'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import AdminModuleShell from '@/app/admin/_components/AdminModuleShell';

type Row = {
  id: string;
  fullName: string;
  tin: string | null;
  phone: string;
  idType: string;
  idNumber: string;
  licenceType: string;
  years: number;
  amountUgx: number;
  status: string;
  telegramId: string | null;
  createdAt: string;
};

const STATUSES = ['submitted', 'reviewed', 'approved', 'rejected'] as const;

export default function AdminDriverLicencePage() {
  const showToast = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/driver-licence-applications', { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : res.status === 403
              ? 'Unauthorized — log in at /admin/login first'
              : 'Failed to load'
        );
      }
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/driver-licence-applications/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Update failed');
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      showToast(`Marked ${status}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminModuleShell
      title="Driver licence applications"
      description="Simulated Quick Access → Pay driver's licence submissions. Review and update status."
    >
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="rounded-lg border border-ura-border/75 px-3 py-1.5 text-sm font-semibold text-slate-200"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-400 text-sm">No applications yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-ura-border/60 bg-ura-card/80 p-4 space-y-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-white font-bold">{r.fullName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {r.licenceType} · UGX {r.amountUgx.toLocaleString('en-UG')} · {r.years} yr
                  </p>
                </div>
                <span className="rounded-md bg-ura-gold/20 px-2 py-0.5 text-[11px] font-bold uppercase text-ura-gold">
                  {r.status}
                </span>
              </div>
              <p className="text-sm text-slate-300">
                {r.idType}: {r.idNumber} · Phone {r.phone}
                {r.tin ? ` · TIN ${r.tin}` : ''}
              </p>
              <p className="text-[11px] text-slate-500">
                {new Date(r.createdAt).toLocaleString()}
                {r.telegramId ? ` · TG ${r.telegramId}` : ''}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={updatingId === r.id || r.status === s}
                    onClick={() => void setStatus(r.id, s)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize disabled:opacity-40 ${
                      r.status === s
                        ? 'bg-ura-gold text-black'
                        : 'border border-ura-border/70 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminModuleShell>
  );
}
