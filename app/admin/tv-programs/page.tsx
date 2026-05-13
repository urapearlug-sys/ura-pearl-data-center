'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import AdminModuleShell from '@/app/admin/_components/AdminModuleShell';
import {
  AdminDonutChart,
  AdminHorizontalBars,
  AdminLoadStars,
  AdminSectionLabel,
  type BarDatum,
} from '@/app/admin/_components/charts/AdminChartPrimitives';

type Row = {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  scheduledAt: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminTvProgramsPage() {
  const showToast = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [scheduledAtLocal, setScheduledAtLocal] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setYoutubeUrl('');
    setScheduledAtLocal('');
    setSortOrder('0');
    setIsPublished(true);
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tv-programs', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
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

  const startEdit = (r: Row) => {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description ?? '');
    setYoutubeUrl(r.youtubeUrl);
    setScheduledAtLocal(toDatetimeLocalValue(r.scheduledAt));
    setSortOrder(String(r.sortOrder ?? 0));
    setIsPublished(r.isPublished);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim()) {
      showToast('Title and YouTube URL are required', 'error');
      return;
    }
    const so = parseInt(sortOrder, 10);
    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || null,
      youtubeUrl: youtubeUrl.trim(),
      scheduledAt: scheduledAtLocal.trim() ? new Date(scheduledAtLocal).toISOString() : null,
      sortOrder: Number.isFinite(so) ? so : 0,
      isPublished,
    };

    setSubmitting(true);
    try {
      const url = editingId ? `/api/admin/tv-programs/${editingId}` : '/api/admin/tv-programs';
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      showToast(editingId ? 'Program updated' : 'Program created', 'success');
      resetForm();
      void load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublished = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/tv-programs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPublished: !current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      showToast(!current ? 'Published' : 'Unpublished', 'success');
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  const kpis = useMemo(() => {
    const published = rows.filter((r) => r.isPublished).length;
    const scheduled = rows.filter((r) => r.scheduledAt).length;
    return [
      { label: 'Programs', value: rows.length },
      { label: 'Published', value: published, hint: 'Visible in Learn → URA TV' },
      { label: 'Drafts', value: rows.length - published },
      { label: 'Scheduled', value: scheduled, hint: 'Has date for ordering' },
    ];
  }, [rows]);

  const tvPublishBars = useMemo((): BarDatum[] => {
    const published = rows.filter((r) => r.isPublished).length;
    return [
      { label: 'Published', value: published, color: '#34d399' },
      { label: 'Drafts', value: rows.length - published, color: '#fbbf24' },
    ];
  }, [rows]);

  const tvScheduleBars = useMemo((): BarDatum[] => {
    const withDate = rows.filter((r) => r.scheduledAt).length;
    const without = rows.length - withDate;
    return [
      { label: 'Scheduled', value: withDate, color: '#38bdf8' },
      { label: 'No schedule', value: without, color: '#64748b' },
    ];
  }, [rows]);

  const tvDonutSlices = useMemo(
    () => [
      { label: 'Published', value: rows.filter((r) => r.isPublished).length, color: '#34d399' },
      { label: 'Drafts', value: rows.filter((r) => !r.isPublished).length, color: '#fbbf24' },
    ],
    [rows],
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this TV program and its comments?')) return;
    try {
      const res = await fetch(`/api/admin/tv-programs/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Failed');
      showToast('Deleted', 'success');
      if (editingId === id) resetForm();
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  return (
    <AdminModuleShell
      title="URA TV programs"
      description="YouTube episodes and previews under Learn → URA TV. Optional schedule controls upcoming vs past ordering in the app."
      kpis={kpis}
    >
      <div className="max-w-3xl">
        {!loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl border border-white/[0.08] bg-[#141c2c] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:col-span-1">
              <AdminSectionLabel>Chart · Publish mix</AdminSectionLabel>
              <AdminDonutChart slices={tvDonutSlices} size={120} />
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-[#141c2c] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:col-span-2">
              <AdminSectionLabel>Graph · Catalog shape</AdminSectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-600 mb-2">Visibility</p>
                  <AdminHorizontalBars items={tvPublishBars} emptyLabel="No programs." />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-600 mb-2">Schedule coverage</p>
                  <AdminHorizontalBars items={tvScheduleBars} emptyLabel="No programs." />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <AdminLoadStars
                  score={rows.filter((r) => !r.isPublished).length}
                  maxForFive={12}
                  caption="Draft load (for prioritizing publish work)"
                />
              </div>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.08] bg-[#141c2c] p-5 space-y-3 mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <h2 className="text-lg font-semibold">{editingId ? 'Edit program' : 'New program'}</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
          />
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="YouTube URL (watch, shorts, or youtu.be)"
            className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
          />
          <label className="block text-xs text-gray-400">
            Scheduled (optional — helps upcoming vs past sorting)
            <input
              type="datetime-local"
              value={scheduledAtLocal}
              onChange={(e) => setScheduledAtLocal(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
            />
          </label>
          <input
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="Sort order (lower first)"
            type="number"
            className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            Published (visible in app)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-ura-gold text-black px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create program'}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-500 px-4 py-2 text-sm"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <h2 className="text-lg font-semibold mb-3 text-white">All programs</h2>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-white/[0.08] bg-[#141c2c] p-4 flex flex-col gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-white">{r.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {r.isPublished ? 'Published' : 'Draft'} · sort {r.sortOrder}
                      {r.scheduledAt ? ` · ${new Date(r.scheduledAt).toLocaleString()}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      className="text-xs px-2 py-1 rounded border border-cyan-500/60 text-cyan-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublished(r.id, r.isPublished)}
                      className="text-xs px-2 py-1 rounded border border-[#f3ba2f] text-[#f3ba2f]"
                    >
                      {r.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="text-xs px-2 py-1 rounded border border-red-500/60 text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {r.description ? <p className="text-sm text-slate-300 whitespace-pre-wrap">{r.description}</p> : null}
                <p className="text-xs text-cyan-300 break-all">{r.youtubeUrl}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminModuleShell>
  );
}
