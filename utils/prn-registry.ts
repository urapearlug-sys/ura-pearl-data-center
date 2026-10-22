import { resolvePaymentActivityUserKey } from '@/utils/payment-activity-storage';

export type RegisteredPrn = {
  prn: string;
  itemId: string;
  itemLabel: string;
  tin: string;
  taxpayerName?: string;
  taxHeadCategory?: string;
  taxHead?: string;
  district?: string;
  basisOfPayment?: string;
  taxYear?: string;
  period?: string;
  /** @deprecated use basisOfPayment */
  reason?: string;
  otherNtrMda?: string;
  currency?: string;
  amountUgx: number;
  status: 'unpaid' | 'paid';
  createdAt: string;
  paidAt?: string;
  payRef?: string;
  paymentMethod?: string;
};

const PREFIX = 'ura:prn-registry:';
const MAX = 100;

function key(userKey: string) {
  return `${PREFIX}${userKey || 'anon'}`;
}

export function prnRegistryUserKey(initData: string | null | undefined) {
  return resolvePaymentActivityUserKey(initData);
}

export function readRegisteredPrns(userKey: string): RegisteredPrn[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key(userKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is RegisteredPrn => {
      if (!x || typeof x !== 'object') return false;
      const r = x as RegisteredPrn;
      return typeof r.prn === 'string' && typeof r.itemLabel === 'string' && typeof r.amountUgx === 'number';
    });
  } catch {
    return [];
  }
}

function writeRegisteredPrns(userKey: string, items: RegisteredPrn[]) {
  try {
    localStorage.setItem(key(userKey), JSON.stringify(items.slice(0, MAX)));
  } catch {
    /* quota */
  }
}

export function normalizePrnInput(raw: string) {
  return raw.replace(/\s/g, '').toUpperCase();
}

export function lookupRegisteredPrn(userKey: string, prnRaw: string): RegisteredPrn | null {
  const prn = normalizePrnInput(prnRaw);
  if (!prn) return null;
  return readRegisteredPrns(userKey).find((x) => normalizePrnInput(x.prn) === prn) ?? null;
}

export function saveRegisteredPrn(
  userKey: string,
  entry: Omit<RegisteredPrn, 'status' | 'createdAt'> & { status?: RegisteredPrn['status'] }
): RegisteredPrn {
  const item: RegisteredPrn = {
    ...entry,
    prn: normalizePrnInput(entry.prn),
    status: entry.status ?? 'unpaid',
    createdAt: new Date().toISOString(),
  };
  const prev = readRegisteredPrns(userKey).filter((x) => normalizePrnInput(x.prn) !== item.prn);
  writeRegisteredPrns(userKey, [item, ...prev]);
  return item;
}

export function markRegisteredPrnPaid(
  userKey: string,
  prnRaw: string,
  payRef: string,
  paymentMethod?: string
): RegisteredPrn | null {
  const prn = normalizePrnInput(prnRaw);
  const items = readRegisteredPrns(userKey);
  const idx = items.findIndex((x) => normalizePrnInput(x.prn) === prn);
  if (idx < 0) return null;
  const updated: RegisteredPrn = {
    ...items[idx],
    status: 'paid',
    paidAt: new Date().toISOString(),
    payRef,
    paymentMethod: paymentMethod?.trim() || items[idx].paymentMethod,
  };
  const next = [...items];
  next[idx] = updated;
  writeRegisteredPrns(userKey, next);
  return updated;
}

/** Shared payment-purpose options (Register new payment). */
export const PRN_PAY_ITEMS = [
  { id: 'income-tax', label: 'Income tax', emoji: '🧾' },
  { id: 'vat', label: 'VAT', emoji: '📊' },
  { id: 'paye', label: 'PAYE', emoji: '💼' },
  { id: 'withholding', label: 'Withholding tax', emoji: '📋' },
  { id: 'customs', label: 'Customs / import', emoji: '🚢' },
  { id: 'stamp', label: 'Stamp duty', emoji: '📜' },
  { id: 'motor', label: 'Motor vehicle', emoji: '🚗' },
  { id: 'ntr', label: 'Other NTR', emoji: '🏛️' },
  { id: 'penalties', label: 'Penalties', emoji: '⚠️' },
] as const;
