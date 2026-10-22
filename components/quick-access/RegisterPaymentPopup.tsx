'use client';

import { useCallback, useMemo, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import SimulatedReceipt, { type SimulatedReceiptData } from '@/components/quick-access/SimulatedReceipt';
import {
  PRN_PAY_ITEMS,
  prnRegistryUserKey,
  saveRegisteredPrn,
} from '@/utils/prn-registry';
import {
  registrationPresetForPayItem,
  taxHeadsForCategory,
  URA_BASIS_OF_PAYMENT,
  URA_CURRENCY_TYPES,
  URA_DISTRICTS,
  URA_NTR_TAX_HEADS,
  URA_OTHER_NTR_MDA,
  URA_TAX_HEAD_CATEGORIES,
  type UraBasisOfPayment,
  type UraTaxHeadCategoryId,
} from '@/utils/ura-payment-registration';

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

const fieldClass =
  'mt-1 w-full rounded-xl border border-[#8bb4ef]/50 bg-white px-3 py-2.5 text-sm text-[#123f78]';

type Props = {
  onClose: () => void;
  onPayPrn?: (prn: string) => void;
};

export default function RegisterPaymentPopup({ onClose, onPayPrn }: Props) {
  const { userTelegramInitData } = useGameStore();
  const [step, setStep] = useState(0);
  const [itemId, setItemId] = useState<string>(PRN_PAY_ITEMS[0].id);
  const [taxHeadCategory, setTaxHeadCategory] = useState<UraTaxHeadCategoryId>('ntr-tax-type');
  const [taxHead, setTaxHead] = useState<string>(URA_NTR_TAX_HEADS[5]);
  const [tin, setTin] = useState('');
  const [taxpayerName, setTaxpayerName] = useState('');
  const [district, setDistrict] = useState<(typeof URA_DISTRICTS)[number]>('KAMPALA');
  const [taxYear, setTaxYear] = useState<(typeof TAX_YEARS)[number]>(TAX_YEARS[0]);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('Annual');
  const [basisOfPayment, setBasisOfPayment] = useState<UraBasisOfPayment>(URA_BASIS_OF_PAYMENT[0]);
  const [otherNtrMda, setOtherNtrMda] = useState<(typeof URA_OTHER_NTR_MDA)[number]>(
    URA_OTHER_NTR_MDA[0]
  );
  const [currency, setCurrency] = useState<(typeof URA_CURRENCY_TYPES)[number]>('UGANDA SHILLINGS');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [prn, setPrn] = useState('');
  const [refCode, setRefCode] = useState('');
  const [issuedAt, setIssuedAt] = useState<Date | null>(null);

  const selected = useMemo(() => PRN_PAY_ITEMS.find((x) => x.id === itemId) ?? PRN_PAY_ITEMS[0], [itemId]);

  const taxHeadOptions = useMemo(() => taxHeadsForCategory(taxHeadCategory), [taxHeadCategory]);

  const applyPresetFromItem = useCallback((id: string) => {
    const preset = registrationPresetForPayItem(id);
    setTaxHeadCategory(preset.taxHeadCategory);
    setTaxHead(preset.taxHead || taxHeadsForCategory(preset.taxHeadCategory)[0] || '');
    setBasisOfPayment(preset.basisOfPayment);
    if ((PERIODS as readonly string[]).includes(preset.period)) {
      setPeriod(preset.period as (typeof PERIODS)[number]);
    }
  }, []);

  const close = () => {
    triggerHapticFeedback(window);
    onClose();
  };

  const goToRegistrationStep = () => {
    triggerHapticFeedback(window);
    applyPresetFromItem(itemId);
    setStep(1);
  };

  const onTaxHeadCategoryChange = (next: UraTaxHeadCategoryId) => {
    setTaxHeadCategory(next);
    const heads = taxHeadsForCategory(next);
    setTaxHead(heads[0] ?? '');
  };

  const generate = async () => {
    const head = taxHead.trim();
    if (tin.trim().length < 6 || taxpayerName.trim().length < 2 || !amount.trim()) return;
    if (taxHeadCategory === 'ntr-tax-type' && !head) return;
    setBusy(true);
    triggerHapticFeedback(window);
    await new Promise((r) => setTimeout(r, 800));
    const now = new Date();
    const nextPrn = `PRN${Date.now().toString().slice(-10)}`;
    const nextRef = `SLIP-${Date.now().toString().slice(-8)}`;
    const userKey = prnRegistryUserKey(userTelegramInitData);
    const paymentLabel = head || selected.label;
    saveRegisteredPrn(userKey, {
      prn: nextPrn,
      itemId: selected.id,
      itemLabel: paymentLabel,
      tin: tin.trim(),
      taxpayerName: taxpayerName.trim(),
      taxHeadCategory: URA_TAX_HEAD_CATEGORIES.find((c) => c.id === taxHeadCategory)?.label,
      taxHead: head || undefined,
      district,
      basisOfPayment,
      reason: basisOfPayment,
      taxYear,
      period,
      otherNtrMda: taxHeadCategory === 'other-ntr' ? otherNtrMda : undefined,
      currency,
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
    const head = taxHead.trim() || selected.label;
    return {
      kind: 'prn-slip',
      title: 'PRN generated',
      subtitle: 'Payment registration slip',
      refCode,
      issuedAt: issuedAt ?? undefined,
      fields: [
        { label: 'Tax head', value: head },
        { label: 'Category', value: selected.label },
        { label: 'Taxpayer', value: taxpayerName.trim() },
        { label: 'TIN', value: tin.trim() },
        { label: 'District', value: district },
        { label: 'Period', value: `${period} ${taxYear}` },
        { label: 'Basis of payment', value: basisOfPayment },
        ...(taxHeadCategory === 'other-ntr' ? [{ label: 'MDA', value: otherNtrMda }] : []),
        { label: 'Currency', value: currency },
        { label: 'Amount', value: `UGX ${Number(amount).toLocaleString('en-UG')}` },
        { label: 'PRN', value: prn },
        { label: 'Status', value: 'Unpaid — use Pay against PRN' },
      ],
    };
  }, [
    done,
    prn,
    refCode,
    selected.label,
    taxHead,
    taxpayerName,
    tin,
    district,
    period,
    taxYear,
    basisOfPayment,
    taxHeadCategory,
    otherNtrMda,
    currency,
    amount,
    issuedAt,
  ]);

  const taxStepLabel = done ? null : step === 0 ? '1/2' : '2/2';

  const canGenerate =
    tin.trim().length >= 6 &&
    taxpayerName.trim().length >= 2 &&
    amount.trim().length > 0 &&
    (taxHeadCategory !== 'ntr-tax-type' || taxHead.trim().length > 0);

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
            <SimulatedReceipt
              data={receipt}
              onDone={close}
              onPayPrn={
                onPayPrn
                  ? (registeredPrn) => {
                      triggerHapticFeedback(window);
                      onPayPrn(registeredPrn);
                    }
                  : undefined
              }
            />
          ) : step === 0 ? (
            <>
              <p className="text-sm font-bold text-[#123f78]">Select what you are registering</p>
              <p className="text-[11px] text-[#5a7bb0] leading-snug">
                Matches URA payment registration categories. The next step pre-fills Tax Head and basis of payment.
              </p>
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
                onClick={goToRegistrationStep}
                className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-[#123f78]">Payment registration</p>
              <p className="text-[11px] text-[#5a7bb0] leading-snug">
                Simplified from{' '}
                <span className="font-semibold">URA Generate a payment slip</span>. Pre-filled from:{' '}
                {selected.label}.
              </p>

              <label className="block text-xs font-semibold text-[#123f78]">
                Tax head category *
                <select
                  value={taxHeadCategory}
                  onChange={(e) => onTaxHeadCategoryChange(e.target.value as UraTaxHeadCategoryId)}
                  className={fieldClass}
                >
                  {URA_TAX_HEAD_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              {taxHeadCategory === 'other-ntr' ? (
                <label className="block text-xs font-semibold text-[#123f78]">
                  Ministry / Department / Agency *
                  <select
                    value={otherNtrMda}
                    onChange={(e) =>
                      setOtherNtrMda(e.target.value as (typeof URA_OTHER_NTR_MDA)[number])
                    }
                    className={fieldClass}
                  >
                    {URA_OTHER_NTR_MDA.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="block text-xs font-semibold text-[#123f78]">
                Tax head *
                <select
                  value={taxHead}
                  onChange={(e) => setTaxHead(e.target.value)}
                  className={fieldClass}
                  disabled={taxHeadCategory === 'penalties'}
                >
                  <option value="">--Select--</option>
                  {taxHeadOptions.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>

              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#5a7bb0]">
                Taxpayer details
              </p>
              <label className="block text-xs font-semibold text-[#123f78]">
                TIN *
                <input
                  value={tin}
                  onChange={(e) => setTin(e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  placeholder="Enter TIN"
                  className={fieldClass}
                />
              </label>
              <label className="block text-xs font-semibold text-[#123f78]">
                Taxpayer name *
                <input
                  value={taxpayerName}
                  onChange={(e) => setTaxpayerName(e.target.value)}
                  placeholder="Name on the TIN"
                  className={fieldClass}
                />
              </label>
              <label className="block text-xs font-semibold text-[#123f78]">
                District / City *
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as (typeof URA_DISTRICTS)[number])}
                  className={fieldClass}
                >
                  <option value="">--Select--</option>
                  {URA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#5a7bb0]">
                Period selection
              </p>
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
                Period *
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
                Basis of payment *
                <select
                  value={basisOfPayment}
                  onChange={(e) => setBasisOfPayment(e.target.value as UraBasisOfPayment)}
                  className={fieldClass}
                >
                  <option value="">--Select--</option>
                  {URA_BASIS_OF_PAYMENT.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>

              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#5a7bb0]">
                Payment details
              </p>
              <label className="block text-xs font-semibold text-[#123f78]">
                Currency
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as (typeof URA_CURRENCY_TYPES)[number])}
                  className={fieldClass}
                >
                  {URA_CURRENCY_TYPES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-[#123f78]">
                Amount (whole UGX, no commas) *
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
                  disabled={busy || !canGenerate}
                  onClick={() => void generate()}
                  className="flex-[2] rounded-xl bg-[#123f78] py-2.5 text-sm font-extrabold text-white disabled:opacity-50"
                >
                  {busy ? 'Generating…' : 'Accept and register'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
