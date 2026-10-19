'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function openExternalUrl(url: string) {
  if (typeof window === 'undefined') return;
  const tg = (
    window as unknown as {
      Telegram?: { WebApp?: { openLink?: (u: string, o?: { try_instant_view?: boolean }) => void } };
    }
  ).Telegram?.WebApp;
  if (tg?.openLink) tg.openLink(url, { try_instant_view: false });
  else window.open(url, '_blank', 'noopener,noreferrer');
}

const INTRO: ChatMessage = {
  role: 'assistant',
  content:
    'Karibu — I’m the Ask the Kamisona assistant. I give bot assistance and frequently asked questions answered by the Kamisona General of URA.',
};

type Props = { onClose: () => void };

export default function KamisonaChatPopup({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current && (listRef.current.scrollTop = listRef.current.scrollHeight);
  }, [messages, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    triggerHapticFeedback(window);
    setInput('');
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, mode: 'kamisona' }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string };
      const reply =
        data.reply?.trim() ||
        'I could not answer right now. If you are not satisfied, submit your question to the Commissioner General below.';
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            'Connection issue. Not satisfied or do not find your answer? Submit your question to the Commissioner General below.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const bot = process.env.NEXT_PUBLIC_BOT_USERNAME?.trim();
  const tgUrl =
    process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM_URL?.trim() ||
    (bot ? `https://t.me/${bot.replace(/^@/, '')}` : 'https://t.me/telegram');

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#0a1628] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 px-3.5 py-3 bg-[#123f78] border-b border-white/10">
          <div>
            <p className="text-sm font-extrabold text-white">Ask the Kamisona</p>
            <p className="text-[11px] text-[#f3ba2f]">FAQ · Commissioner General handoff</p>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              onClose();
            }}
            className="rounded-xl border border-[#8bb4ef]/40 px-3 py-1.5 text-sm font-semibold text-blue-50"
          >
            Close
          </button>
        </div>

        <div ref={listRef} className="flex-1 min-h-[12rem] overflow-y-auto px-3 py-3 space-y-2">
          {messages.map((msg, i) => (
            <div
              key={`${i}-${msg.role}`}
              className={`rounded-xl px-3 py-2 text-[13px] leading-snug whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'ml-8 bg-[#1f3f8f]/50 text-sky-50 border border-[#5fa8ff]/30'
                  : 'mr-6 bg-white/5 text-slate-100 border border-white/10'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading ? (
            <p className="text-xs text-slate-400 px-1">Kamisona is thinking…</p>
          ) : null}
        </div>

        <div className="border-t border-white/10 px-3 py-2.5 space-y-2 bg-[#061428]">
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              setAgentOpen((v) => !v);
            }}
            className="w-full rounded-xl border border-[#f3ba2f]/50 bg-[#f3ba2f]/15 py-2.5 text-xs font-bold text-[#f3ba2f]"
          >
            {agentOpen
              ? 'Hide submission options'
              : 'Not satisfied or do not find your answer? Submit to the Commissioner General'}
          </button>
          {agentOpen ? (
            <div className="rounded-xl border border-[#8bb4ef]/30 bg-[#0f315f]/80 p-2.5 space-y-2">
              <p className="text-[11px] text-blue-100/80 leading-snug px-0.5">
                Submit your question to the Commissioner General via Telegram or call URA.
              </p>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  openExternalUrl(tgUrl);
                }}
                className="w-full rounded-lg bg-[#229ED9]/25 border border-[#229ED9]/40 py-2 text-xs font-semibold text-sky-100"
              >
                Submit via Telegram
              </button>
              <a
                href="tel:0800117000"
                onClick={() => triggerHapticFeedback(window)}
                className="block w-full rounded-lg border border-white/15 py-2 text-center text-xs font-semibold text-white"
              >
                Call URA 0800 117 000
              </a>
            </div>
          ) : null}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Ask the Kamisona…"
              className="flex-1 rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm text-white placeholder:text-slate-500"
            />
            <button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => void send()}
              className="rounded-xl bg-[#f3ba2f] px-4 text-sm font-extrabold text-[#123f78] disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
