export const WHISTLE_IMPORTANT_NOTES = [
  'You may submit this form anonymously.',
  'Provide as much accurate detail as possible. False or malicious reports may have legal consequences.',
  'Your identity (if provided) will be protected according to applicable whistleblower protection laws.',
  'Do not use this form for general tax questions or complaints about service.',
  'Some whistle-blowing tasks are paid once successful.',
] as const;

export const WHISTLE_VIOLATION_OPTIONS = [
  { id: 'underreport_income', label: 'Underreporting of income' },
  { id: 'false_deductions', label: 'False or inflated deductions / expenses' },
  { id: 'failure_to_file', label: 'Failure to file tax returns' },
  { id: 'evasion_concealment', label: 'Tax evasion / concealment of assets' },
  { id: 'payroll_issues', label: 'Payroll / employee tax issues' },
  { id: 'vat_fraud', label: 'VAT / sales tax fraud' },
  { id: 'transfer_pricing', label: 'Transfer pricing or related-party issues' },
] as const;

export type WhistleEvidenceChoice = 'provide' | 'describe' | 'no' | null;

export type WhistleContactMode = 'anonymous' | 'contact' | null;

export type WhistlePreferredContact = 'email' | 'phone' | 'other' | null;

export function defaultWhistlePeriodFrom(now = new Date()) {
  const y = now.getFullYear();
  return `${y}-01-01`;
}

export function defaultWhistlePeriodTo(now = new Date()) {
  return now.toLocaleDateString('en-CA');
}

export function defaultWhistleDeclarationDate(now = new Date()) {
  return now.toLocaleDateString('en-CA');
}

export const WHISTLE_STEP_LABELS = [
  'Important notes',
  'Your identity',
  'Who you report',
  'Suspected violation',
  'What happened',
  'Evidence',
  'Extra details',
  'Declaration',
] as const;
