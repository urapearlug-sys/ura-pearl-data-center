'use client';

import { useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { notifyPearlBalancesRefresh } from '@/utils/pearl-balance-events';
import { submitEarnPearlActivity } from '@/utils/earn-activity-submit';

const STEPS = [
  {
    id: 'tin',
    title: 'Know your TIN',
    body: 'Confirm you understand a TIN identifies you for filing and payments.',
  },
  {
    id: 'calendar',
    title: 'Filing calendar',
    body: 'Commit to checking return due dates before each period ends.',
  },
  {
    id: 'records',
    title: 'Keep records',
    body: 'Keep PRN slips and invoices for at least the retention period you need.',
  },
  {
    id: 'compliance',
    title: 'Stay compliant',
    body: 'Plan to file and pay on time — tenure grows with consistent compliance.',
  },
] as const;

const REWARD_WHITE = 250;

type Props = { onClose: () => void };

export default function EarnTenurePopup({ onClose }: Props) {
  const showToast = useToast();
  const { userTelegramInitData, incrementPoints } = useGameStore();
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const current = STEPS[step];
  const allDone = STEPS.every((s) => checked[s.id]);

  const toggle = () => {
    triggerHapticFeedback(window);
    setChecked((c) => ({ ...c, [current.id]: !c[current.id] }));
  };

  const finish = async () => {
    if (!allDone) {
      showToast('Complete every tenure step first', 'error');
      return;
    }
    if (!userTelegramInitData) {
      showToast('Open from Telegram to claim', 'error');
      return;
    }
    setBusy(true);
    const res = await submitEarnPearlActivity({
      initData: userTelegramInitData,
      sourceKey: 'earn_your_tenure',
      sourceLabel: 'Earn your Tenure · compliance pledge completed',
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
    showToast(`Tenure earned · +${REWARD_WHITE} white pearls`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#0a1628] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#123f78]">
          <div>
            <p className="text-sm font-extrabold text-white">Earn your Tenure</p>
            <p className="text-[11px] text-[#f3ba2f]">Reward & protection · in-app pledge</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/20 px-3 py-1.5 text-sm text-white">
            Close
          </button>
        </div>
        <div className="p-4 space-y-3 text-white">
          {done ? (
            <div className="text-center space-y-2">
              <p className="font-extrabold">Tenure pledge complete</p>
              <p className="text-xs text-blue-100">+{REWARD_WHITE} white pearls awarded.</p>
              <button type="button" onClick={onClose} className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]">
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-200/80">
                Step {step + 1}/{STEPS.length}
              </p>
              <p className="text-base font-extrabold">{current.title}</p>
              <p className="text-sm text-blue-100/90 leading-relaxed">{current.body}</p>
              <button
                type="button"
                onClick={toggle}
                className={`w-full rounded-xl border py-2.5 text-sm font-bold ${
                  checked[current.id]
                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                    : 'border-[#8bb4ef]/40 bg-[#121f35]'
                }`}
              >
                {checked[current.id] ? '✓ Marked complete' : 'Mark this step complete'}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm disabled:opacity-40"
                >
                  Back
                </button>
                {step + 1 < STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    className="flex-[2] rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy || !allDone}
                    onClick={() => void finish()}
                    className="flex-[2] rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-50"
                  >
                    {busy ? 'Claiming…' : `Claim +${REWARD_WHITE}`}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
