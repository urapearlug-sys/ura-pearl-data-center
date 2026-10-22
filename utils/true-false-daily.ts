import { resolvePaymentActivityUserKey } from '@/utils/payment-activity-storage';

const PREFIX = 'ura:true-false-daily:';

export type TrueFalseDailyRecord = {
  date: string;
  won: boolean;
};

function storageKey(userKey: string) {
  return `${PREFIX}${userKey || 'anon'}`;
}

/** Local calendar day YYYY-MM-DD */
export function trueFalseTodayKey(now = new Date()) {
  return now.toLocaleDateString('en-CA');
}

export function readTrueFalseDailyRecord(userKey: string): TrueFalseDailyRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(userKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const r = parsed as TrueFalseDailyRecord;
    if (typeof r.date !== 'string' || typeof r.won !== 'boolean') return null;
    return r;
  } catch {
    return null;
  }
}

export function saveTrueFalseDailyAttempt(userKey: string, won: boolean) {
  if (typeof window === 'undefined') return;
  const record: TrueFalseDailyRecord = { date: trueFalseTodayKey(), won };
  try {
    localStorage.setItem(storageKey(userKey), JSON.stringify(record));
  } catch {
    /* quota */
  }
}

export function canPlayTrueFalseToday(userKey: string, now = new Date()): boolean {
  const row = readTrueFalseDailyRecord(userKey);
  if (!row) return true;
  return row.date !== trueFalseTodayKey(now);
}

export function trueFalseDailyStatus(userKey: string, now = new Date()) {
  const row = readTrueFalseDailyRecord(userKey);
  const today = trueFalseTodayKey(now);
  if (!row || row.date !== today) {
    return { canPlay: true as const, playedToday: false as const, wonToday: false as const };
  }
  return {
    canPlay: false as const,
    playedToday: true as const,
    wonToday: row.won,
  };
}

export function trueFalseUserKey(initData: string | null | undefined) {
  return resolvePaymentActivityUserKey(initData);
}

export function trueFalseRetryMessage(now = new Date()) {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const label = tomorrow.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  return `Try again on ${label}.`;
}
