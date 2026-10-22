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

type Props = { onClose: () => void };

export default function PayAgainstPrnPopup({ onClose }: Props) {
  const { userTelegramInitData } = useGameStore();
  const userKey = useMemo(() => prnRegistryUserKey(userTelegramInitData), [userTelegramInitData]);

  const [prnInput, setPrnInput] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [found, setFound] = useState<RegisteredPrn | null>(null);
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
  };

  const confirmPay = async () => {
    if (!found) return;
    setBusy(true);
    triggerHapticFeedback(window);
    await new Promise((r) => setTimeout(r, 900));
    const payRef = `PAY-${Date.now().toString().slice(-8)}`;
    markRegisteredPrnPaid(userKey, found.prn, payRef);
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
        { label: 'TIN', value: found.tin },
        { label: 'PRN', value: found.prn },
        { label: 'Amount paid', value: `UGX ${found.amountUgx.toLocaleString('en-UG')}` },
        { label: 'Status', value: 'Paid (simulated)' },
      ],
    };
  }, [done, refCode, found, issuedAt]);

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
        className="w-full max-w-md rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#f4f8ff] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3.5 py-3 bg-[#123f78]">
          <div>
            <p className="text-sm font-extrabold text-white">Pay against PRN</p>
            <p className="text-[11px] text-[#f3ba2f]">
              {done ? 'Simulated · receipt ready' : found ? 'Confirm payment' : 'Enter a registered PRN'}
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

        <div className="p-4 space-y-3">
          {done && receipt ? (
            <SimulatedReceipt data={receipt} onDone={close} />
          ) : !found ? (
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
          ) : (
            <>
              <p className="text-sm font-bold text-[#123f78]">PRN details</p>
              <div className="rounded-xl border border-[#8bb4ef]/40 bg-white px-3 py-3 space-y-1.5 text-sm">
                <p className="text-[#335f97]">
                  PRN: <span className="font-mono font-bold text-[#123f78]">{found.prn}</span>
                </p>
                <p className="text-[#335f97]">
                  Payment for: <span className="font-bold text-[#123f78]">{found.itemLabel}</span>
                </p>
                <p className="text-[#335f97]">
                  TIN: <span className="font-bold text-[#123f78]">{found.tin}</span>
                </p>
                <p className="text-[#335f97]">
                  Amount due:{' '}
                  <span className="font-bold text-[#123f78]">
                    UGX {found.amountUgx.toLocaleString('en-UG')}
                  </span>
                </p>
                <p className="text-[#335f97]">
                  Status: <span className="font-bold text-amber-700">Unpaid</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setFound(null);
                    setLookupError(null);
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
                  {busy ? 'Paying…' : 'Confirm pay'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
