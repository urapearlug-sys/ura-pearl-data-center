'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import AdminModuleShell from '@/app/admin/_components/AdminModuleShell';

type Row = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogoUrl: string | null;
  awayLogoUrl: string | null;
  kickoffAt: string;
  venue: string | null;
  competition: string | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  highlightUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminUraFcPage() {
  const showToast = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homeLogoUrl, setHomeLogoUrl] = useState('');
  const [awayLogoUrl, setAwayLogoUrl] = useState('');
  const [kickoffLocal, setKickoffLocal] = useState('');
  const [venue, setVenue] = useState('');
  const [competition, setCompetition] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [highlightUrl, setHighlightUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setHomeTeam('');
    setAwayTeam('');
    setHomeLogoUrl('');
    setAwayLogoUrl('');
    setKickoffLocal('');
    setVenue('');
    setCompetition('');
    setStatus('upcoming');
    setHomeScore('');
    setAwayScore('');
    setHighlightUrl('');
    setSortOrder('0');
    setIsPublished(true);
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ura-fc/matches', { credentials: 'include' });
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
    setHomeTeam(r.homeTeam);
    setAwayTeam(r.awayTeam);
    setHomeLogoUrl(r.homeLogoUrl ?? '');
    setAwayLogoUrl(r.awayLogoUrl ?? '');
    setKickoffLocal(toDatetimeLocalValue(r.kickoffAt));
    setVenue(r.venue ?? '');
    setCompetition(r.competition ?? '');
    setStatus(
      r.status === 'completed' || r.status === 'cancelled' || r.status === 'upcoming' ? r.status : 'upcoming'
    );
    setHomeScore(r.homeScore != null ? String(r.homeScore) : '');
    setAwayScore(r.awayScore != null ? String(r.awayScore) : '');
    setHighlightUrl(r.highlightUrl ?? '');
    setSortOrder(String(r.sortOrder ?? 0));
    setIsPublished(r.isPublished);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim()) {
      showToast('Home and away team names are required', 'error');
      return;
    }
    if (!kickoffLocal.trim()) {
      showToast('Kick-off date/time is required', 'error');
      return;
    }
    const so = parseInt(sortOrder, 10);
    const hs = homeScore.trim() === '' ? null : parseInt(homeScore, 10);
    const as = awayScore.trim() === '' ? null : parseInt(awayScore, 10);

    const basePayload: Record<string, unknown> = {
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      homeLogoUrl: homeLogoUrl.trim() || null,
      awayLogoUrl: awayLogoUrl.trim() || null,
      kickoffAt: new Date(kickoffLocal).toISOString(),
      venue: venue.trim() || null,
      competition: competition.trim() || null,
      status,
      highlightUrl: highlightUrl.trim() || null,
      sortOrder: Number.isFinite(so) ? so : 0,
      isPublished,
    };

    if (hs !== null && Number.isFinite(hs)) basePayload.homeScore = hs;
    else basePayload.homeScore = null;
    if (as !== null && Number.isFinite(as)) basePayload.awayScore = as;
    else basePayload.awayScore = null;

    setSubmitting(true);
    try {
      const url = editingId ? `/api/admin/ura-fc/matches/${editingId}` : '/api/admin/ura-fc/matches';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(basePayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      showToast(editingId ? 'Match updated' : 'Match created', 'success');
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
      const res = await fetch(`/api/admin/ura-fc/matches/${id}`, {
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
    const upcoming = rows.filter((r) => r.status === 'upcoming').length;
    const completed = rows.filter((r) => r.status === 'completed').length;
    return [
      { label: 'Fixtures', value: rows.length },
      { label: 'Published', value: published, hint: 'Learn → URA FC' },
      { label: 'Upcoming', value: upcoming },
      { label: 'Completed', value: completed },
    ];
  }, [rows]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fixture?')) return;
    try {
      const res = await fetch(`/api/admin/ura-fc/matches/${id}`, { method: 'DELETE', credentials: 'include' });
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
      title="URA FC fixtures"
      description="Curate matches under Learn → URA FC. Full club news and tables stay on urafc.co.ug."
      kpis={kpis}
    >
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.08] bg-[#141c2c] p-5 space-y-3 mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <h2 className="text-lg font-semibold">{editingId ? 'Edit match' : 'New match'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              placeholder="Home team"
              className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
            />
            <input
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              placeholder="Away team"
              className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={homeLogoUrl}
              onChange={(e) => setHomeLogoUrl(e.target.value)}
              placeholder="Home logo URL (optional)"
              className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
            />
            <input
              value={awayLogoUrl}
              onChange={(e) => setAwayLogoUrl(e.target.value)}
              placeholder="Away logo URL (optional)"
              className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
            />
          </div>
          <label className="block text-xs text-gray-400">
            Kick-off
            <input
              type="datetime-local"
              value={kickoffLocal}
              onChange={(e) => setKickoffLocal(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Venue (optional)"
              className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
            />
            <input
              value={competition}
              onChange={(e) => setCompetition(e.target.value)}
              placeholder="Competition (e.g. Uganda Premier League)"
              className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
            />
          </div>
          <label className="block text-xs text-gray-400">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="mt-1 w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
            >
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            <input
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="Home score"
              type="number"
              className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
            />
            <input
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="Away score"
              type="number"
              className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
            />
          </div>
          <input
            value={highlightUrl}
            onChange={(e) => setHighlightUrl(e.target.value)}
            placeholder="Highlight / report URL (optional)"
            className="w-full rounded-lg border border-white/[0.1] bg-[#0f1522] px-3 py-2 text-sm"
          />
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
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create match'}
            </button>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-500 px-4 py-2 text-sm">
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <h2 className="text-lg font-semibold mb-3 text-white">All fixtures</h2>
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
                    <p className="font-bold text-white">
                      {r.homeTeam} vs {r.awayTeam}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {r.status} · {r.isPublished ? 'Published' : 'Draft'} · {new Date(r.kickoffAt).toLocaleString()}
                    </p>
                    {r.homeScore != null && r.awayScore != null ? (
                      <p className="text-sm text-emerald-200 mt-1">
                        Score: {r.homeScore} – {r.awayScore}
                      </p>
                    ) : null}
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
                {r.competition ? <p className="text-xs text-slate-400">{r.competition}</p> : null}
                {r.venue ? <p className="text-xs text-slate-400">{r.venue}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminModuleShell>
  );
}
