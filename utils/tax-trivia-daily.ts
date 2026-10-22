import { resolvePaymentActivityUserKey } from '@/utils/payment-activity-storage';

const PREFIX = 'ura:tax-trivia-race:';

function key(userKey: string) {
  return `${PREFIX}${userKey || 'anon'}`;
}

function todayKey(now = new Date()) {
  return now.toLocaleDateString('en-CA');
}

export function canPlayTaxTriviaRaceToday(userKey: string, now = new Date()) {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(key(userKey));
    if (!raw) return true;
    const parsed = JSON.parse(raw) as { date?: string };
    return parsed.date !== todayKey(now);
  } catch {
    return true;
  }
}

export function markTaxTriviaRacePlayed(userKey: string, now = new Date()) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key(userKey), JSON.stringify({ date: todayKey(now) }));
  } catch {
    /* quota */
  }
}

export function taxTriviaUserKey(initData: string | null | undefined) {
  return resolvePaymentActivityUserKey(initData);
}
