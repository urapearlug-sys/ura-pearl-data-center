'use client';

import { useMemo, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { notifyPearlBalancesRefresh } from '@/utils/pearl-balance-events';
import { submitEarnPearlActivity } from '@/utils/earn-activity-submit';
import { WAREHOUSING_SURVEY_QUESTIONS } from '@/data/warehousing-survey';

const REWARD_WHITE = 100;

/** 0 name/number · 1 experience · 2–5 survey Qs · 6 thank you · 7 rating + comment */
const STEP_COUNT = 8;

type Props = { onClose: () => void };

function YesNoButtons({
  value,
  onPick,
  disabled,
}: {
  value: boolean | null;
  onPick: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { v: true, label: 'Yes' },
        { v: false, label: 'No' },
      ].map(({ v, label }) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => {
            triggerHapticFeedback(window);
            onPick(v);
          }}
          className={`rounded-xl border py-3 text-sm font-bold disabled:opacity-60 ${
            value === v
              ? 'border-[#f3ba2f] bg-[#f3ba2f]/20 text-[#f3ba2f]'
              : 'border-[#8bb4ef]/40 bg-[#121f35] text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function WarehousingSurveyPopup({ onClose }: Props) {
  const showToast = useToast();
  const { userTelegramInitData, incrementPoints } = useGameStore();

  const [step, setStep] = useState(0);
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseNumber, setWarehouseNumber] = useState('');
  const [experienceFriendly, setExperienceFriendly] = useState<'friendly' | 'not_friendly' | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, boolean | null>>(() =>
    Object.fromEntries(WAREHOUSING_SURVEY_QUESTIONS.map((q) => [q.id, null])),
  );
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const surveyStepIndex = step - 2;
  const currentQuestion =
    surveyStepIndex >= 0 && surveyStepIndex < WAREHOUSING_SURVEY_QUESTIONS.length
      ? WAREHOUSING_SURVEY_QUESTIONS[surveyStepIndex]
      : null;

  const canNext = useMemo(() => {
    if (step === 0) return warehouseName.trim().length > 0 && warehouseNumber.trim().length > 0;
    if (step === 1) return experienceFriendly !== null;
    if (step >= 2 && step <= 5 && currentQuestion) {
      return questionAnswers[currentQuestion.id] !== null && questionAnswers[currentQuestion.id] !== undefined;
    }
    if (step === 6) return true;
    if (step === 7) return stars >= 1;
    return false;
  }, [step, warehouseName, warehouseNumber, experienceFriendly, currentQuestion, questionAnswers, stars]);

  const goNext = () => {
    if (!canNext) return;
    triggerHapticFeedback(window);
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  };

  const buildSummaryLabel = () => {
    const friendly = experienceFriendly === 'friendly' ? 'Friendly' : 'Not friendly';
    const qParts = WAREHOUSING_SURVEY_QUESTIONS.map((q) => {
      const a = questionAnswers[q.id];
      return `${q.id}:${a === true ? 'yes' : a === false ? 'no' : '—'}`;
    }).join('; ');
    return `Warehousing · ${warehouseName.trim()} · ${warehouseNumber.trim()} · ${friendly} · ${qParts} · ${stars}/5${
      comment.trim() ? ` · ${comment.trim().slice(0, 60)}` : ''
    }`;
  };

  const submit = async () => {
    if (!userTelegramInitData) {
      showToast('Open from Telegram to submit', 'error');
      return;
    }
    setBusy(true);
    triggerHapticFeedback(window);
    const res = await submitEarnPearlActivity({
      initData: userTelegramInitData,
      sourceKey: 'rate_service_warehousing',
      sourceLabel: buildSummaryLabel(),
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
    showToast(`Thank you · +${REWARD_WHITE} white pearls`, 'success');
  };

  const progressLabel = () => {
    if (step === 0) return 'Step 1 of 7';
    if (step === 1) return 'Step 2 of 7';
    if (step >= 2 && step <= 5) return `Question ${step - 1} of 4`;
    if (step === 6) return 'Almost done';
    return 'Final step';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#0a1628] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#123f78] shrink-0">
          <div>
            <p className="text-sm font-extrabold text-white">Warehousing</p>
            <p className="text-[11px] text-[#f3ba2f]">{progressLabel()}</p>
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

        <div className="p-4 space-y-3 text-white overflow-y-auto flex-1">
          {done ? (
            <div className="text-center space-y-2">
              <p className="font-extrabold text-[#f3ba2f]">Thank you for your feedback</p>
              <p className="text-sm text-blue-100">Your warehousing experience helps URA improve bonded warehouse services.</p>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
              >
                Done
              </button>
            </div>
          ) : step === 0 ? (
            <>
              <p className="text-sm font-semibold">Warehouse details</p>
              <label className="block text-[11px] text-blue-200/90">
                Warehousing name
                <input
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  placeholder="e.g. ABC Bonded Warehouse"
                  className="mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm text-white"
                />
              </label>
              <label className="block text-[11px] text-blue-200/90">
                Warehousing number
                <input
                  value={warehouseNumber}
                  onChange={(e) => setWarehouseNumber(e.target.value)}
                  placeholder="Reference or licence number"
                  className="mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm text-white"
                />
              </label>
              <NextButton disabled={!canNext} onClick={goNext} />
            </>
          ) : step === 1 ? (
            <>
              <p className="text-sm font-semibold leading-relaxed">
                How have you found your warehousing experience?
              </p>
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    { id: 'friendly' as const, label: 'Friendly' },
                    { id: 'not_friendly' as const, label: 'Not friendly' },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setExperienceFriendly(id);
                    }}
                    className={`rounded-xl border py-3 text-sm font-bold ${
                      experienceFriendly === id
                        ? 'border-[#f3ba2f] bg-[#f3ba2f]/20 text-[#f3ba2f]'
                        : 'border-[#8bb4ef]/40 bg-[#121f35]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <NextButton disabled={!canNext} onClick={goNext} />
            </>
          ) : step >= 2 && step <= 5 && currentQuestion ? (
            <>
              <p className="text-[11px] text-blue-200/80">Warehousing survey · question {surveyStepIndex + 1} of 4</p>
              <p className="text-sm font-semibold leading-relaxed">{currentQuestion.text}</p>
              <YesNoButtons
                value={questionAnswers[currentQuestion.id] ?? null}
                onPick={(v) => setQuestionAnswers((prev) => ({ ...prev, [currentQuestion.id]: v }))}
              />
              <NextButton disabled={!canNext} onClick={goNext} />
            </>
          ) : step === 6 ? (
            <>
              <div className="text-center space-y-2 py-2">
                <p className="text-lg font-extrabold text-[#f3ba2f]">Thank you</p>
                <p className="text-sm text-blue-100 leading-relaxed">
                  {questionAnswers.ura_help === true
                    ? 'URA will follow up where we can on complaints related to licensed warehousing.'
                    : 'Your responses have been recorded. URA appreciates your honesty.'}
                </p>
              </div>
              <NextButton disabled={false} onClick={goNext} label="Next · Rate your experience" />
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">Rate your overall warehousing experience</p>
              <p className="text-xs text-blue-100">1 = poor · 5 = excellent</p>
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
              {!showComment ? (
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setShowComment(true);
                  }}
                  className="w-full rounded-xl border border-[#8bb4ef]/40 py-2.5 text-sm font-semibold text-blue-100"
                >
                  Add a comment
                </button>
              ) : (
                <label className="block text-[11px] text-blue-200/90">
                  Your comment
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Tell us more about your warehousing experience…"
                    className="mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm resize-none text-white"
                    autoFocus
                  />
                </label>
              )}
              <button
                type="button"
                disabled={busy || !canNext}
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

function NextButton({
  disabled,
  onClick,
  label = 'Next',
}: {
  disabled: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-40"
    >
      {label}
    </button>
  );
}
