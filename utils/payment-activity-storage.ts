import type { ReceiptField, SimulatedReceiptKind } from '@/utils/simulated-receipt';

export type StoredPaymentActivity = {
  id: string;
  kind: SimulatedReceiptKind;
  title: string;
  subtitle: string;
  fields: ReceiptField[];
  refCode: string;
  issuedAt: string;
};

const STORAGE_PREFIX = 'ura:payment-activities:';
const MAX_ITEMS = 80;

function storageKey(userKey: string) {
  return `${STORAGE_PREFIX}${userKey || 'anon'}`;
}

export function resolvePaymentActivityUserKey(initData: string | null | undefined): string {
  if (!initData) return 'anon';
  try {
    const rawUser = new URLSearchParams(initData).get('user');
    if (!rawUser) return 'anon';
    const parsed = JSON.parse(decodeURIComponent(rawUser)) as { id?: string | number };
    return parsed?.id != null ? String(parsed.id) : 'anon';
  } catch {
    return 'anon';
  }
}

export function readPaymentActivities(userKey: string): StoredPaymentActivity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(userKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is StoredPaymentActivity => {
        if (!x || typeof x !== 'object') return false;
        const r = x as StoredPaymentActivity;
        return typeof r.id === 'string' && typeof r.refCode === 'string' && Array.isArray(r.fields);
      })
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function savePaymentActivity(
  userKey: string,
  activity: Omit<StoredPaymentActivity, 'id'> & { id?: string }
): StoredPaymentActivity {
  const item: StoredPaymentActivity = {
    ...activity,
    id: activity.id || `pa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  const prev = readPaymentActivities(userKey).filter((x) => x.refCode !== item.refCode);
  const next = [item, ...prev].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(storageKey(userKey), JSON.stringify(next));
  } catch {
    /* quota */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ura-payment-activities-changed'));
  }
  return item;
}

export function paymentActivityCounts(items: StoredPaymentActivity[]) {
  const prnSlips = items.filter((x) => x.kind === 'prn-slip').length;
  const payments = items.filter((x) => x.kind === 'payment').length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentWeek = items.filter((x) => {
    const t = Date.parse(x.issuedAt);
    return Number.isFinite(t) && t >= weekAgo;
  }).length;
  return {
    total: items.length,
    prnSlips,
    payments,
    recentWeek,
  };
}
