'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import AdminModuleShell from '@/app/admin/_components/AdminModuleShell';

type Row = {
  id: string;
  category: string;
  title: string;
  body: string | null;
  link: string | null;
  linkLabel: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
};

export default function AdminOpportunityNoticesPage() {
  const showToast = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'opportunity' | 'tender'>('opportunity');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [linkLabel, setLinkLabel] = useState('Open details');
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/opportunity-notices', { credentials: 'include' });
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

  const publishedCount = useMemo(() => rows.filter((r) => r.isPublished).length, [rows]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/opportunity-notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          category,
          title: title.trim(),
          body: body.trim() || null,
          link: link.trim() || null,
          linkLabel: linkLabel.trim() || null,
          isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      showToast('Notice created — published titles scroll on Home', 'success');
      setTitle('');
      setBody('');
      setLink('');
      setLinkLabel('Open details');
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
      const res = await fetch(`/api/admin/opportunity-notices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPublished: !current }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    try {
      const res = await fetch(`/api/admin/opportunity-notices/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
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
      title="Opportunities & Tenders"
      description="Publish notices for Learn → Opportunities / Tenders. Published titles also animate right-to-left on the Home screen."
    >
      <p className="text-sm text-slate-400 mb-4">
        {loading ? 'Loading…' : `${rows.length} notices · ${publishedCount} published`}
      </p>

      <form
        onSubmit={handleCreate}
        className="mb-8 rounded-xl border border-ura-border/75 bg-ura-panel p-4 space-y-3"
      >
        <h2 className="text-white font-bold">New notice</h2>
        <div className="flex gap-2">
          {(
            [
              { id: 'opportunity' as const, label: 'Opportunity' },
              { id: 'tender' as const, label: 'Tender' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCategory(opt.id)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                category === opt.id
                  ? 'bg-ura-gold text-black'
                  : 'border border-ura-border/75 text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (shown on Home ticker when published)"
          className="w-full rounded-lg bg-ura-page border border-ura-border/75 px-3 py-2 text-white text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Optional details"
          rows={3}
          className="w-full rounded-lg bg-ura-page border border-ura-border/75 px-3 py-2 text-white text-sm resize-none"
        />
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Optional link URL"
          className="w-full rounded-lg bg-ura-page border border-ura-border/75 px-3 py-2 text-white text-sm"
        />
        <input
          value={linkLabel}
          onChange={(e) => setLinkLabel(e.target.value)}
          placeholder="Link button label"
          className="w-full rounded-lg bg-ura-page border border-ura-border/75 px-3 py-2 text-white text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Publish now (appears in app + Home ticker)
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-ura-gold text-black font-bold px-4 py-2.5 text-sm disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Create notice'}
        </button>
      </form>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border border-ura-border/75 bg-ura-panel p-4 flex flex-col sm:flex-row sm:items-start gap-3 justify-between"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-ura-gold">
                {row.category}
                {row.isPublished ? ' · published' : ' · draft'}
              </p>
              <p className="text-white font-semibold mt-1">{row.title}</p>
              {row.body ? <p className="text-sm text-slate-400 mt-1 line-clamp-2">{row.body}</p> : null}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void togglePublished(row.id, row.isPublished)}
                className="rounded-lg border border-ura-border/75 px-3 py-1.5 text-xs font-semibold text-slate-200"
              >
                {row.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => void remove(row.id)}
                className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No notices yet.</p>
        ) : null}
      </div>
    </AdminModuleShell>
  );
}
