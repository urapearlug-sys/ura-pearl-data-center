'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { notifyPearlBalancesRefresh } from '@/utils/pearl-balance-events';
import { submitEarnPearlActivity } from '@/utils/earn-activity-submit';
import {
  TAX_TRIVIA_RACE_CONFIG,
  TAX_TRIVIA_RACE_POOL,
  type TaxTriviaRaceQuestion,
} from '@/data/tax-trivia-race-questions';
import {
  canPlayTaxTriviaRaceToday,
  markTaxTriviaRacePlayed,
  taxTriviaUserKey,
} from '@/utils/tax-trivia-daily';

type Props = { onClose: () => void };

type Phase = 'intro' | 'race' | 'finished' | 'locked';

function shuffleQuestions(seed: string, count: number): TaxTriviaRaceQuestion[] {
  const pool = [...TAX_TRIVIA_RACE_POOL];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  for (let i = pool.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) | 0;
    const j = ((h >>> 0) % (i + 1)) | 0;
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

function calcPearls(correct: number, streakMax: number, speedBonuses: number) {
  const cfg = TAX_TRIVIA_RACE_CONFIG;
  const base = correct * cfg.basePearlsPerCorrect;
  const streakBonus = Math.floor(streakMax / cfg.streakEvery) * cfg.streakBonusPearls;
  const speed = speedBonuses * cfg.speedBonusPearls;
  return base + streakBonus + speed;
}

export default function TaxTriviaQuizRacePopup({ onClose }: Props) {
  const showToast = useToast();
  const { userTelegramInitData, incrementPoints } = useGameStore();
  const userKey = useMemo(() => taxTriviaUserKey(userTelegramInitData), [userTelegramInitData]);
  const lockedToday = useMemo(() => !canPlayTaxTriviaRaceToday(userKey), [userKey]);

  const [phase, setPhase] = useState<Phase>(() => (lockedToday ? 'locked' : 'intro'));
  const [questions, setQuestions] = useState<TaxTriviaRaceQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(TAX_TRIVIA_RACE_CONFIG.secondsPerQuestion);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakMax, setStreakMax] = useState(0);
  const [speedBonuses, setSpeedBonuses] = useState(0);
  const [pearlsAwarded, setPearlsAwarded] = useState(0);
  const [busy, setBusy] = useState(false);
  const questionStartedAt = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveRef = useRef<(optionIndex: number | null, timedOut: boolean) => void>(() => {});

  const q = questions[qIndex];
  const progressPct = questions.length ? ((qIndex + (revealed ? 1 : 0)) / questions.length) * 100 : 0;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishRace = useCallback(
    async (finalCorrect: number, finalStreakMax: number, finalSpeed: number) => {
      clearTimer();
      setPhase('finished');
      const earned = calcPearls(finalCorrect, finalStreakMax, finalSpeed);
      markTaxTriviaRacePlayed(userKey);
      if (!userTelegramInitData || earned <= 0) {
        setPearlsAwarded(0);
        return;
      }
      setBusy(true);
      const res = await submitEarnPearlActivity({
        initData: userTelegramInitData,
        sourceKey: 'tax_trivia_race',
        sourceLabel: `Tax Trivia Race · ${finalCorrect}/${questions.length} · streak ${finalStreakMax}`,
        amount: earned,
        activityType: 'white',
      });
      setBusy(false);
      if (res.ok) {
        setPearlsAwarded(earned);
        incrementPoints(earned);
        notifyPearlBalancesRefresh();
        showToast(`+${earned} white pearls`, 'success');
      } else {
        showToast(res.error, 'error');
      }
    },
    [clearTimer, userKey, userTelegramInitData, questions.length, incrementPoints, showToast],
  );

  const resolveAnswer = useCallback(
    (optionIndex: number | null, timedOut: boolean) => {
      if (!q || revealed) return;
      clearTimer();
      setRevealed(true);
      const correct = optionIndex === q.correctIndex;
      const elapsedSec = (Date.now() - questionStartedAt.current) / 1000;
      let nextCorrect = correctCount;
      let nextStreak = streak;
      let nextStreakMax = streakMax;
      let nextSpeed = speedBonuses;

      if (correct) {
        nextCorrect = correctCount + 1;
        nextStreak = streak + 1;
        nextStreakMax = Math.max(streakMax, nextStreak);
        if (elapsedSec <= TAX_TRIVIA_RACE_CONFIG.speedBonusThresholdSec) {
          nextSpeed = speedBonuses + 1;
        }
        triggerHapticFeedback(window);
      } else {
        nextStreak = 0;
        if (!timedOut) triggerHapticFeedback(window);
      }

      setPicked(optionIndex);
      setCorrectCount(nextCorrect);
      setStreak(nextStreak);
      setStreakMax(nextStreakMax);
      setSpeedBonuses(nextSpeed);

      window.setTimeout(() => {
        if (qIndex + 1 >= questions.length) {
          void finishRace(nextCorrect, nextStreakMax, nextSpeed);
        } else {
          setQIndex((i) => i + 1);
          setPicked(null);
          setRevealed(false);
          setTimeLeft(TAX_TRIVIA_RACE_CONFIG.secondsPerQuestion);
          questionStartedAt.current = Date.now();
        }
      }, timedOut ? 900 : 700);
    },
    [q, revealed, clearTimer, correctCount, streak, streakMax, speedBonuses, qIndex, questions.length, finishRace],
  );

  resolveRef.current = resolveAnswer;

  useEffect(() => {
    if (phase !== 'race' || revealed || !q) return;
    questionStartedAt.current = Date.now();
    setTimeLeft(TAX_TRIVIA_RACE_CONFIG.secondsPerQuestion);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          resolveRef.current(null, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  }, [phase, qIndex, q?.id, revealed, clearTimer]);

  const startRace = () => {
    triggerHapticFeedback(window);
    const daySeed = new Date().toLocaleDateString('en-CA');
    setQuestions(shuffleQuestions(daySeed, TAX_TRIVIA_RACE_CONFIG.questionsPerRace));
    setQIndex(0);
    setCorrectCount(0);
    setStreak(0);
    setStreakMax(0);
    setSpeedBonuses(0);
    setPearlsAwarded(0);
    setPhase('race');
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#0a1628] text-white">
      <div className="shrink-0 bg-[#123f78] px-4 py-3 flex items-center justify-between border-b border-[#f3ba2f]/30">
        <div>
          <p className="text-sm font-extrabold flex items-center gap-1.5">
            <span aria-hidden>🏁</span> Tax Trivia Race
          </p>
          <p className="text-[11px] text-[#f3ba2f]">Beat the clock · streak bonuses</p>
        </div>
        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback(window);
            clearTimer();
            onClose();
          }}
          className="rounded-xl border border-white/20 px-3 py-1.5 text-sm"
        >
          Close
        </button>
      </div>

      {phase === 'locked' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <p className="text-lg font-extrabold text-[#f3ba2f]">Race complete for today</p>
          <p className="text-sm text-blue-100">Come back tomorrow for a fresh question set and another run.</p>
          <button type="button" onClick={onClose} className="w-full max-w-xs rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]">
            Done
          </button>
        </div>
      ) : phase === 'intro' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
          <p className="text-4xl" aria-hidden>
            ⚡
          </p>
          <h2 className="text-xl font-extrabold">Quiz race</h2>
          <p className="text-sm text-blue-100 leading-relaxed">
            Answer {TAX_TRIVIA_RACE_CONFIG.questionsPerRace} Uganda tax questions before time runs out. Fast correct
            answers build streaks and extra white pearls — like Scholar&apos;s Trial in AfroLumens.
          </p>
          <ul className="text-left text-[13px] text-blue-200/90 space-y-1.5 w-full">
            <li>• {TAX_TRIVIA_RACE_CONFIG.secondsPerQuestion}s per question</li>
            <li>• +{TAX_TRIVIA_RACE_CONFIG.basePearlsPerCorrect} pearls per correct answer</li>
            <li>• Streak every {TAX_TRIVIA_RACE_CONFIG.streakEvery} correct: +{TAX_TRIVIA_RACE_CONFIG.streakBonusPearls}</li>
            <li>• Answer in under {TAX_TRIVIA_RACE_CONFIG.speedBonusThresholdSec}s: +{TAX_TRIVIA_RACE_CONFIG.speedBonusPearls} speed bonus</li>
          </ul>
          <button
            type="button"
            onClick={startRace}
            className="w-full rounded-xl bg-[#f3ba2f] py-3 text-sm font-extrabold text-[#123f78] shadow-lg shadow-[#f3ba2f]/25"
          >
            Start race
          </button>
        </div>
      ) : phase === 'finished' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 max-w-md mx-auto">
          <p className="text-3xl font-extrabold text-[#f3ba2f]">Finish!</p>
          <p className="text-lg text-white">
            {correctCount} / {questions.length} correct
          </p>
          <p className="text-sm text-blue-100">Best streak: {streakMax}</p>
          {pearlsAwarded > 0 ? (
            <p className="text-emerald-300 font-bold">+{pearlsAwarded} white pearls</p>
          ) : (
            <p className="text-sm text-blue-200/80">Practice makes perfect — try again tomorrow.</p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
          >
            Done
          </button>
        </div>
      ) : q ? (
        <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
          <div className="mb-3">
            <div className="flex justify-between text-[11px] text-blue-200/80 mb-1">
              <span>
                Q {qIndex + 1}/{questions.length}
              </span>
              <span className={streak >= 2 ? 'text-[#f3ba2f] font-bold' : ''}>
                {streak >= 2 ? `🔥 Streak ${streak}` : 'Build a streak'}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#121f35] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#f3ba2f] to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div
            className={`mb-4 flex items-center justify-center rounded-2xl border py-3 ${
              timeLeft <= 4 ? 'border-rose-400/60 bg-rose-500/10 animate-pulse' : 'border-[#f3ba2f]/40 bg-[#121f35]'
            }`}
          >
            <span className={`text-3xl font-mono font-extrabold ${timeLeft <= 4 ? 'text-rose-300' : 'text-[#f3ba2f]'}`}>
              {timeLeft}s
            </span>
          </div>

          <h2 className="text-base font-bold leading-snug mb-4">{q.questionText}</h2>

          <div className="space-y-2 flex-1">
            {q.options.map((opt, i) => {
              let style = 'border-[#8bb4ef]/35 bg-[#121f35]';
              if (revealed) {
                if (i === q.correctIndex) style = 'border-emerald-400 bg-emerald-500/20';
                else if (picked === i) style = 'border-rose-400 bg-rose-500/15';
                else style = 'border-white/10 opacity-50';
              } else if (picked === i) style = 'border-[#f3ba2f] bg-[#f3ba2f]/15';

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={revealed || timeLeft === 0}
                  onClick={() => resolveAnswer(i, false)}
                  className={`w-full text-left rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {revealed ? <p className="text-xs text-blue-100/90 mt-3 leading-relaxed">{q.explain}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
