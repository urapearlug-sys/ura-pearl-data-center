'use client';

import { useMemo, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import SimulatedReceipt, { type SimulatedReceiptData } from '@/components/quick-access/SimulatedReceipt';
import {
  lookupRegisteredPrn,
  markRegisteredPrnPaid,
  normalizePrnInput,
  prnRegistryUserKey,
  type RegisteredPrn,
} from '@/utils/prn-registry';

const PAYMENT_OPTIONS = [
  'MTN Mobile Money',
  'Airtel Money',
  'Visa / Mastercard',
  'Stanbic Bank',
  'Centenary Bank',
  'DFCU Bank',
  'Equity Bank',
  'Absa Bank',
  'URA cash office',
] as const;

const fieldClass =
  'mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm text-[#123f78]';

type Stage = 'lookup' | 'details' | 'method';

type Props = { onClose: () => void };

function formatRegisteredAt(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-UG', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function PayAgainstPrnPopup({ onClose }: Props) {
  const { userTelegramInitData } = useGameStore();
  const userKey = useMemo(() => prnRegistryUserKey(userTelegramInitData), [userTelegramInitData]);

  const [prnInput, setPrnInput] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [found, setFound] = useState<RegisteredPrn | null>(null);
  const [stage, setStage] = useState<Stage>('lookup');
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_OPTIONS)[number]>(PAYMENT_OPTIONS[0]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [issuedAt, setIssuedAt] = useState<Date | null>(null);

  const close = () => {
    triggerHapticFeedback(window);
    onClose();
  };

  const lookup = () => {
    triggerHapticFeedback(window);
    setLookupError(null);
    setFound(null);
    const prn = normalizePrnInput(prnInput);
    if (prn.length < 6) {
      setLookupError('Enter a valid PRN (at least 6 characters).');
      return;
    }
    const row = lookupRegisteredPrn(userKey, prn);
    if (!row) {
      setLookupError(
        'Invalid PRN. Register a payment first under Register new payment, then use that PRN here.'
      );
      return;
    }
    if (row.status === 'paid') {
      setLookupError(`This PRN is already paid${row.payRef ? ` (ref ${row.payRef})` : ''}.`);
      return;
    }
    setFound(row);
    setStage('details');
  };

  const confirmPay = async () => {
    if (!found) return;
    setBusy(true);
    triggerHapticFeedback(window);
    await new Promise((r) => setTimeout(r, 900));
    const payRef = `PAY-${Date.now().toString().slice(-8)}`;
    markRegisteredPrnPaid(userKey, found.prn, payRef, paymentMethod);
    setRefCode(payRef);
    setIssuedAt(new Date());
    setDone(true);
    setBusy(false);
  };

  const receipt: SimulatedReceiptData | null = useMemo(() => {
    if (!done || !refCode || !found) return null;
    return {
      kind: 'payment',
      title: 'Payment successful',
      subtitle: 'Official-style simulated receipt',
      refCode,
      issuedAt: issuedAt ?? undefined,
      fields: [
        { label: 'Payment for', value: found.itemLabel },
        ...(found.taxpayerName ? [{ label: 'Taxpayer', value: found.taxpayerName }] : []),
        { label: 'TIN', value: found.tin },
        ...(found.period || found.taxYear
          ? [{ label: 'Period', value: [found.period, found.taxYear].filter(Boolean).join(' ') }]
          : []),
        ...(found.reason ? [{ label: 'Reason', value: found.reason }] : []),
        { label: 'PRN', value: found.prn },
        { label: 'Paid via', value: paymentMethod },
        { label: 'Amount paid', value: `UGX ${found.amountUgx.toLocaleString('en-UG')}` },
        { label: 'Status', value: 'Paid (simulated)' },
      ],
    };
  }, [done, refCode, found, issuedAt, paymentMethod]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#f4f8ff] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-3.5 py-3 bg-[#123f78]">
          <div>
            <p className="text-sm font-extrabold text-white">Pay against PRN</p>
            <p className="text-[11px] text-[#f3ba2f]">
              {done
                ? 'Simulated · receipt ready'
                : stage === 'method'
                  ? 'Choose payment option'
                  : stage === 'details'
                    ? 'Confirm payment'
                    : 'Enter a registered PRN'}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-[#8bb4ef]/40 px-3 py-1.5 text-sm font-semibold text-blue-50"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">
          {done && receipt ? (
            <SimulatedReceipt data={receipt} onDone={close} />
          ) : stage === 'lookup' || !found ? (
            <>
              <p className="text-sm font-bold text-[#123f78]">Enter PRN number</p>
              <p className="text-[11px] text-[#5a7bb0] leading-snug">
                Only PRNs created in <span className="font-semibold">Register new payment</span> are valid.
              </p>
              <label className="block">
                <span className="text-[11px] font-semibold text-[#5a7bb0] uppercase">PRN *</span>
                <input
                  value={prnInput}
                  onChange={(e) => {
                    setPrnInput(e.target.value.replace(/\s/g, ''));
                    setLookupError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      lookup();
                    }
                  }}
                  placeholder="Paste PRN from registration"
                  className="mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm font-semibold text-[#123f78] font-mono"
                  autoCapitalize="characters"
                  autoCorrect="off"
                />
              </label>
              {lookupError ? (
                <p className="text-[11px] text-rose-600 leading-snug rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-2">
                  {lookupError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={lookup}
                className="w-full rounded-xl bg-[#123f78] py-2.5 text-sm font-bold text-white"
              >
                Look up PRN
              </button>
            </>
          ) : stage === 'details' ? (
            <>
              <p className="text-sm font-bold text-[#123f78]">PRN details</p>
              <p className="text-[11px] text-[#5a7bb0] leading-snug">
                Fetched from the payment you registered.
              </p>
              <dl className="rounded-xl border border-[#8bb4ef]/40 bg-white divide-y divide-[#8bb4ef]/25 text-sm">
                {(
                  [
                    ['PRN', found.prn],
                    ['Payment for', found.itemLabel],
                    ['Taxpayer', found.taxpayerName || '—'],
                    ['TIN', found.tin],
                    ['Tax year', found.taxYear || '—'],
                    ['Period', found.period || '—'],
                    ['Reason for payment', found.reason || '—'],
                    ['Amount due', `UGX ${found.amountUgx.toLocaleString('en-UG')}`],
                    ['Registered', formatRegisteredAt(found.createdAt)],
                    ['Status', 'Unpaid'],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3 px-3 py-2">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#5a7bb0] shrink-0 pt-0.5">
                      {label}
                    </dt>
                    <dd
                      className={`text-right font-bold text-[#123f78] ${label === 'PRN' ? 'font-mono' : ''} ${
                        label === 'Status' ? 'text-amber-700' : ''
                      }`}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setFound(null);
                    setStage('lookup');
                    setLookupError(null);
                  }}
                  className="flex-1 rounded-xl border border-[#8bb4ef]/50 py-2.5 text-sm font-bold text-[#123f78]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setStage('method');
                  }}
                  className="flex-[2] rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-[#123f78]">Payment option</p>
              <p className="text-[11px] text-[#5a7bb0] leading-snug">
                Pay UGX {found.amountUgx.toLocaleString('en-UG')} for PRN{' '}
                <span className="font-mono font-semibold text-[#123f78]">{found.prn}</span>. Simulated — no real
                charge.
              </p>
              <label className="block text-xs font-semibold text-[#123f78]">
                How do you want to pay?
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as (typeof PAYMENT_OPTIONS)[number])}
                  className={fieldClass}
                >
                  {PAYMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setStage('details');
                  }}
                  className="flex-1 rounded-xl border border-[#8bb4ef]/50 py-2.5 text-sm font-bold text-[#123f78]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void confirmPay()}
                  className="flex-[2] rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-50"
                >
                  {busy ? 'Paying…' : 'Pay now'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
