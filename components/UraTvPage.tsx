'use client';

import { useCallback, useEffect, useState } from 'react';
import UraStadiumPageHero from '@/components/UraStadiumPageHero';
import { navLearn } from '@/images';
import { useGameStore } from '@/utils/game-mechanics';
import { triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';

export type TvProgramPublic = {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  embedUrl: string | null;
  scheduledAt: string | null;
};

type CommentRow = {
  id: string;
  authorName: string | null;
  body: string;
  createdAt: string;
};

interface UraTvPageProps {
  setCurrentView: (view: string) => void;
}

function formatWhen(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function UraTvPage({ setCurrentView }: UraTvPageProps) {
  const showToast = useToast();
  const userTelegramInitData = useGameStore((s) => s.userTelegramInitData);
  const [upcoming, setUpcoming] = useState<TvProgramPublic[]>([]);
  const [past, setPast] = useState<TvProgramPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProgram, setActiveProgram] = useState<TvProgramPublic | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tv-programs');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Failed to load');
      setUpcoming(Array.isArray(data.upcoming) ? data.upcoming : []);
      setPast(Array.isArray(data.past) ? data.past : []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not load URA TV', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  const loadComments = useCallback(
    async (programId: string) => {
      setCommentsLoading(true);
      try {
        const res = await fetch(`/api/tv-programs/${programId}/comments`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Failed');
        setComments(Array.isArray(data.comments) ? data.comments : []);
      } catch {
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!activeProgram) {
      setComments([]);
      setDraft('');
      return;
    }
    void loadComments(activeProgram.id);
  }, [activeProgram, loadComments]);

  const submitSuggestion = async () => {
    if (!activeProgram) return;
    const text = draft.trim();
    if (!text) {
      showToast('Write your comment or suggestion first.', 'error');
      return;
    }
    if (!userTelegramInitData) {
      showToast('Open URAPearls from Telegram to send feedback.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tv-programs/${activeProgram.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: userTelegramInitData, body: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Send failed');
      if (data.comment) {
        setComments((prev) => [data.comment as CommentRow, ...prev]);
      }
      setDraft('');
      showToast('Thanks — your feedback was posted.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not send', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  function ProgramCard({
    program,
    variant,
  }: {
    program: TvProgramPublic;
    variant: 'upcoming' | 'past';
  }) {
    return (
    <button
      type="button"
      onClick={() => {
        triggerHapticFeedback(window);
        setActiveProgram(program);
      }}
      className={`w-full rounded-2xl border text-left transition-colors px-4 py-3 ${
        variant === 'upcoming'
          ? 'border-[#f3ba2f]/45 bg-[#1a2744]/95 hover:border-[#f3ba2f]'
          : 'border-[#8bb4ef]/35 bg-[#0f315f]/90 hover:border-[#8bb4ef]/70'
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#f3ba2f]/90">
        {variant === 'upcoming' ? 'Upcoming' : 'Previous'}
      </p>
      <p className="text-white font-bold mt-1 leading-snug">{program.title}</p>
      {program.scheduledAt ? (
        <p className="text-blue-100/75 text-xs mt-1">{formatWhen(program.scheduledAt)}</p>
      ) : null}
      {program.description ? (
        <p className="text-blue-100/65 text-xs mt-2 line-clamp-2">{program.description}</p>
      ) : null}
      <p className="text-[#f3ba2f] text-xs mt-2 font-semibold">Tap to watch · comments</p>
    </button>
    );
  }

  return (
    <div className="bg-[#0a1628] min-h-screen pb-28">
      <UraStadiumPageHero
        title="URA TV"
        description="Official video programs — upcoming listings and replays on YouTube. Tap an episode to watch or comment."
        icon={navLearn}
      />

      <div className="w-full max-w-xl mx-auto px-4 pt-4 space-y-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              setCurrentView('eearn');
            }}
            className="rounded-xl border border-[#8bb4ef]/35 px-4 py-2 text-sm font-semibold text-blue-100 hover:bg-white/5"
          >
            ← Learn
          </button>
          <button
            type="button"
            onClick={() => void loadPrograms()}
            className="rounded-xl border border-[#f3ba2f]/45 px-4 py-2 text-sm font-semibold text-[#f3ba2f] hover:bg-[#f3ba2f]/10"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-center text-blue-100/70 py-12">Loading programs…</p>
        ) : (
          <>
            <section aria-labelledby="ura-tv-upcoming-heading">
              <h2 id="ura-tv-upcoming-heading" className="text-lg font-bold text-white mb-3 tracking-tight">
                Upcoming programs
              </h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-blue-100/60 rounded-xl border border-dashed border-[#8bb4ef]/35 px-4 py-6 text-center">
                  No upcoming slots published yet. Check back soon.
                </p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((p) => (
                    <ProgramCard key={p.id} program={p} variant="upcoming" />
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="ura-tv-past-heading">
              <h2 id="ura-tv-past-heading" className="text-lg font-bold text-white mb-3 tracking-tight">
                Previous programs & library
              </h2>
              {past.length === 0 ? (
                <p className="text-sm text-blue-100/60 rounded-xl border border-dashed border-[#8bb4ef]/35 px-4 py-6 text-center">
                  Episodes will appear here once published with a YouTube link.
                </p>
              ) : (
                <div className="space-y-2">
                  {past.map((p) => (
                    <ProgramCard key={p.id} program={p} variant="past" />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {activeProgram ? (
        <div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-3 bg-black/65 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ura-tv-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveProgram(null);
          }}
        >
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-[#8bb4ef]/35 bg-[#0f1f38] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex justify-between items-start gap-2 px-4 py-3 border-b border-[#8bb4ef]/25 bg-[#0f1f38]/95 backdrop-blur-sm z-10">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#f3ba2f]/90">URA TV</p>
                <h3 id="ura-tv-modal-title" className="text-white font-bold text-lg leading-snug mt-0.5">
                  {activeProgram.title}
                </h3>
                {activeProgram.scheduledAt ? (
                  <p className="text-xs text-blue-100/70 mt-1">{formatWhen(activeProgram.scheduledAt)}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setActiveProgram(null)}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-100 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="px-4 py-4 space-y-4">
              {activeProgram.description ? (
                <p className="text-sm text-blue-100/85 leading-relaxed">{activeProgram.description}</p>
              ) : null}

              {activeProgram.embedUrl ? (
                <div className="rounded-xl overflow-hidden border border-[#8bb4ef]/35 bg-black aspect-video">
                  <iframe
                    src={activeProgram.embedUrl}
                    title={activeProgram.title}
                    className="w-full h-full min-h-[200px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="text-sm text-amber-200/90 rounded-lg border border-amber-500/35 px-3 py-2">
                  Video URL needs to be a valid YouTube link (admin).
                </p>
              )}

              <div className="rounded-xl border border-[#8bb4ef]/25 bg-[#0a1628]/90 p-3">
                <h4 className="text-sm font-bold text-white mb-2">Comments & suggestions</h4>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    userTelegramInitData
                      ? 'Share feedback or programme ideas…'
                      : 'Open from Telegram to comment.'
                  }
                  disabled={!userTelegramInitData || submitting}
                  rows={3}
                  className="w-full rounded-lg bg-[#131f33] border border-[#8bb4ef]/35 text-white text-sm px-3 py-2 placeholder:text-blue-100/35 outline-none focus:border-[#f3ba2f]/55 resize-none disabled:opacity-50"
                />
                <button
                  type="button"
                  disabled={!userTelegramInitData || submitting}
                  onClick={() => void submitSuggestion()}
                  className="mt-2 w-full rounded-lg bg-[#f3ba2f] text-black font-bold py-2 text-sm disabled:opacity-45"
                >
                  {submitting ? 'Posting…' : 'Post'}
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-blue-100/70 uppercase tracking-wide mb-2">
                  Recent feedback
                </p>
                {commentsLoading ? (
                  <p className="text-xs text-blue-100/50">Loading…</p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-blue-100/45">No comments yet — start the conversation.</p>
                ) : (
                  <ul className="space-y-2">
                    {comments.map((c) => (
                      <li
                        key={c.id}
                        className="rounded-lg border border-[#8bb4ef]/20 bg-[#0c1526]/95 px-3 py-2 text-sm text-blue-50"
                      >
                        <span className="text-[11px] font-semibold text-[#f3ba2f]/90">
                          {c.authorName ?? 'Citizen'}
                        </span>
                        <span className="text-[10px] text-blue-100/45 ml-2">
                          {formatWhen(c.createdAt)}
                        </span>
                        <p className="text-blue-100/90 mt-1 whitespace-pre-wrap break-words">{c.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
