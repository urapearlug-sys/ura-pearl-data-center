'use client';

import { useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { submitEarnPearlActivity } from '@/utils/earn-activity-submit';

const REWARD_BLUE = 1000;

type Props = { onClose: () => void };

export default function WhistleBlowerPopup({ onClose }: Props) {
  const showToast = useToast();
  const { userTelegramInitData } = useGameStore();
  const [category, setCategory] = useState('Tax evasion');
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (details.trim().length < 20) {
      showToast('Provide more detail (20+ characters)', 'error');
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
      sourceKey: 'whistle_blower',
      sourceLabel: `Whistle blower · ${category}${location ? ` · ${location}` : ''}: ${details.trim().slice(0, 100)}`,
      amount: REWARD_BLUE,
      activityType: 'blue',
    });
    setBusy(false);
    if (!res.ok) {
      showToast(res.error, 'error');
      return;
    }
    setDone(true);
    showToast('Tip submitted · pending approval', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#0a1628] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#123f78]">
          <div>
            <p className="text-sm font-extrabold text-white">Whistle blower</p>
            <p className="text-[11px] text-[#f3ba2f]">Reward & protection · +{REWARD_BLUE} blue pending</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/20 px-3 py-1.5 text-sm text-white">
            Close
          </button>
        </div>
        <div className="p-4 space-y-3 text-white">
          {done ? (
            <div className="text-center space-y-2">
              <p className="font-extrabold">Thank you</p>
              <p className="text-xs text-blue-100">Your tip is confidential in-app and awaits review. This does not replace official URA channels.</p>
              <button type="button" onClick={onClose} className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]">
                Done
              </button>
            </div>
          ) : (
            <>
              <label className="block text-xs text-blue-100">
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm"
                >
                  {['Tax evasion', 'Fake receipts', 'Smuggling', 'Corruption', 'Other'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-blue-100">
                Location / district (optional)
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block text-xs text-blue-100">
                What happened?
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm resize-none"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit()}
                className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-50"
              >
                {busy ? 'Submitting…' : 'Submit tip'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
