'use client';

import { useEffect, useMemo, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import {
  calculateAdvanceMotorVehicleTax,
  calculateMotorVehicleImportTax,
  calculatePaye,
  calculateRentalTaxIndividuals,
  formatUgx,
  parseAmount,
  type AdvanceMvKind,
  type PayeResidence,
  URA_MAKE_PAYMENT_URL,
  URA_MV_OFFICIAL_CALC_URL,
  URA_PAY_PRN_URL,
  URA_TAX_CALC_URL,
} from '@/utils/ura-tax-calculators';

export type UraTaxCalcCategory =
  | 'mv-import'
  | 'paye'
  | 'rental'
  | 'advance-mv';

const TABS: { id: UraTaxCalcCategory; label: string; short: string; emoji: string }[] = [
  { id: 'mv-import', label: 'Motor Vehicle Import Tax', short: 'MV Import', emoji: '🚗' },
  { id: 'paye', label: 'PAYE', short: 'PAYE', emoji: '💼' },
  { id: 'rental', label: 'Rental Tax for Individuals', short: 'Rental', emoji: '🏠' },
  { id: 'advance-mv', label: 'Advance Motor Vehicle Tax', short: 'Advance MV', emoji: '🚐' },
];

type Props = {
  onClose: () => void;
  initialCategory?: UraTaxCalcCategory;
};

function openExternal(url: string) {
  if (typeof window === 'undefined') return;
  const tg = (
    window as unknown as {
      Telegram?: { WebApp?: { openLink?: (u: string, o?: { try_instant_view?: boolean }) => void } };
    }
  ).Telegram?.WebApp;
  if (tg?.openLink) tg.openLink(url, { try_instant_view: false });
  else window.open(url, '_blank', 'noopener,noreferrer');
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{children}</span>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-1.5 w-full rounded-xl bg-[#1a1d24] border border-[#2d323c] px-3 py-3 text-white text-base font-semibold tabular-nums placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${props.className ?? ''}`}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`mt-1.5 w-full rounded-xl bg-[#1a1d24] border border-[#2d323c] px-3 py-3 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${props.className ?? ''}`}
    />
  );
}

function ResultRow({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 text-sm ${emphasize ? 'pt-2 border-t border-white/10' : ''}`}>
      <span className={emphasize ? 'text-slate-300 font-semibold' : 'text-slate-400'}>{label}</span>
      <span className={`font-bold tabular-nums ${emphasize ? 'text-white' : 'text-sky-100'}`}>{value}</span>
    </div>
  );
}

export default function UraTaxCalculatorsModal({ onClose, initialCategory = 'paye' }: Props) {
  const [category, setCategory] = useState<UraTaxCalcCategory>(initialCategory);

  // MV Import
  const [mvType, setMvType] = useState('PASSENGER SEDAN/SALON');
  const [mvCurrency, setMvCurrency] = useState<'UGX' | 'USD'>('USD');
  const [mvCif, setMvCif] = useState('');
  const [mvSeats, setMvSeats] = useState('');
  const [mvWeight, setMvWeight] = useState('');
  const [mvEngine, setMvEngine] = useState('');
  const [mvYear, setMvYear] = useState('');
  const [mvStatus, setMvStatus] = useState<'new' | 'old'>('old');
  const [mvFx, setMvFx] = useState('3700');
  const [mvEthical, setMvEthical] = useState(false);

  // PAYE
  const [payeGross, setPayeGross] = useState('');
  const [payeResidence, setPayeResidence] = useState<PayeResidence>('resident');

  // Rental
  const [rentalGross, setRentalGross] = useState('');
  const [rentalPeriod, setRentalPeriod] = useState<'annual' | 'monthly'>('annual');

  // Advance MV
  const [advKind, setAdvKind] = useState<AdvanceMvKind>('psv');
  const [advQty, setAdvQty] = useState('');

  const payableAmount = useMemo(() => {
    if (category === 'paye') {
      const g = parseAmount(payeGross);
      if (g == null) return null;
      return calculatePaye(g, payeResidence).tax;
    }
    if (category === 'rental') {
      const g = parseAmount(rentalGross);
      if (g == null) return null;
      const annual = rentalPeriod === 'monthly' ? g * 12 : g;
      return calculateRentalTaxIndividuals(annual).tax;
    }
    if (category === 'advance-mv') {
      if (advKind === 'boda') return calculateAdvanceMotorVehicleTax('boda', 1).tax;
      const q = parseAmount(advQty);
      if (q == null) return null;
      return calculateAdvanceMotorVehicleTax(advKind, q).tax;
    }
    // mv-import
    if (!mvEthical) return null;
    const cif = parseAmount(mvCif);
    const fx = parseAmount(mvFx) ?? 3700;
    if (cif == null) return null;
    const year = parseAmount(mvYear);
    return calculateMotorVehicleImportTax({
      cif,
      currency: mvCurrency,
      usdToUgx: fx,
      yearOfManufacture: year,
      status: mvStatus,
      applyEnvironmentalLevy: true,
    }).total;
  }, [
    category,
    payeGross,
    payeResidence,
    rentalGross,
    rentalPeriod,
    advKind,
    advQty,
    mvEthical,
    mvCif,
    mvFx,
    mvCurrency,
    mvYear,
    mvStatus,
  ]);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const payEnabled = payableAmount != null && payableAmount > 0;

  const openPay = (url: string) => {
    triggerHapticFeedback(window);
    openExternal(url);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-ura-navy/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ura-tax-calc-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#2d323c] bg-[#13161d] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#2d323c] shrink-0">
          <div>
            <h2 id="ura-tax-calc-title" className="text-lg font-bold text-white">
              URA Tax Calculators
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Based on ura.go.ug tax calculators</p>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              onClose();
            }}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="px-3 pt-3 shrink-0 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setCategory(tab.id);
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition-colors ${
                  category === tab.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-[#1a1d24] text-slate-400 border border-[#2d323c] hover:text-white'
                }`}
              >
                <span className="mr-1" aria-hidden>
                  {tab.emoji}
                </span>
                {tab.short}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-4 space-y-4 flex-1">
          <p className="text-xs text-slate-400 leading-relaxed">
            {TABS.find((t) => t.id === category)?.label}. Estimates for guidance — final liability is set by URA.
          </p>

          {category === 'mv-import' ? (
            <div className="space-y-3">
              <label className="block">
                <FieldLabel>Motor vehicle type</FieldLabel>
                <SelectInput value={mvType} onChange={(e) => setMvType(e.target.value)}>
                  {[
                    'AMBULANCE',
                    'ENGINEERING PLANT',
                    'ESTATE/STATION WAGON',
                    'GOODS VEHICLE',
                    'MOTOR CYCLE',
                    'PASSENGER SEDAN/SALON',
                    'TRACTOR HEAD',
                    'TRAILER',
                    'TRI-CYCLE',
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </SelectInput>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <FieldLabel>Currency</FieldLabel>
                  <SelectInput
                    value={mvCurrency}
                    onChange={(e) => setMvCurrency(e.target.value as 'UGX' | 'USD')}
                  >
                    <option value="USD">USD</option>
                    <option value="UGX">UGX</option>
                  </SelectInput>
                </label>
                <label className="block">
                  <FieldLabel>USD → UGX rate</FieldLabel>
                  <TextInput
                    inputMode="decimal"
                    value={mvFx}
                    onChange={(e) => setMvFx(e.target.value)}
                    disabled={mvCurrency === 'UGX'}
                    placeholder="3700"
                  />
                </label>
              </div>
              <label className="block">
                <FieldLabel>CIF value *</FieldLabel>
                <TextInput
                  inputMode="decimal"
                  value={mvCif}
                  onChange={(e) => setMvCif(e.target.value)}
                  placeholder="e.g. 2500"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <FieldLabel>Seating capacity</FieldLabel>
                  <TextInput inputMode="numeric" value={mvSeats} onChange={(e) => setMvSeats(e.target.value)} />
                </label>
                <label className="block">
                  <FieldLabel>Gross weight (kg)</FieldLabel>
                  <TextInput inputMode="decimal" value={mvWeight} onChange={(e) => setMvWeight(e.target.value)} />
                </label>
                <label className="block">
                  <FieldLabel>Engine capacity (cc)</FieldLabel>
                  <TextInput inputMode="numeric" value={mvEngine} onChange={(e) => setMvEngine(e.target.value)} />
                </label>
                <label className="block">
                  <FieldLabel>Year of manufacture</FieldLabel>
                  <TextInput
                    inputMode="numeric"
                    value={mvYear}
                    onChange={(e) => setMvYear(e.target.value)}
                    placeholder="e.g. 2014"
                  />
                </label>
              </div>
              <div className="flex rounded-xl border border-[#2d323c] p-1 bg-[#0f1218]">
                {(['new', 'old'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setMvStatus(s);
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                      mvStatus === s ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <label className="flex items-start gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={mvEthical}
                  onChange={(e) => setMvEthical(e.target.checked)}
                  className="mt-0.5"
                />
                <span>I accept ethical use of this estimate tool (matches URA calculator acknowledgement).</span>
              </label>
              {mvEthical && parseAmount(mvCif) != null ? (
                (() => {
                  const r = calculateMotorVehicleImportTax({
                    cif: parseAmount(mvCif)!,
                    currency: mvCurrency,
                    usdToUgx: parseAmount(mvFx) ?? 3700,
                    yearOfManufacture: parseAmount(mvYear),
                    status: mvStatus,
                    applyEnvironmentalLevy: true,
                  });
                  return (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 px-3 py-3 space-y-2">
                      <ResultRow label="Customs value" value={formatUgx(r.customsValueUgx)} />
                      <ResultRow label="Import duty (25%)" value={formatUgx(r.importDuty)} />
                      <ResultRow label="VAT (18%)" value={formatUgx(r.vat)} />
                      <ResultRow label="WHT (6%)" value={formatUgx(r.wht)} />
                      <ResultRow label="Infrastructure levy (1.5%)" value={formatUgx(r.infrastructureLevy)} />
                      <ResultRow label="Environmental levy" value={formatUgx(r.environmentalLevy)} />
                      <ResultRow label="Estimated total" value={formatUgx(r.total)} emphasize />
                      <p className="text-[10px] text-slate-500 leading-relaxed pt-1">{r.note}</p>
                      <p className="text-[10px] text-slate-600">
                        Type {mvType}
                        {mvSeats ? ` · ${mvSeats} seats` : ''}
                        {mvEngine ? ` · ${mvEngine} cc` : ''}
                        {mvWeight ? ` · ${mvWeight} kg` : ''}
                      </p>
                    </div>
                  );
                })()
              ) : (
                <p className="text-center text-sm text-slate-500 py-2">
                  Enter CIF and accept ethical use to see results.
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  openExternal(URA_MV_OFFICIAL_CALC_URL);
                }}
                className="w-full rounded-xl border border-[#2d323c] bg-[#1a1d24] py-2.5 text-xs font-semibold text-sky-300"
              >
                Open official URA MV calculator
              </button>
            </div>
          ) : null}

          {category === 'paye' ? (
            <div className="space-y-3">
              <div className="flex rounded-xl border border-[#2d323c] p-1 bg-[#0f1218]">
                {([
                  { id: 'resident' as const, label: 'Resident' },
                  { id: 'non-resident' as const, label: 'Non-resident' },
                ]).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setPayeResidence(opt.id);
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                      payeResidence === opt.id ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <label className="block">
                <FieldLabel>Gross income (monthly UGX)</FieldLabel>
                <TextInput
                  inputMode="decimal"
                  value={payeGross}
                  onChange={(e) => setPayeGross(e.target.value)}
                  placeholder="e.g. 1500000"
                />
              </label>
              {parseAmount(payeGross) != null ? (
                (() => {
                  const r = calculatePaye(parseAmount(payeGross)!, payeResidence);
                  return (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 px-3 py-3 space-y-2">
                      <ResultRow label="PAYE tax" value={formatUgx(r.tax)} />
                      <ResultRow label="Net (after PAYE)" value={formatUgx(r.net)} emphasize />
                      <p className="text-[10px] text-slate-500 leading-relaxed pt-1">{r.note}</p>
                    </div>
                  );
                })()
              ) : (
                <p className="text-center text-sm text-slate-500 py-2">Enter gross monthly income.</p>
              )}
            </div>
          ) : null}

          {category === 'rental' ? (
            <div className="space-y-3">
              <div className="flex rounded-xl border border-[#2d323c] p-1 bg-[#0f1218]">
                {([
                  { id: 'annual' as const, label: 'Annual' },
                  { id: 'monthly' as const, label: 'Monthly' },
                ]).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setRentalPeriod(opt.id);
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                      rentalPeriod === opt.id ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <label className="block">
                <FieldLabel>
                  Gross rental amount ({rentalPeriod === 'monthly' ? 'per month' : 'per year'} UGX)
                </FieldLabel>
                <TextInput
                  inputMode="decimal"
                  value={rentalGross}
                  onChange={(e) => setRentalGross(e.target.value)}
                  placeholder="e.g. 6000000"
                />
              </label>
              {parseAmount(rentalGross) != null ? (
                (() => {
                  const raw = parseAmount(rentalGross)!;
                  const annual = rentalPeriod === 'monthly' ? raw * 12 : raw;
                  const r = calculateRentalTaxIndividuals(annual);
                  return (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 px-3 py-3 space-y-2">
                      <ResultRow label="Annual gross" value={formatUgx(annual)} />
                      <ResultRow label="Chargeable (after threshold)" value={formatUgx(r.chargeable)} />
                      <ResultRow label="Rental tax (12%)" value={formatUgx(r.tax)} emphasize />
                      <p className="text-[10px] text-slate-500 leading-relaxed pt-1">{r.note}</p>
                    </div>
                  );
                })()
              ) : (
                <p className="text-center text-sm text-slate-500 py-2">Enter gross rental amount.</p>
              )}
            </div>
          ) : null}

          {category === 'advance-mv' ? (
            <div className="space-y-3">
              <label className="block">
                <FieldLabel>Vehicle usage type</FieldLabel>
                <SelectInput
                  value={advKind}
                  onChange={(e) => setAdvKind(e.target.value as AdvanceMvKind)}
                >
                  <option value="psv">Passenger service vehicle</option>
                  <option value="bus">Bus</option>
                  <option value="goods">Goods transportation (above 2 tonnes)</option>
                  <option value="trailer">Trailer</option>
                  <option value="boda">Motorcycle (boda boda)</option>
                </SelectInput>
              </label>
              {advKind !== 'boda' ? (
                <label className="block">
                  <FieldLabel>
                    {advKind === 'goods' || advKind === 'trailer'
                      ? 'Loading capacity (tonnes)'
                      : 'Number of passengers'}
                  </FieldLabel>
                  <TextInput
                    inputMode="decimal"
                    value={advQty}
                    onChange={(e) => setAdvQty(e.target.value)}
                    placeholder={advKind === 'goods' || advKind === 'trailer' ? 'e.g. 7' : 'e.g. 14'}
                  />
                </label>
              ) : null}
              {advKind === 'boda' || parseAmount(advQty) != null ? (
                (() => {
                  const q = advKind === 'boda' ? 1 : parseAmount(advQty)!;
                  const r = calculateAdvanceMotorVehicleTax(advKind, q);
                  return (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 px-3 py-3 space-y-2">
                      <ResultRow label="Rate" value={r.unitLabel} />
                      <ResultRow label="Advance tax / year" value={formatUgx(r.tax)} emphasize />
                      <p className="text-[10px] text-slate-500 leading-relaxed pt-1">{r.note}</p>
                    </div>
                  );
                })()
              ) : (
                <p className="text-center text-sm text-slate-500 py-2">Enter tonnes or passengers.</p>
              )}
            </div>
          ) : null}

          {/* Pay calculated amount */}
          <div className="rounded-xl border border-[#f3ba2f]/35 bg-[#1a1608] px-3 py-3 space-y-2">
            <p className="text-sm font-bold text-[#f3ba2f]">Pay the calculated amount</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {payEnabled
                ? `Estimated payable: ${formatUgx(payableAmount!)}. Generate a PRN on URA and complete payment via banks or mobile money.`
                : 'Calculate a tax amount above, then pay on the official URA payment channels.'}
            </p>
            <button
              type="button"
              disabled={!payEnabled}
              onClick={() => openPay(URA_PAY_PRN_URL)}
              className="w-full rounded-xl bg-[#f3ba2f] py-3 text-sm font-extrabold text-[#123f78] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {payEnabled ? `Pay ${formatUgx(payableAmount!)} via URA PRN` : 'Pay via URA (calculate first)'}
            </button>
            <button
              type="button"
              onClick={() => openPay(URA_MAKE_PAYMENT_URL)}
              className="w-full rounded-xl border border-[#f3ba2f]/40 bg-transparent py-2.5 text-xs font-semibold text-[#f3ba2f]"
            >
              Open URA make a payment hub
            </button>
            <button
              type="button"
              onClick={() => openPay(URA_TAX_CALC_URL)}
              className="w-full rounded-xl border border-[#2d323c] bg-[#1a1d24] py-2.5 text-xs font-semibold text-sky-300"
            >
              Official URA tax calculators
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
