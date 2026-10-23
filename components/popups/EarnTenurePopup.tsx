'use client';

import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { notifyPearlBalancesRefresh } from '@/utils/pearl-balance-events';
import { submitEarnPearlActivity } from '@/utils/earn-activity-submit';
import { uploadVoiceRecording } from '@/utils/voice-recording-upload';
import HeaderVoiceMicButton from '@/components/HeaderVoiceMicButton';
import {
  TENURE_EVIDENCE_OPTIONS,
  TENURE_IMPORTANT_NOTES,
  TENURE_REPORTING_OPTIONS,
  TENURE_STEP_LABELS,
  defaultTenureDate,
  type TenureContactMode,
  type TenurePreferredContact,
  type TenurePropertyType,
  type TenureReceipts,
  type TenureRentPeriod,
  type TenureRole,
} from '@/data/earn-tenure-form';

const REWARD_WHITE = 250;
const STEP_COUNT = TENURE_STEP_LABELS.length;

type Props = { onClose: () => void };

const inputClass =
  'mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm text-white placeholder:text-slate-500';

export default function EarnTenurePopup({ onClose }: Props) {
  const showToast = useToast();
  const { userTelegramInitData, incrementPoints } = useGameStore();
  const [step, setStep] = useState(0);

  const [role, setRole] = useState<TenureRole>(null);
  const [contactMode, setContactMode] = useState<TenureContactMode>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<TenurePreferredContact>(null);
  const [preferredContactOther, setPreferredContactOther] = useState('');

  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyType, setPropertyType] = useState<TenurePropertyType>(null);
  const [propertyTypeOther, setPropertyTypeOther] = useState('');
  const [tenancyStart, setTenancyStart] = useState(() => defaultTenureDate());
  const [tenancyOngoing, setTenancyOngoing] = useState<boolean | null>(null);
  const [tenancyEnd, setTenancyEnd] = useState('');

  const [landlordName, setLandlordName] = useState('');
  const [landlordCompany, setLandlordCompany] = useState('');
  const [landlordTin, setLandlordTin] = useState('');
  const [landlordAddress, setLandlordAddress] = useState('');
  const [landlordContact, setLandlordContact] = useState('');

  const [rentPeriod, setRentPeriod] = useState<TenureRentPeriod>('monthly');
  const [rentAmount, setRentAmount] = useState('0');
  const [rentPaymentMethod, setRentPaymentMethod] = useState('');
  const [receipts, setReceipts] = useState<TenureReceipts>(null);
  const [writtenAgreement, setWrittenAgreement] = useState<boolean | null>(null);
  const [deposits, setDeposits] = useState('');

  const [reporting, setReporting] = useState<Set<string>>(() => new Set());
  const [reportingOther, setReportingOther] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [estimatedTotalRent, setEstimatedTotalRent] = useState('0');

  const [evidence, setEvidence] = useState<Set<string>>(() => new Set());
  const [evidenceDescription, setEvidenceDescription] = useState('');

  const [additionalInfo, setAdditionalInfo] = useState('');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [signature, setSignature] = useState('');
  const [declarationDate, setDeclarationDate] = useState(() => defaultTenureDate());

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const toggleSet = (setter: Dispatch<SetStateAction<Set<string>>>, id: string) => {
    triggerHapticFeedback(window);
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return role !== null;
      case 2:
        if (contactMode === 'anonymous') return true;
        if (contactMode === 'contact') return fullName.trim().length > 0 && preferredContact !== null;
        return false;
      case 3:
        return (
          propertyAddress.trim().length > 0 &&
          propertyType !== null &&
          (propertyType !== 'other' || propertyTypeOther.trim().length > 0) &&
          tenancyStart.trim().length > 0 &&
          tenancyOngoing !== null &&
          (tenancyOngoing === true || tenancyEnd.trim().length > 0)
        );
      case 4:
        return landlordName.trim().length > 0;
      case 5:
        return (
          rentAmount.trim().length > 0 &&
          rentPaymentMethod.trim().length > 0 &&
          receipts !== null &&
          writtenAgreement !== null
        );
      case 6:
        return (
          (reporting.size > 0 || reportingOther.trim().length > 0) &&
          reportDescription.trim().length >= 25 &&
          estimatedTotalRent.trim().length > 0
        );
      case 7:
        if (evidence.size > 0) return evidenceDescription.trim().length >= 5;
        return true;
      case 8:
        return true;
      case 9:
        return signature.trim().length >= 2 && declarationDate.trim().length > 0;
      default:
        return false;
    }
  }, [
    step,
    role,
    contactMode,
    fullName,
    preferredContact,
    propertyAddress,
    propertyType,
    propertyTypeOther,
    tenancyStart,
    tenancyOngoing,
    tenancyEnd,
    landlordName,
    rentAmount,
    rentPaymentMethod,
    receipts,
    writtenAgreement,
    reporting,
    reportingOther,
    reportDescription,
    estimatedTotalRent,
    evidence,
    evidenceDescription,
    signature,
    declarationDate,
  ]);

  const goNext = () => {
    if (!canNext) return;
    triggerHapticFeedback(window);
    if (step < STEP_COUNT - 1) setStep((s) => s + 1);
    else void submit();
  };

  const buildSourceLabel = () => {
    const reportLabels: string[] = TENURE_REPORTING_OPTIONS.filter((r) => reporting.has(r.id)).map((r) => r.label);
    if (reportingOther.trim()) reportLabels.push(`Other: ${reportingOther.trim()}`);
    const identity =
      contactMode === 'anonymous'
        ? 'Anonymous'
        : `Contact · ${fullName.trim()} · ${preferredContact ?? ''}`;
    return [
      'Earn tenure',
      `Role: ${role}`,
      identity,
      propertyAddress.trim().slice(0, 60),
      `Landlord: ${landlordName.trim()}`,
      `Reports: ${reportLabels.join('; ').slice(0, 100)}`,
      `Est. rent paid UGX: ${estimatedTotalRent}`,
      reportDescription.trim().slice(0, 80),
      voiceBlob ? 'Voice note attached' : null,
    ]
      .filter(Boolean)
      .join(' · ');
  };

  const submit = async () => {
    if (!userTelegramInitData) {
      showToast('Open from Telegram to submit', 'error');
      return;
    }
    setBusy(true);

    let attachmentUrl: string | undefined;
    if (voiceBlob && voiceBlob.size > 0) {
      const up = await uploadVoiceRecording({
        initData: userTelegramInitData,
        blob: voiceBlob,
        purpose: 'earn_tenure',
      });
      if (!up.ok) {
        setBusy(false);
        showToast(up.error, 'error');
        return;
      }
      attachmentUrl = up.url;
    }

    const res = await submitEarnPearlActivity({
      initData: userTelegramInitData,
      sourceKey: 'earn_your_tenure',
      sourceLabel: buildSourceLabel(),
      amount: REWARD_WHITE,
      activityType: 'white',
      attachmentUrl,
    });
    setBusy(false);
    if (!res.ok) {
      showToast(res.error, 'error');
      return;
    }
    incrementPoints(REWARD_WHITE);
    notifyPearlBalancesRefresh();
    setDone(true);
    showToast(`Tenure report submitted · +${REWARD_WHITE} white pearls`, 'success');
  };

  const progressPct = ((step + 1) / STEP_COUNT) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#0a1628] shadow-2xl overflow-hidden">
        <Header
          step={step}
          progressPct={progressPct}
          onClose={onClose}
          voiceBlob={voiceBlob}
          onVoiceChange={setVoiceBlob}
          voiceDisabled={busy || done}
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-white">
          {done ? (
            <DoneBlock reward={REWARD_WHITE} onClose={onClose} />
          ) : step === 0 ? (
            <>
              <H title="Important notices" />
              <ul className="space-y-2">
                {TENURE_IMPORTANT_NOTES.map((note) => (
                  <li key={note} className="flex gap-2 rounded-xl border border-[#8bb4ef]/25 bg-[#121f35]/80 px-3 py-2 text-[13px] leading-snug">
                    <span className="text-[#f3ba2f] shrink-0">•</span>
                    {note}
                  </li>
                ))}
              </ul>
              <Next onClick={goNext} />
            </>
          ) : step === 1 ? (
            <>
              <H title="1. Who are you?" />
              {(
                [
                  { id: 'tenant' as const, label: "I'm a tenant" },
                  { id: 'landlord' as const, label: "I'm a landlord" },
                  { id: 'whistle_blower' as const, label: "I'm a whistle blower" },
                ] as const
              ).map(({ id, label }) => (
                <Pick key={id} selected={role === id} onClick={() => setRole(id)} title={label} />
              ))}
              <Next onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 2 ? (
            <>
              <H title="2. Anonymity & contact" />
              <Pick
                selected={contactMode === 'anonymous'}
                onClick={() => setContactMode('anonymous')}
                title="I want to remain fully anonymous"
              />
              <Pick
                selected={contactMode === 'contact'}
                onClick={() => setContactMode('contact')}
                title="I am willing to be contacted if needed"
              />
              {contactMode === 'contact' ? (
                <div className="space-y-2 rounded-xl border border-[#f3ba2f]/25 p-3 bg-[#121f35]/40">
                  <F label="Full name" req>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                  </F>
                  <F label="Email">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </F>
                  <F label="Phone">
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                  </F>
                  <p className="text-[11px] text-blue-200/80">Preferred contact</p>
                  <ChipRow
                    options={[
                      ['email', 'Email'],
                      ['phone', 'Phone'],
                      ['other', 'Other'],
                    ]}
                    value={preferredContact}
                    onPick={(v) => setPreferredContact(v as TenurePreferredContact)}
                  />
                  {preferredContact === 'other' ? (
                    <input
                      value={preferredContactOther}
                      onChange={(e) => setPreferredContactOther(e.target.value)}
                      className={inputClass}
                      placeholder="How to reach you"
                    />
                  ) : null}
                </div>
              ) : null}
              <Next onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 3 ? (
            <>
              <H title="3. Property details" />
              <F label="Full address of rented property" req>
                <textarea
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </F>
              <p className="text-[11px] text-blue-200/80">Property type</p>
              <ChipRow
                options={[
                  ['house', 'House'],
                  ['flat', 'Flat'],
                  ['room', 'Room'],
                  ['commercial', 'Commercial'],
                  ['other', 'Other'],
                ]}
                value={propertyType}
                onPick={(v) => setPropertyType(v as TenurePropertyType)}
              />
              {propertyType === 'other' ? (
                <input
                  value={propertyTypeOther}
                  onChange={(e) => setPropertyTypeOther(e.target.value)}
                  className={inputClass}
                  placeholder="Describe property type"
                />
              ) : null}
              <F label="Approx. start of tenancy">
                <input type="date" value={tenancyStart} onChange={(e) => setTenancyStart(e.target.value)} className={inputClass} />
              </F>
              <p className="text-[11px] text-blue-200/80">Tenancy still ongoing?</p>
              <YesNo value={tenancyOngoing} onPick={setTenancyOngoing} />
              {tenancyOngoing === false ? (
                <F label="End date">
                  <input type="date" value={tenancyEnd} onChange={(e) => setTenancyEnd(e.target.value)} className={inputClass} />
                </F>
              ) : null}
              <Next onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 4 ? (
            <>
              <H title="4. Landlord / owner" />
              <F label="Name of landlord or agent" req>
                <input value={landlordName} onChange={(e) => setLandlordName(e.target.value)} className={inputClass} />
              </F>
              <F label="Company name (if any)">
                <input value={landlordCompany} onChange={(e) => setLandlordCompany(e.target.value)} className={inputClass} />
              </F>
              <F label="Tax ID / BRN (if known)">
                <input value={landlordTin} onChange={(e) => setLandlordTin(e.target.value)} className={inputClass} />
              </F>
              <F label="Landlord address (if known)">
                <input value={landlordAddress} onChange={(e) => setLandlordAddress(e.target.value)} className={inputClass} />
              </F>
              <F label="Landlord phone / email (if known)">
                <input value={landlordContact} onChange={(e) => setLandlordContact(e.target.value)} className={inputClass} />
              </F>
              <Next onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 5 ? (
            <>
              <H title="5. Tenancy & payments" />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRentPeriod('monthly')}
                  className={`flex-1 rounded-lg border py-2 text-xs font-bold ${rentPeriod === 'monthly' ? 'border-[#f3ba2f] bg-[#f3ba2f]/20 text-[#f3ba2f]' : 'border-white/15'}`}
                >
                  Monthly rent
                </button>
                <button
                  type="button"
                  onClick={() => setRentPeriod('weekly')}
                  className={`flex-1 rounded-lg border py-2 text-xs font-bold ${rentPeriod === 'weekly' ? 'border-[#f3ba2f] bg-[#f3ba2f]/20 text-[#f3ba2f]' : 'border-white/15'}`}
                >
                  Weekly rent
                </button>
              </div>
              <F label={`${rentPeriod === 'weekly' ? 'Weekly' : 'Monthly'} amount (UGX)`} req>
                <input
                  type="number"
                  min={0}
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  className={inputClass}
                />
              </F>
              <F label="How is rent paid?" req>
                <input
                  value={rentPaymentMethod}
                  onChange={(e) => setRentPaymentMethod(e.target.value)}
                  className={inputClass}
                  placeholder="Cash, bank, mobile money…"
                />
              </F>
              <p className="text-[11px] text-blue-200/80">Official receipts or invoices?</p>
              <ChipRow
                options={[
                  ['yes', 'Yes'],
                  ['no', 'No'],
                  ['sometimes', 'Sometimes'],
                ]}
                value={receipts}
                onPick={(v) => setReceipts(v as TenureReceipts)}
              />
              <p className="text-[11px] text-blue-200/80">Written tenancy agreement?</p>
              <YesNo value={writtenAgreement} onPick={setWrittenAgreement} />
              <F label="Deposits (amount & receipted?)">
                <input value={deposits} onChange={(e) => setDeposits(e.target.value)} className={inputClass} placeholder="Optional" />
              </F>
              <Next onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 6 ? (
            <>
              <H title="6. What are you reporting?" sub="Select all that apply." />
              {TENURE_REPORTING_OPTIONS.map((r) => (
                <Check
                  key={r.id}
                  on={reporting.has(r.id)}
                  label={r.label}
                  onToggle={() => toggleSet(setReporting, r.id)}
                />
              ))}
              <F label="Other tax-related concern">
                <input value={reportingOther} onChange={(e) => setReportingOther(e.target.value)} className={inputClass} />
              </F>
              <F label="Detailed description" req>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Dates, amounts, conversations…"
                />
              </F>
              <F label="Estimated total rent paid so far (UGX)">
                <input
                  type="number"
                  min={0}
                  value={estimatedTotalRent}
                  onChange={(e) => setEstimatedTotalRent(e.target.value)}
                  className={inputClass}
                />
              </F>
              <Next onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 7 ? (
            <>
              <H title="7. Supporting evidence" sub="Select what you have (optional)." />
              {TENURE_EVIDENCE_OPTIONS.map((e) => (
                <Check key={e.id} on={evidence.has(e.id)} label={e.label} onToggle={() => toggleSet(setEvidence, e.id)} />
              ))}
              <F label="Describe evidence or attachments">
                <textarea
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Do not send originals — describe copies only."
                />
              </F>
              <Next onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 8 ? (
            <>
              <H title="8. Additional information" sub="Optional." />
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={5}
                className={`${inputClass} resize-none`}
                placeholder="Other tenants, related properties…"
              />
              <Next onClick={goNext} />
            </>
          ) : (
            <>
              <H title="9. Declaration" />
              <p className="text-[13px] leading-relaxed text-blue-100 rounded-xl border border-white/10 bg-[#121f35]/60 px-3 py-2.5">
                I confirm that the information provided is true and accurate to the best of my knowledge. I understand
                this report will be treated as a protected confidential (Red Task) matter.
              </p>
              <F label="Signature / typed name" req>
                <input value={signature} onChange={(e) => setSignature(e.target.value)} className={inputClass} />
              </F>
              <F label="Date" req>
                <input type="date" value={declarationDate} onChange={(e) => setDeclarationDate(e.target.value)} className={inputClass} />
              </F>
              <p className="text-[11px] text-center text-[#f3ba2f]/90">+{REWARD_WHITE} white pearls on successful submission</p>
              <Next onClick={goNext} disabled={!canNext || busy} label={busy ? 'Submitting…' : 'Submit'} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({
  step,
  progressPct,
  onClose,
  voiceBlob,
  onVoiceChange,
  voiceDisabled,
}: {
  step: number;
  progressPct: number;
  onClose: () => void;
  voiceBlob: Blob | null;
  onVoiceChange: (b: Blob | null) => void;
  voiceDisabled?: boolean;
}) {
  return (
    <div className="shrink-0 bg-[#123f78] px-4 pt-3 pb-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-white">🤝 Earn your Tenure</p>
          <p className="text-[11px] text-[#f3ba2f]">
            Step {step + 1} · {TENURE_STEP_LABELS[step]}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <HeaderVoiceMicButton
            recording={voiceBlob}
            onRecordingChange={onVoiceChange}
            disabled={voiceDisabled}
            label="Record tenure voice note"
          />
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              onClose();
            }}
            className="rounded-xl border border-white/20 px-3 py-1.5 text-sm text-white"
          >
            Close
          </button>
        </div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-[#0a1628]/60 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#f3ba2f] to-[#ffe08a] transition-all" style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );
}

function H({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <p className="text-base font-extrabold">{title}</p>
      {sub ? <p className="text-[11px] text-blue-200/80">{sub}</p> : null}
    </div>
  );
}

function F({ label, req, children }: { label: string; req?: boolean; children: ReactNode }) {
  return (
    <label className="block text-[11px] text-blue-200/90">
      {label}
      {req ? <span className="text-[#f3ba2f]"> *</span> : null}
      {children}
    </label>
  );
}

function Next({ onClick, disabled, label = 'Next' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function Pick({ title, selected, onClick }: { title: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        triggerHapticFeedback(window);
        onClick();
      }}
      className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-bold ${
        selected ? 'border-[#f3ba2f] bg-[#f3ba2f]/15 text-[#f3ba2f]' : 'border-[#8bb4ef]/35 bg-[#121f35]'
      }`}
    >
      {title}
    </button>
  );
}

function Check({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-[13px] ${
        on ? 'border-[#f3ba2f] bg-[#f3ba2f]/10' : 'border-[#8bb4ef]/30 bg-[#121f35]'
      }`}
    >
      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${on ? 'border-[#f3ba2f] bg-[#f3ba2f] text-[#123f78]' : 'border-white/30'}`}>
        {on ? '✓' : ''}
      </span>
      {label}
    </button>
  );
}

function YesNo({ value, onPick }: { value: boolean | null; onPick: (v: boolean) => void }) {
  const options: { v: boolean; label: string }[] = [
    { v: true, label: 'Yes' },
    { v: false, label: 'No' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(({ v, label }) => (
        <button
          key={label}
          type="button"
          onClick={() => {
            triggerHapticFeedback(window);
            onPick(v);
          }}
          className={`rounded-xl border py-2.5 text-sm font-bold ${value === v ? 'border-[#f3ba2f] bg-[#f3ba2f]/20 text-[#f3ba2f]' : 'border-white/15 bg-[#121f35]'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ChipRow({
  options,
  value,
  onPick,
}: {
  options: [string, string][];
  value: string | null;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            triggerHapticFeedback(window);
            onPick(id);
          }}
          className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
            value === id ? 'border-[#f3ba2f] bg-[#f3ba2f]/20 text-[#f3ba2f]' : 'border-white/15 text-blue-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function DoneBlock({ reward, onClose }: { reward: number; onClose: () => void }) {
  return (
    <div className="text-center space-y-3 py-2">
      <p className="text-lg font-extrabold text-[#f3ba2f]">Thank you</p>
      <p className="text-sm text-blue-100 leading-relaxed">
        Your tenancy report is recorded as a protected matter. +{reward} white pearls where the task qualifies.
      </p>
      <button type="button" onClick={onClose} className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]">
        Done
      </button>
    </div>
  );
}
