'use client';

import { useMemo, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';

const PAY_ITEMS = [
  { id: 'income-tax', label: 'Income tax', emoji: '🧾' },
  { id: 'vat', label: 'VAT', emoji: '📊' },
  { id: 'paye', label: 'PAYE', emoji: '💼' },
  { id: 'customs', label: 'Customs / import', emoji: '🚢' },
  { id: 'ntr', label: 'Non-tax revenue (NTR)', emoji: '🏛️' },
  { id: 'motor', label: 'Motor vehicle fees', emoji: '🚗' },
] as const;

type Props = { onClose: () => void };

export default function PayAgainstPrnPopup({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const [itemId, setItemId] = useState<string | null>(null);
  const [prn, setPrn] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [refCode, setRefCode] = useState('');

  const selected = useMemo(() => PAY_ITEMS.find((x) => x.id === itemId) ?? null, [itemId]);

  const close = () => {
    triggerHapticFeedback(window);
    onClose();
  };

  const confirmPay = async () => {
    if (!itemId || prn.trim().length < 6) return;
    setBusy(true);
    triggerHapticFeedback(window);
    await new Promise((r) => setTimeout(r, 900));
    setRefCode(`SIM-${Date.now().toString().slice(-8)}`);
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
            <p className="text-sm font-extrabold text-white">Pay against PRN</p>
            <p className="text-[11px] text-[#f3ba2f]">Simulated · step {Math.min(step + 1, 3)}/3</p>
          </div>
          <button type="button" onClick={close} className="rounded-xl border border-[#8bb4ef]/40 px-3 py-1.5 text-sm font-semibold text-blue-50">
            Close
          </button>
        </div>

        <div className="p-4 space-y-3">
          {done ? (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-50 px-3 py-4 text-center space-y-2">
              <p className="text-2xl" aria-hidden>
                ✅
              </p>
              <p className="text-sm font-extrabold text-[#123f78]">Payment successful</p>
              <p className="text-xs text-[#335f97]">
                {selected?.label} · PRN {prn.trim()}
                {amount ? ` · UGX ${Number(amount).toLocaleString('en-UG')}` : ''}
              </p>
              <p className="text-[11px] font-mono text-[#123f78]">Ref {refCode}</p>
              <p className="text-[10px] text-[#5a7bb0]">Simulation complete — no real funds moved.</p>
              <button
                type="button"
                onClick={close}
                className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
              >
                Done
              </button>
            </div>
          ) : null}

          {!done && step === 0 ? (
            <>
              <p className="text-sm font-bold text-[#123f78]">Select what you are paying</p>
              <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto">
                {PAY_ITEMS.map((item) => (
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
                disabled={!itemId}
                onClick={() => {
                  triggerHapticFeedback(window);
                  setStep(1);
                }}
                className="w-full rounded-xl bg-[#123f78] py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                Next
              </button>
            </>
          ) : null}

          {!done && step === 1 ? (
            <>
              <p className="text-sm font-bold text-[#123f78]">Enter PRN details</p>
              <p className="text-xs text-[#335f97]">Paying: {selected?.label}</p>
              <label className="block">
                <span className="text-[11px] font-semibold text-[#5a7bb0] uppercase">PRN *</span>
                <input
                  value={prn}
                  onChange={(e) => setPrn(e.target.value.replace(/\s/g, ''))}
                  placeholder="e.g. 22400XXXXXX"
                  className="mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm font-semibold text-[#123f78]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-[#5a7bb0] uppercase">Amount (UGX) optional</span>
                <input
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="e.g. 150000"
                  className="mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm font-semibold text-[#123f78]"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex-1 rounded-xl border border-[#8bb4ef]/50 py-2.5 text-sm font-bold text-[#123f78]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={prn.trim().length < 6}
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setStep(2);
                  }}
                  className="flex-1 rounded-xl bg-[#123f78] py-2.5 text-sm font-bold text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          ) : null}

          {!done && step === 2 ? (
            <>
              <p className="text-sm font-bold text-[#123f78]">Confirm payment</p>
              <div className="rounded-xl border border-[#8bb4ef]/40 bg-white px-3 py-3 space-y-1 text-sm">
                <p className="text-[#335f97]">
                  Item: <span className="font-bold text-[#123f78]">{selected?.label}</span>
                </p>
                <p className="text-[#335f97]">
                  PRN: <span className="font-bold text-[#123f78]">{prn.trim()}</span>
                </p>
                {amount ? (
                  <p className="text-[#335f97]">
                    Amount:{' '}
                    <span className="font-bold text-[#123f78]">
                      UGX {Number(amount).toLocaleString('en-UG')}
                    </span>
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-[#8bb4ef]/50 py-2.5 text-sm font-bold text-[#123f78]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void confirmPay()}
                  className="flex-1 rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-50"
                >
                  {busy ? 'Paying…' : 'Confirm pay'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
