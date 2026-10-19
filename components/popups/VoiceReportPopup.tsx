'use client';

import { useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { submitEarnPearlActivity } from '@/utils/earn-activity-submit';

const REWARD_BLUE = 500;

type Props = { onClose: () => void };

export default function VoiceReportPopup({ onClose }: Props) {
  const showToast = useToast();
  const { userTelegramInitData } = useGameStore();
  const [topic, setTopic] = useState('Taxpayer experience');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (notes.trim().length < 12) {
      showToast('Add a short voice report summary (12+ characters)', 'error');
      return;
    }
    if (!userTelegramInitData) {
      showToast('Open from Telegram to submit', 'error');
      return;
    }
    setBusy(true);
    triggerHapticFeedback(window);
    const res = await submitEarnPearlActivity({
      initData: userTelegramInitData,
      sourceKey: 'voice_report',
      sourceLabel: `Voice report · ${topic}: ${notes.trim().slice(0, 80)}`,
      amount: REWARD_BLUE,
      activityType: 'blue',
    });
    setBusy(false);
    if (!res.ok) {
      showToast(res.error, 'error');
      return;
    }
    setDone(true);
    showToast('Submitted for approval · +500 blue pending', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#0a1628] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#123f78]">
          <div>
            <p className="text-sm font-extrabold text-white">Voice reports</p>
            <p className="text-[11px] text-[#f3ba2f]">Approval-required · +{REWARD_BLUE} blue pending</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/20 px-3 py-1.5 text-sm text-white">
            Close
          </button>
        </div>
        <div className="p-4 space-y-3 text-white">
          {done ? (
            <div className="text-center space-y-2">
              <p className="font-extrabold">Report submitted</p>
              <p className="text-xs text-blue-100">Pending admin approval for blue pearls.</p>
              <button type="button" onClick={onClose} className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]">
                Done
              </button>
            </div>
          ) : (
            <>
              <label className="block text-xs text-blue-100">
                Topic
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm"
                >
                  {['Taxpayer experience', 'Service desk', 'Payment issue', 'EFRIS / invoice', 'Other'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-blue-100">
                Voice report notes (what you would say)
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Summarise your spoken report…"
                  className="mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm resize-none"
                />
              </label>
              <p className="text-[10px] text-slate-400">In-app simulation — no URA website. Admin reviews blue pearl rewards.</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit()}
                className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-50"
              >
                {busy ? 'Submitting…' : 'Submit for approval'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
