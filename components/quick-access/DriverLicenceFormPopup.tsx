'use client';

import { useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';

type Props = { onClose: () => void };

const LICENCE_TYPES = [
  { id: 'new-other-3', label: 'New licence — other groups (3 yrs)', amount: 150000 },
  { id: 'new-moto-3', label: 'New licence — motorcycle (3 yrs)', amount: 80000 },
  { id: 'renew-other-3', label: 'Renew — other groups (3 yrs)', amount: 120000 },
  { id: 'learner', label: 'Learner / provisional', amount: 50000 },
] as const;

type LicenceTypeId = (typeof LICENCE_TYPES)[number]['id'];

export default function DriverLicenceFormPopup({ onClose }: Props) {
  const showToast = useToast();
  const { userTelegramInitData } = useGameStore();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [tin, setTin] = useState('');
  const [idType, setIdType] = useState('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [licenceType, setLicenceType] = useState<LicenceTypeId>(LICENCE_TYPES[0].id);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const selected = LICENCE_TYPES.find((x) => x.id === licenceType) ?? LICENCE_TYPES[0];

  const close = () => {
    triggerHapticFeedback(window);
    onClose();
  };

  const submit = async () => {
    setBusy(true);
    triggerHapticFeedback(window);
    try {
      // Simulate processing then submit to admin inbox
      await new Promise((r) => setTimeout(r, 700));
      const res = await fetch('/api/driver-licence-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          tin: tin.trim() || null,
          idType,
          idNumber: idNumber.trim(),
          licenceType: selected.label,
          years: selected.id.includes('3') ? 3 : 1,
          amountUgx: selected.amount,
          initData: userTelegramInitData || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Submit failed');
      setDone(true);
      showToast('Application submitted to admin', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not submit', 'error');
    } finally {
      setBusy(false);
    }
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
            <p className="text-sm font-extrabold text-white">Pay driver&apos;s licence</p>
            <p className="text-[11px] text-[#f3ba2f]">Short form · step {step + 1}/2</p>
          </div>
          <button type="button" onClick={close} className="rounded-xl border border-[#8bb4ef]/40 px-3 py-1.5 text-sm font-semibold text-blue-50">
            Close
          </button>
        </div>

        <div className="p-4 space-y-3">
          {done ? (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-50 px-3 py-4 text-center space-y-2">
              <p className="text-2xl">✅</p>
              <p className="text-sm font-extrabold text-[#123f78]">Submitted successfully</p>
              <p className="text-xs text-[#335f97]">
                {selected.label} · UGX {selected.amount.toLocaleString('en-UG')} (simulated)
              </p>
              <p className="text-[10px] text-[#5a7bb0]">Admin can review this under Driver licence applications.</p>
              <button type="button" onClick={close} className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]">
                Done
              </button>
            </div>
          ) : null}

          {!done && step === 0 ? (
            <>
              <label className="block">
                <span className="text-[11px] font-semibold text-[#5a7bb0] uppercase">Full name *</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm font-semibold text-[#123f78]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-[#5a7bb0] uppercase">Phone *</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="07XXXXXXXX"
                  className="mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm font-semibold text-[#123f78]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-[#5a7bb0] uppercase">TIN (optional)</span>
                <input
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm font-semibold text-[#123f78]"
                />
              </label>
              <button
                type="button"
                disabled={fullName.trim().length < 2 || phone.trim().length < 9}
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
              <label className="block">
                <span className="text-[11px] font-semibold text-[#5a7bb0] uppercase">ID type</span>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm font-semibold text-[#123f78]"
                >
                  <option>National ID</option>
                  <option>Passport</option>
                  <option>Driving permit</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-[#5a7bb0] uppercase">ID number *</span>
                <input
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm font-semibold text-[#123f78]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-[#5a7bb0] uppercase">Licence product *</span>
                <select
                  value={licenceType}
                  onChange={(e) => setLicenceType(e.target.value as LicenceTypeId)}
                  className="mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm font-semibold text-[#123f78]"
                >
                  {LICENCE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} — UGX {t.amount.toLocaleString('en-UG')}
                    </option>
                  ))}
                </select>
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
                  disabled={busy || idNumber.trim().length < 3}
                  onClick={() => void submit()}
                  className="flex-1 rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-40"
                >
                  {busy ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
