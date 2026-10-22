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

type Props = { onClose: () => void };

export default function RegisterPaymentPopup({ onClose }: Props) {
  const { userTelegramInitData } = useGameStore();
  const [step, setStep] = useState(0);
  const [itemId, setItemId] = useState<string>(PRN_PAY_ITEMS[0].id);
  const [tin, setTin] = useState('');
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
    if (tin.trim().length < 6 || !amount.trim()) return;
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
        { label: 'TIN', value: tin.trim() },
        { label: 'Amount', value: `UGX ${Number(amount).toLocaleString('en-UG')}` },
        { label: 'PRN', value: prn },
        { label: 'Status', value: 'Unpaid — use Pay against PRN' },
      ],
    };
  }, [done, prn, refCode, selected.label, tin, amount, issuedAt]);

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
              <p className="text-xs text-[#335f97]">Registering: {selected.label}</p>
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
