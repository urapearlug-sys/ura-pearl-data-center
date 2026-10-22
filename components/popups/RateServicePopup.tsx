'use client';

import { useState } from 'react';
import WarehousingSurveyPopup from '@/components/popups/WarehousingSurveyPopup';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { notifyPearlBalancesRefresh } from '@/utils/pearl-balance-events';
import { submitEarnPearlActivity } from '@/utils/earn-activity-submit';

const REWARD_WHITE = 100;

type Props = {
  onClose: () => void;
  /** Display context */
  mode?: 'warehousing' | 'groupage' | 'service';
};

function RateServiceSimplePopup({ onClose, mode }: Props & { mode: 'groupage' | 'service' }) {
  const showToast = useToast();
  const { userTelegramInitData, incrementPoints } = useGameStore();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const title = mode === 'groupage' ? 'Groupage experience' : 'Rate the service';

  const submit = async () => {
    if (!userTelegramInitData) {
      showToast('Open from Telegram to submit', 'error');
      return;
    }
    setBusy(true);
    triggerHapticFeedback(window);
    const res = await submitEarnPearlActivity({
      initData: userTelegramInitData,
      sourceKey: `rate_service_${mode}`,
      sourceLabel: `${title} · ${stars}/5${comment.trim() ? `: ${comment.trim().slice(0, 80)}` : ''}`,
      amount: REWARD_WHITE,
      activityType: 'white',
    });
    setBusy(false);
    if (!res.ok) {
      showToast(res.error, 'error');
      return;
    }
    incrementPoints(REWARD_WHITE);
    notifyPearlBalancesRefresh();
    setDone(true);
    showToast(`Thanks · +${REWARD_WHITE} white pearls`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#0a1628] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#123f78]">
          <div>
            <p className="text-sm font-extrabold text-white">{title}</p>
            <p className="text-[11px] text-[#f3ba2f]">Rate the service · in-app</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/20 px-3 py-1.5 text-sm text-white">
            Close
          </button>
        </div>
        <div className="p-4 space-y-3 text-white">
          {done ? (
            <div className="text-center space-y-2">
              <p className="font-extrabold">Rating saved</p>
              <button type="button" onClick={onClose} className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]">
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-blue-100">How was your experience?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setStars(n);
                    }}
                    className={`h-10 w-10 rounded-xl border text-sm font-bold ${
                      stars >= n
                        ? 'border-[#f3ba2f] bg-[#f3ba2f]/20 text-[#f3ba2f]'
                        : 'border-white/15 text-slate-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Optional comment"
                className="w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm resize-none"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit()}
                className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-50"
              >
                {busy ? 'Saving…' : `Submit · +${REWARD_WHITE} white pearls`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RateServicePopup({ onClose, mode = 'warehousing' }: Props) {
  if (mode === 'warehousing') {
    return <WarehousingSurveyPopup onClose={onClose} />;
  }
  return <RateServiceSimplePopup onClose={onClose} mode={mode} />;
}
