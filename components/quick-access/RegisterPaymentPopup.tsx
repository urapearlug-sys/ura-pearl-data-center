'use client';

import { useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';

const TAX_TYPES = [
  { id: 'income', label: 'Income tax' },
  { id: 'vat', label: 'VAT' },
  { id: 'paye', label: 'PAYE' },
  { id: 'customs', label: 'Customs' },
] as const;

type TaxTypeId = (typeof TAX_TYPES)[number]['id'];

type Props = { onClose: () => void };

export default function RegisterPaymentPopup({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const [taxType, setTaxType] = useState<TaxTypeId>(TAX_TYPES[0].id);
  const [tin, setTin] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [prn, setPrn] = useState('');

  const close = () => {
    triggerHapticFeedback(window);
    onClose();
  };

  const generate = async () => {
    if (tin.trim().length < 6 || !amount.trim()) return;
    setBusy(true);
    triggerHapticFeedback(window);
    await new Promise((r) => setTimeout(r, 800));
    setPrn(`PRN-SIM-${Date.now().toString().slice(-10)}`);
    setDone(true);
    setBusy(false);
  };

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
            <p className="text-[11px] text-[#f3ba2f]">Simulated · step {Math.min(step + 1, 2)}/2</p>
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
          {done ? (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-50 px-3 py-4 text-center space-y-2">
              <p className="text-2xl" aria-hidden>
                ✅
              </p>
              <p className="text-sm font-extrabold text-[#123f78]">Payment slip generated</p>
              <p className="text-xs text-[#335f97]">
                {TAX_TYPES.find((t) => t.id === taxType)?.label} · TIN {tin.trim()}
              </p>
              <p className="text-sm font-mono font-bold text-[#123f78]">{prn}</p>
              <p className="text-[10px] text-[#5a7bb0]">Simulation — use Pay against PRN to practice payment.</p>
              <button
                type="button"
                onClick={close}
                className="mt-2 w-full rounded-xl bg-[#123f78] py-2.5 text-sm font-bold text-white"
              >
                Done
              </button>
            </div>
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
