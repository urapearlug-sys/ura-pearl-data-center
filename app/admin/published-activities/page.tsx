// Admin: published activity posts for the Earn tab “Activities” section (newest on top in the app)

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  body: string;
  link: string | null;
  linkLabel: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminPublishedActivitiesPage() {
  const showToast = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [linkLabel, setLinkLabel] = useState('Learn more');
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/published-activities', { credentials: 'include' });
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      showToast('Title and body are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/published-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          link: link.trim() || null,
          linkLabel: linkLabel.trim() || null,
          isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      showToast('Activity created', 'success');
      setTitle('');
      setBody('');
      setLink('');
      setLinkLabel('Learn more');
      setIsPublished(true);
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublished = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/published-activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPublished: !current }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      showToast(!current ? 'Published (visible in app)' : 'Unpublished', 'success');
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  const kpis = useMemo(() => {
    const published = rows.filter((r) => r.isPublished).length;
    const drafts = rows.length - published;
    return [
      { label: 'Total posts', value: rows.length },
      { label: 'Published', value: published, hint: 'Visible in app' },
      { label: 'Drafts', value: drafts },
      { label: 'Newest', value: rows[0] ? new Date(rows[0].createdAt).toLocaleDateString() : '—' },
    ];
  }, [rows]);

  const publishMixBars = useMemo((): BarDatum[] => {
    const published = rows.filter((r) => r.isPublished).length;
    const drafts = rows.length - published;
    return [
      { label: 'Published', value: published, color: '#34d399' },
      { label: 'Drafts', value: drafts, color: '#fbbf24' },
    ];
  }, [rows]);

  const publishDonutSlices = useMemo(
    () => [
      { label: 'Published', value: rows.filter((r) => r.isPublished).length, color: '#34d399' },
      { label: 'Drafts', value: rows.filter((r) => !r.isPublished).length, color: '#fbbf24' },
    ],
    [rows],
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this activity post?')) return;
    try {
      const res = await fetch(`/api/admin/published-activities/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      showToast('Deleted', 'success');
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  return (
    <AdminModuleShell
      title="Published activities"
      description="Posts under Activities on the Earn tab. Newest published items appear first. Drafts stay hidden until you publish a row."
      kpis={kpis}
    >
      <div className="max-w-3xl">
        {rows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl border border-white/[0.08] bg-[#141c2c] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <AdminSectionLabel>Chart · Visibility mix</AdminSectionLabel>
              <AdminDonutChart slices={publishDonutSlices} size={132} />
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-[#141c2c] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <AdminSectionLabel>Graph · Draft backlog</AdminSectionLabel>
              <div className="mb-3">
                <AdminLoadStars
                  score={rows.filter((r) => !r.isPublished).length}
                  maxForFive={15}
                  caption="Stars scale with draft count"
                />
              </div>
              <AdminHorizontalBars items={publishMixBars} emptyLabel="No rows yet." />
            </div>
          </div>
        ) : null}

        <form onSubmit={handleCreate} className="rounded-2xl border border-white/[0.08] bg-[#141c2c] p-5 space-y-3 mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <h2 className="text-lg font-semibold">New activity</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Body (plain text)"
            rows={4}
            className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
          />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Optional link URL"
            className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
          />
          <input
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            placeholder="Link button label"
            className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            Publish immediately (visible in app)
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-ura-gold text-black px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Create activity'}
          </button>
        </form>

        <h2 className="text-lg font-semibold mb-3 text-white">All posts (newest first)</h2>
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
                      {new Date(r.createdAt).toLocaleString()} · {r.isPublished ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{r.body}</p>
                {r.link ? (
                  <p className="text-xs text-cyan-300">
                    Link: {r.link} {r.linkLabel ? `(${r.linkLabel})` : ''}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminModuleShell>
  );
}
