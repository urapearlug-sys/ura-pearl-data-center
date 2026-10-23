'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { submitEarnPearlActivity } from '@/utils/earn-activity-submit';
import { uploadVoiceRecording } from '@/utils/voice-recording-upload';
import VoiceRecordingPanel from '@/components/VoiceRecordingPanel';
import {
  WHISTLE_IMPORTANT_NOTES,
  WHISTLE_STEP_LABELS,
  WHISTLE_VIOLATION_OPTIONS,
  defaultWhistleDeclarationDate,
  defaultWhistlePeriodFrom,
  defaultWhistlePeriodTo,
  type WhistleContactMode,
  type WhistleEvidenceChoice,
  type WhistlePreferredContact,
} from '@/data/whistle-blower-form';

const REWARD_BLUE = 1000;
const STEP_COUNT = WHISTLE_STEP_LABELS.length;

type Props = { onClose: () => void };

const inputClass =
  'mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm text-white placeholder:text-slate-500';

export default function WhistleBlowerPopup({ onClose }: Props) {
  const showToast = useToast();
  const { userTelegramInitData } = useGameStore();

  const [step, setStep] = useState(0);
  const [contactMode, setContactMode] = useState<WhistleContactMode>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<WhistlePreferredContact>(null);
  const [preferredContactOther, setPreferredContactOther] = useState('');

  const [subjectName, setSubjectName] = useState('');
  const [subjectTin, setSubjectTin] = useState('');
  const [subjectAddress, setSubjectAddress] = useState('');
  const [subjectWeb, setSubjectWeb] = useState('');

  const [violations, setViolations] = useState<Set<string>>(() => new Set());
  const [violationOther, setViolationOther] = useState('');

  const [activityDescription, setActivityDescription] = useState('');
  const [periodFrom, setPeriodFrom] = useState(() => defaultWhistlePeriodFrom());
  const [periodTo, setPeriodTo] = useState(() => defaultWhistlePeriodTo());
  const [estimatedTaxUgx, setEstimatedTaxUgx] = useState('0');

  const [evidenceChoice, setEvidenceChoice] = useState<WhistleEvidenceChoice>(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');

  const [additionalInfo, setAdditionalInfo] = useState('');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);

  const [signature, setSignature] = useState('');
  const [declarationDate, setDeclarationDate] = useState(() => defaultWhistleDeclarationDate());

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const toggleViolation = (id: string) => {
    triggerHapticFeedback(window);
    setViolations((prev) => {
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
        if (contactMode === 'anonymous') return true;
        if (contactMode === 'contact') {
          return fullName.trim().length > 0 && preferredContact !== null;
        }
        return false;
      case 2:
        return subjectName.trim().length > 0;
      case 3:
        return violations.size > 0 || violationOther.trim().length > 0;
      case 4:
        return (
          activityDescription.trim().length >= 30 &&
          periodFrom.trim().length > 0 &&
          periodTo.trim().length > 0 &&
          estimatedTaxUgx.trim().length > 0
        );
      case 5:
        if (evidenceChoice === null) return false;
        if (evidenceChoice === 'no') return true;
        return evidenceDescription.trim().length >= 10;
      case 6:
        return true;
      case 7:
        return signature.trim().length >= 2 && declarationDate.trim().length > 0;
      default:
        return false;
    }
  }, [
    step,
    contactMode,
    fullName,
    preferredContact,
    subjectName,
    violations,
    violationOther,
    activityDescription,
    periodFrom,
    periodTo,
    estimatedTaxUgx,
    evidenceChoice,
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

  const violationLabels = useMemo(() => {
    const fromList: string[] = WHISTLE_VIOLATION_OPTIONS.filter((v) => violations.has(v.id)).map((v) => v.label);
    if (violationOther.trim()) fromList.push(`Other: ${violationOther.trim()}`);
    return fromList;
  }, [violations, violationOther]);

  const buildSourceLabel = () => {
    const identity =
      contactMode === 'anonymous'
        ? 'Anonymous'
        : `Contact · ${fullName.trim()} · ${preferredContact}${preferredContact === 'other' ? `:${preferredContactOther}` : ''}`;
    return [
      'Whistle blower',
      identity,
      `Subject: ${subjectName.trim()}`,
      subjectTin.trim() ? `TIN/BRN: ${subjectTin.trim()}` : null,
      `Violations: ${violationLabels.join('; ')}`,
      `Period: ${periodFrom}–${periodTo}`,
      `Est. tax UGX: ${estimatedTaxUgx}`,
      `Evidence: ${evidenceChoice}`,
      activityDescription.trim().slice(0, 120),
      additionalInfo.trim() ? `Extra: ${additionalInfo.trim().slice(0, 80)}` : null,
      voiceBlob ? 'Voice attachment included' : null,
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
    triggerHapticFeedback(window);

    let attachmentUrl: string | undefined;
    if (voiceBlob && voiceBlob.size > 0) {
      const up = await uploadVoiceRecording({
        initData: userTelegramInitData,
        blob: voiceBlob,
        purpose: 'whistle_blower',
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
      sourceKey: 'whistle_blower',
      sourceLabel: buildSourceLabel(),
      amount: REWARD_BLUE,
      activityType: 'blue',
      attachmentUrl,
    });
    setBusy(false);
    if (!res.ok) {
      showToast(res.error, 'error');
      return;
    }
    setDone(true);
    showToast('Report submitted · pending approval', 'success');
  };

  const progressPct = ((step + 1) / STEP_COUNT) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#0a1628] shadow-2xl overflow-hidden">
        <div className="shrink-0 bg-[#123f78] px-4 pt-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span aria-hidden>🛡️</span> Whistle blower
              </p>
              <p className="text-[11px] text-[#f3ba2f] mt-0.5">
                Step {step + 1} · {WHISTLE_STEP_LABELS[step]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(window);
                onClose();
              }}
              className="rounded-xl border border-white/20 px-3 py-1.5 text-sm text-white shrink-0"
            >
              Close
            </button>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[#0a1628]/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f3ba2f] to-[#ffe08a] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-white">
          {done ? (
            <DoneScreen onClose={onClose} reward={REWARD_BLUE} />
          ) : step === 0 ? (
            <>
              <p className="text-base font-extrabold text-[#f3ba2f]">Important notes</p>
              <ul className="space-y-2.5">
                {WHISTLE_IMPORTANT_NOTES.map((note) => (
                  <li
                    key={note}
                    className="flex gap-2.5 rounded-xl border border-[#8bb4ef]/25 bg-[#121f35]/80 px-3 py-2.5 text-[13px] leading-snug text-blue-50"
                  >
                    <span className="text-[#f3ba2f] font-bold shrink-0">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              <NextButton onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 1 ? (
            <>
              <StepHeading title="1. Your identity" hint="Choose how URA may reach you." />
              <ChoiceCard
                selected={contactMode === 'anonymous'}
                onClick={() => {
                  triggerHapticFeedback(window);
                  setContactMode('anonymous');
                }}
                title="I want to remain anonymous"
                subtitle="No contact details required"
              />
              <ChoiceCard
                selected={contactMode === 'contact'}
                onClick={() => {
                  triggerHapticFeedback(window);
                  setContactMode('contact');
                }}
                title="I am willing to be contacted"
                subtitle="Help URA follow up on your report"
              />
              {contactMode === 'contact' ? (
                <div className="space-y-2 rounded-xl border border-[#f3ba2f]/30 bg-[#121f35]/50 p-3">
                  <Field label="Full name" required>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                      placeholder="+256 …"
                    />
                  </Field>
                  <p className="text-[11px] text-blue-200/90 pt-1">Preferred contact method</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { id: 'email' as const, label: 'Email' },
                        { id: 'phone' as const, label: 'Phone' },
                        { id: 'other' as const, label: 'Other' },
                      ] as const
                    ).map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          triggerHapticFeedback(window);
                          setPreferredContact(id);
                        }}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                          preferredContact === id
                            ? 'border-[#f3ba2f] bg-[#f3ba2f]/20 text-[#f3ba2f]'
                            : 'border-white/15 text-blue-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {preferredContact === 'other' ? (
                    <input
                      value={preferredContactOther}
                      onChange={(e) => setPreferredContactOther(e.target.value)}
                      placeholder="Describe how to reach you"
                      className={inputClass}
                    />
                  ) : null}
                </div>
              ) : null}
              <NextButton onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 2 ? (
            <>
              <StepHeading title="2. Who are you reporting?" hint="Individual or company under suspicion." />
              <Field label="Name of individual or company" required>
                <input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="TIN / business registration (if known)">
                <input value={subjectTin} onChange={(e) => setSubjectTin(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Address (if known)">
                <input value={subjectAddress} onChange={(e) => setSubjectAddress(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Website or other identifiers">
                <input value={subjectWeb} onChange={(e) => setSubjectWeb(e.target.value)} className={inputClass} />
              </Field>
              <NextButton onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 3 ? (
            <>
              <StepHeading title="3. Suspected tax violation" hint="Select all that apply." />
              <div className="flex flex-col gap-2">
                {WHISTLE_VIOLATION_OPTIONS.map((v) => {
                  const on = violations.has(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleViolation(v.id)}
                      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-[13px] leading-snug transition-colors ${
                        on
                          ? 'border-[#f3ba2f] bg-[#f3ba2f]/15 text-white'
                          : 'border-[#8bb4ef]/30 bg-[#121f35] text-blue-50'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                          on ? 'border-[#f3ba2f] bg-[#f3ba2f] text-[#123f78]' : 'border-white/30'
                        }`}
                      >
                        {on ? '✓' : ''}
                      </span>
                      {v.label}
                    </button>
                  );
                })}
              </div>
              <Field label="Other (please describe)">
                <input
                  value={violationOther}
                  onChange={(e) => setViolationOther(e.target.value)}
                  className={inputClass}
                  placeholder="Describe another violation type"
                />
              </Field>
              <NextButton onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 4 ? (
            <>
              <StepHeading
                title="4. Description of the activity"
                hint="Dates, amounts, and how you became aware — be specific."
              />
              <Field label="What happened?" required>
                <textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  rows={5}
                  className={`${inputClass} resize-none`}
                  placeholder="Describe clearly what happened…"
                />
              </Field>
              <p className="text-[11px] text-blue-200/80">Time period involved</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="From">
                  <input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} className={inputClass} />
                </Field>
                <Field label="To">
                  <input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Estimated tax amount involved (UGX, if known)">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={estimatedTaxUgx}
                  onChange={(e) => setEstimatedTaxUgx(e.target.value)}
                  className={inputClass}
                />
              </Field>
              {activityDescription.trim().length > 0 && activityDescription.trim().length < 30 ? (
                <p className="text-[11px] text-amber-200/90">Add a bit more detail (at least 30 characters).</p>
              ) : null}
              <NextButton onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 5 ? (
            <>
              <StepHeading title="5. Supporting evidence" hint="Documents help — describe what you have." />
              {(
                [
                  { id: 'provide' as const, label: 'Yes – I can provide them' },
                  { id: 'describe' as const, label: 'Yes – I can describe them' },
                  { id: 'no' as const, label: 'No' },
                ] as const
              ).map(({ id, label }) => (
                <ChoiceCard
                  key={id}
                  selected={evidenceChoice === id}
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setEvidenceChoice(id);
                  }}
                  title={label}
                />
              ))}
              {evidenceChoice && evidenceChoice !== 'no' ? (
                <Field label="Description of evidence (or list of documents)" required>
                  <textarea
                    value={evidenceDescription}
                    onChange={(e) => setEvidenceDescription(e.target.value)}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder="Invoices, emails, bank statements…"
                  />
                </Field>
              ) : null}
              <NextButton onClick={goNext} disabled={!canNext} />
            </>
          ) : step === 6 ? (
            <>
              <StepHeading title="6. Additional information" hint="Optional voice note or text." />
              <VoiceRecordingPanel
                label="Record a confidential voice note"
                recording={voiceBlob}
                onRecordingChange={setVoiceBlob}
                disabled={busy}
              />
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="Any other relevant details…"
              />
              <NextButton onClick={goNext} disabled={!canNext} label="Next" />
            </>
          ) : (
            <>
              <StepHeading title="7. Declaration" hint="Confirm accuracy before you submit." />
              <p className="text-[13px] leading-relaxed text-blue-100 rounded-xl border border-white/10 bg-[#121f35]/60 px-3 py-2.5">
                I confirm that the information I have provided is true and accurate to the best of my knowledge.
              </p>
              <Field label="Signature (type your name)" required>
                <input value={signature} onChange={(e) => setSignature(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Date" required>
                <input
                  type="date"
                  value={declarationDate}
                  onChange={(e) => setDeclarationDate(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <p className="text-[11px] text-[#f3ba2f]/90 text-center">
                Up to +{REWARD_BLUE} blue pearls after successful review
              </p>
              <NextButton
                onClick={goNext}
                disabled={!canNext || busy}
                label={busy ? 'Submitting…' : 'Submit report'}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <p className="text-base font-extrabold text-white">{title}</p>
      {hint ? <p className="text-[11px] text-blue-200/80 mt-0.5">{hint}</p> : null}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block text-[11px] text-blue-200/90">
      {label}
      {required ? <span className="text-[#f3ba2f]"> *</span> : null}
      {children}
    </label>
  );
}

function ChoiceCard({
  title,
  subtitle,
  selected,
  onClick,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
        selected
          ? 'border-[#f3ba2f] bg-gradient-to-br from-[#f3ba2f]/20 to-[#123f78]/40 ring-1 ring-[#f3ba2f]/40'
          : 'border-[#8bb4ef]/35 bg-[#121f35] hover:border-[#8bb4ef]/60'
      }`}
    >
      <p className="text-sm font-bold text-white">{title}</p>
      {subtitle ? <p className="text-[11px] text-blue-200/80 mt-0.5">{subtitle}</p> : null}
    </button>
  );
}

function NextButton({
  onClick,
  disabled,
  label = 'Next',
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-40 shadow-lg shadow-[#f3ba2f]/20"
    >
      {label}
    </button>
  );
}

function DoneScreen({ onClose, reward }: { onClose: () => void; reward: number }) {
  return (
    <div className="text-center space-y-3 py-2">
      <p className="text-3xl" aria-hidden>
        ✓
      </p>
      <p className="text-lg font-extrabold text-[#f3ba2f]">Thank you</p>
      <p className="text-sm text-blue-100 leading-relaxed">
        Your report is confidential in-app and awaits review. Rewards up to +{reward} blue pearls apply when a task is
        verified successful. This does not replace official URA reporting channels.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
      >
        Done
      </button>
    </div>
  );
}
