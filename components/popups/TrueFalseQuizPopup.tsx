'use client';

import { useMemo, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { notifyPearlBalancesRefresh } from '@/utils/pearl-balance-events';
import { TRUE_FALSE_REWARD_WHITE, TRUE_FALSE_UGANDA_TAX } from '@/data/true-false-uganda-tax';
import { submitEarnPearlActivity } from '@/utils/earn-activity-submit';
import {
  saveTrueFalseDailyAttempt,
  trueFalseDailyStatus,
  trueFalseRetryMessage,
  trueFalseUserKey,
} from '@/utils/true-false-daily';

type Props = { onClose: () => void };

export default function TrueFalseQuizPopup({ onClose }: Props) {
  const showToast = useToast();
  const { userTelegramInitData, incrementPoints } = useGameStore();
  const userKey = useMemo(() => trueFalseUserKey(userTelegramInitData), [userTelegramInitData]);
  const dailyStatus = useMemo(() => trueFalseDailyStatus(userKey), [userKey]);
  const locked = !dailyStatus.canPlay;

  const questions = useMemo(() => TRUE_FALSE_UGANDA_TAX.slice(0, 3), []);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [awarded, setAwarded] = useState(0);

  const q = questions[index];

  const answer = (value: boolean) => {
    if (picked !== null || !q || locked) return;
    triggerHapticFeedback(window);
    setPicked(value);
    if (value === q.isTrue) setScore((s) => s + 1);
  };

  const finishWithScore = async (finalScore: number) => {
    setDone(true);
    const won = finalScore === questions.length;
    saveTrueFalseDailyAttempt(userKey, won);
    const earned = won ? TRUE_FALSE_REWARD_WHITE : 0;
    if (!userTelegramInitData || earned <= 0) {
      setAwarded(0);
      return;
    }
    setBusy(true);
    const res = await submitEarnPearlActivity({
      initData: userTelegramInitData,
      sourceKey: 'true_false_uganda_tax',
      sourceLabel: `True/False Uganda Tax · ${finalScore}/${questions.length}`,
      amount: earned,
      activityType: 'white',
    });
    setBusy(false);
    if (res.ok) {
      setAwarded(earned);
      incrementPoints(earned);
      notifyPearlBalancesRefresh();
      showToast(`+${earned} white pearls`, 'success');
    } else {
      showToast(res.error, 'error');
    }
  };

  const next = () => {
    triggerHapticFeedback(window);
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setPicked(null);
      return;
    }
    void finishWithScore(score);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#0a1628] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#123f78]">
          <div>
            <p className="text-sm font-extrabold text-white">True or False</p>
            <p className="text-[11px] text-[#f3ba2f]">3 questions · all correct to win · once per day</p>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              onClose();
            }}
            className="rounded-xl border border-white/20 px-3 py-1.5 text-sm text-white"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-3 text-white">
          {locked ? (
            <div className="space-y-3 text-center py-2">
              <p className="text-lg font-extrabold text-[#f3ba2f]">Already played today</p>
              <p className="text-sm text-blue-100 leading-relaxed">
                {dailyStatus.wonToday
                  ? 'You completed today’s round. Come back tomorrow for a new set of questions.'
                  : `You didn’t get all three correct. ${trueFalseRetryMessage()}`}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
              >
                Done
              </button>
            </div>
          ) : done ? (
            <div className="space-y-2 text-center">
              <p className="text-lg font-extrabold">
                {score === questions.length ? 'You win!' : 'No pearls this round'}
              </p>
              <p className="text-sm text-blue-100">
                Score {score}/{questions.length}
                {awarded > 0
                  ? ` · +${awarded} white pearls`
                  : score < questions.length
                    ? ` · ${trueFalseRetryMessage()}`
                    : ''}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
              >
                Done
              </button>
            </div>
          ) : q ? (
            <>
              <p className="text-[11px] text-blue-200/80">
                Question {index + 1}/{questions.length}
              </p>
              <p className="text-sm font-semibold leading-relaxed">{q.statement}</p>
              <div className="grid grid-cols-2 gap-2">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    disabled={picked !== null}
                    onClick={() => answer(v)}
                    className={`rounded-xl border py-3 text-sm font-bold disabled:opacity-80 ${
                      picked === null
                        ? 'border-[#8bb4ef]/40 bg-[#121f35]'
                        : picked === v
                          ? v === q.isTrue
                            ? 'border-emerald-400 bg-emerald-500/20'
                            : 'border-rose-400 bg-rose-500/20'
                          : v === q.isTrue
                            ? 'border-emerald-400/50 bg-emerald-500/10'
                            : 'border-white/10 bg-[#121f35] opacity-50'
                    }`}
                  >
                    {v ? 'True' : 'False'}
                  </button>
                ))}
              </div>
              {picked !== null ? (
                <>
                  <p className="text-xs text-blue-100/90 leading-relaxed">{q.explain}</p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={next}
                    className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-50"
                  >
                    {busy ? 'Saving…' : index + 1 < questions.length ? 'Next' : 'Finish'}
                  </button>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
