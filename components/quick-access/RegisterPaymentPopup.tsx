'use client';

import { useMemo, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import SimulatedReceipt, { type SimulatedReceiptData } from '@/components/quick-access/SimulatedReceipt';

const TAX_TYPES = [
  { id: 'income', label: 'Income tax' },
  { id: 'vat', label: 'VAT' },
  { id: 'paye', label: 'PAYE' },
  { id: 'customs', label: 'Customs' },
] as const;

/** Official URA Motor Vehicle / tenure-related payments portal. */
const PAY_YOUR_TENURE_URL = 'https://ura.go.ug/en/domestic-taxes/motor-vehicle/';

type TaxTypeId = (typeof TAX_TYPES)[number]['id'];
type Flow = 'menu' | 'tax';

type Props = { onClose: () => void };

function openUraUrl(url: string) {
  if (typeof window === 'undefined') return;
  const tg = (
    window as unknown as {
      Telegram?: { WebApp?: { openLink?: (u: string, o?: { try_instant_view?: boolean }) => void } };
    }
  ).Telegram?.WebApp;
  if (tg?.openLink) tg.openLink(url, { try_instant_view: false });
  else window.open(url, '_blank', 'noopener,noreferrer');
}

export default function RegisterPaymentPopup({ onClose }: Props) {
  const [flow, setFlow] = useState<Flow>('menu');
  const [step, setStep] = useState(0);
  const [taxType, setTaxType] = useState<TaxTypeId>(TAX_TYPES[0].id);
  const [tin, setTin] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [prn, setPrn] = useState('');
  const [refCode, setRefCode] = useState('');
  const [issuedAt, setIssuedAt] = useState<Date | null>(null);

  const close = () => {
    triggerHapticFeedback(window);
    onClose();
  };

  const generate = async () => {
    if (tin.trim().length < 6 || !amount.trim()) return;
    setBusy(true);
    triggerHapticFeedback(window);
    await new Promise((r) => setTimeout(r, 800));
    const now = new Date();
    setPrn(`PRN-SIM-${Date.now().toString().slice(-10)}`);
    setRefCode(`SLIP-${Date.now().toString().slice(-8)}`);
    setIssuedAt(now);
    setDone(true);
    setBusy(false);
  };

  const receipt: SimulatedReceiptData | null = useMemo(() => {
    if (!done || !prn || !refCode) return null;
    const taxLabel = TAX_TYPES.find((t) => t.id === taxType)?.label ?? taxType;
    return {
      kind: 'prn-slip',
      title: 'PRN generated',
      subtitle: 'Payment registration slip',
      refCode,
      issuedAt: issuedAt ?? undefined,
      fields: [
        { label: 'Tax type', value: taxLabel },
        { label: 'TIN', value: tin.trim() },
        { label: 'Amount', value: `UGX ${Number(amount).toLocaleString('en-UG')}` },
        { label: 'PRN', value: prn },
        { label: 'Status', value: 'Registered (simulated)' },
      ],
    };
  }, [done, prn, refCode, taxType, tin, amount, issuedAt]);

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
        className="w-full max-w-md rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#f4f8ff] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3.5 py-3 bg-[#123f78]">
          <div>
            <p className="text-sm font-extrabold text-white">Register new payment</p>
            <p className="text-[11px] text-[#f3ba2f]">
              {flow === 'menu'
                ? 'Choose what to register'
                : done
                  ? 'Simulated · receipt ready'
                  : `Simulated · tax payment · step ${taxStepLabel}`}
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
          {flow === 'menu' ? (
            <>
              <p className="text-xs font-semibold text-[#123f78]">What do you want to register?</p>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setFlow('tax');
                  setStep(0);
                }}
                className="w-full rounded-xl border border-[#8bb4ef]/40 bg-white px-3 py-3 text-left hover:border-[#f3ba2f]/55 transition-colors flex items-center gap-3"
              >
                <span
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#cfe0ff] bg-[#f4f8ff] text-lg"
                  aria-hidden
                >
                  🎫
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-[#123f78]">Tax / PRN payment</span>
                  <span className="block text-[11px] text-[#5a7bb0] mt-0.5">
                    Income tax, VAT, PAYE, customs · in-app
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  openUraUrl(PAY_YOUR_TENURE_URL);
                  close();
                }}
                className="w-full rounded-xl border border-[#8bb4ef]/40 bg-white px-3 py-3 text-left hover:border-[#f3ba2f]/55 transition-colors flex items-center gap-3"
              >
                <span
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#cfe0ff] bg-[#f4f8ff] text-lg"
                  aria-hidden
                >
                  🏛️
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-[#123f78]">Pay your tenure</span>
                  <span className="block text-[11px] text-[#5a7bb0] mt-0.5">
                    Opens official URA motor vehicle site
                  </span>
                </span>
              </button>
            </>
          ) : done && receipt ? (
            <SimulatedReceipt data={receipt} onDone={close} />
          ) : step === 0 ? (
            <>
              <p className="text-xs font-semibold text-[#123f78]">Select tax type</p>
              <div className="grid grid-cols-2 gap-2">
                {TAX_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setTaxType(t.id);
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-left text-sm font-bold ${
                      taxType === t.id
                        ? 'border-[#f3ba2f] bg-[#123f78] text-white'
                        : 'border-[#8bb4ef]/40 bg-white text-[#123f78]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setFlow('menu');
                  }}
                  className="flex-1 rounded-xl border border-[#8bb4ef]/50 py-2.5 text-sm font-bold text-[#123f78]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setStep(1);
                  }}
                  className="flex-[2] rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <>
              <label className="block text-xs font-semibold text-[#123f78]">
                TIN
                <input
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  inputMode="numeric"
                  placeholder="Enter TIN"
                  className="mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm text-[#123f78]"
                />
              </label>
              <label className="block text-xs font-semibold text-[#123f78]">
                Amount (UGX)
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  placeholder="e.g. 50000"
                  className="mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm text-[#123f78]"
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
                  disabled={busy || tin.trim().length < 6 || !amount}
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
