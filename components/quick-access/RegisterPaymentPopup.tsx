'use client';

import { useMemo, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import SimulatedReceipt, { type SimulatedReceiptData } from '@/components/quick-access/SimulatedReceipt';
import {
  PRN_PAY_ITEMS,
  prnRegistryUserKey,
  saveRegisteredPrn,
} from '@/utils/prn-registry';

const TAX_YEARS = ['2026', '2025', '2024', '2023'] as const;

const PERIODS = [
  'Annual',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'Q1',
  'Q2',
  'Q3',
  'Q4',
] as const;

const PAYMENT_REASONS = [
  'Return payment',
  'Audit assessment',
  'Penalty',
  'Interest',
  'Voluntary disclosure',
  'Other',
] as const;

const fieldClass =
  'mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm text-[#123f78]';

type Props = { onClose: () => void };

export default function RegisterPaymentPopup({ onClose }: Props) {
  const { userTelegramInitData } = useGameStore();
  const [step, setStep] = useState(0);
  const [itemId, setItemId] = useState<string>(PRN_PAY_ITEMS[0].id);
  const [tin, setTin] = useState('');
  const [taxpayerName, setTaxpayerName] = useState('');
  const [taxYear, setTaxYear] = useState<(typeof TAX_YEARS)[number]>(TAX_YEARS[0]);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('Annual');
  const [reason, setReason] = useState<(typeof PAYMENT_REASONS)[number]>(PAYMENT_REASONS[0]);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [prn, setPrn] = useState('');
  const [refCode, setRefCode] = useState('');
  const [issuedAt, setIssuedAt] = useState<Date | null>(null);

  const selected = useMemo(() => PRN_PAY_ITEMS.find((x) => x.id === itemId) ?? PRN_PAY_ITEMS[0], [itemId]);

  const close = () => {
    triggerHapticFeedback(window);
    onClose();
  };

  const generate = async () => {
    if (tin.trim().length < 6 || taxpayerName.trim().length < 2 || !amount.trim()) return;
    setBusy(true);
    triggerHapticFeedback(window);
    await new Promise((r) => setTimeout(r, 800));
    const now = new Date();
    const nextPrn = `PRN${Date.now().toString().slice(-10)}`;
    const nextRef = `SLIP-${Date.now().toString().slice(-8)}`;
    const userKey = prnRegistryUserKey(userTelegramInitData);
    saveRegisteredPrn(userKey, {
      prn: nextPrn,
      itemId: selected.id,
      itemLabel: selected.label,
      tin: tin.trim(),
      taxpayerName: taxpayerName.trim(),
      taxYear,
      period,
      reason,
      amountUgx: Number(amount),
    });
    setPrn(nextPrn);
    setRefCode(nextRef);
    setIssuedAt(now);
    setDone(true);
    setBusy(false);
  };

  const receipt: SimulatedReceiptData | null = useMemo(() => {
    if (!done || !prn || !refCode) return null;
    return {
      kind: 'prn-slip',
      title: 'PRN generated',
      subtitle: 'Payment registration slip',
      refCode,
      issuedAt: issuedAt ?? undefined,
      fields: [
        { label: 'Payment for', value: selected.label },
        { label: 'Taxpayer', value: taxpayerName.trim() },
        { label: 'TIN', value: tin.trim() },
        { label: 'Period', value: `${period} ${taxYear}` },
        { label: 'Reason', value: reason },
        { label: 'Amount', value: `UGX ${Number(amount).toLocaleString('en-UG')}` },
        { label: 'PRN', value: prn },
        { label: 'Status', value: 'Unpaid — use Pay against PRN' },
      ],
    };
  }, [done, prn, refCode, selected.label, taxpayerName, tin, period, taxYear, reason, amount, issuedAt]);

  const taxStepLabel = done ? null : step === 0 ? '1/2' : '2/2';

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
            <p className="text-sm font-extrabold text-white">Register new payment</p>
            <p className="text-[11px] text-[#f3ba2f]">
              {done ? 'Simulated · PRN ready' : `Simulated · step ${taxStepLabel}`}
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
          ) : step === 0 ? (
            <>
              <p className="text-sm font-bold text-[#123f78]">Select what you are registering</p>
              <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto">
                {PRN_PAY_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setItemId(item.id);
                    }}
                    className={`rounded-xl border px-2.5 py-3 text-left ${
                      itemId === item.id
                        ? 'border-[#f3ba2f] bg-[#f3ba2f]/20'
                        : 'border-[#8bb4ef]/40 bg-white'
                    }`}
                  >
                    <span className="text-lg" aria-hidden>
                      {item.emoji}
                    </span>
                    <p className="mt-1 text-xs font-bold text-[#123f78] leading-snug">{item.label}</p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setStep(1);
                }}
                className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-[#123f78]">Payment registration</p>
              <p className="text-[11px] text-[#5a7bb0] leading-snug">
                Simplified from URA payment slip registration. Tax type: {selected.label}.
              </p>
              <label className="block text-xs font-semibold text-[#123f78]">
                TIN
                <input
                  value={tin}
                  onChange={(e) => setTin(e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  placeholder="Enter TIN"
                  className={fieldClass}
                />
              </label>
              <label className="block text-xs font-semibold text-[#123f78]">
                Taxpayer name
                <input
                  value={taxpayerName}
                  onChange={(e) => setTaxpayerName(e.target.value)}
                  placeholder="Name on the TIN"
                  className={fieldClass}
                />
              </label>
              <label className="block text-xs font-semibold text-[#123f78]">
                Tax year
                <select
                  value={taxYear}
                  onChange={(e) => setTaxYear(e.target.value as (typeof TAX_YEARS)[number])}
                  className={fieldClass}
                >
                  {TAX_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-[#123f78]">
                Period
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as (typeof PERIODS)[number])}
                  className={fieldClass}
                >
                  {PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-[#123f78]">
                Reason for payment
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as (typeof PAYMENT_REASONS)[number])}
                  className={fieldClass}
                >
                  {PAYMENT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-[#123f78]">
                Amount (UGX)
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  placeholder="e.g. 50000"
                  className={fieldClass}
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setStep(0);
                  }}
                  className="flex-1 rounded-xl border border-[#8bb4ef]/50 py-2.5 text-sm font-bold text-[#123f78]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={
                    busy || tin.trim().length < 6 || taxpayerName.trim().length < 2 || !amount
                  }
                  onClick={() => void generate()}
                  className="flex-[2] rounded-xl bg-[#123f78] py-2.5 text-sm font-extrabold text-white disabled:opacity-50"
                >
                  {busy ? 'Generating…' : 'Generate PRN'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
