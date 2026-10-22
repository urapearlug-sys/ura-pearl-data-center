export const TENURE_IMPORTANT_NOTES = [
  'Tenants and landlords can earn for reporting tenancy status or whistle-blowing.',
  'You may submit anonymously.',
  'Your identity (if provided) is protected under whistleblower protection laws.',
  'This form is for suspected tax non-compliance related to a tenancy (e.g. undeclared rental income, cash-only arrangements, missing receipts).',
  'False or malicious reports may have legal consequences.',
] as const;

export const TENURE_REPORTING_OPTIONS = [
  { id: 'undeclared_income', label: 'Landlord appears not to be declaring the rental income' },
  { id: 'cash_no_receipts', label: 'Rent is paid only in cash with no receipts' },
  { id: 'refuses_invoices', label: 'Landlord refuses to issue proper tax invoices / receipts' },
  { id: 'subletting', label: 'Multiple tenants or sub-letting not being declared' },
  { id: 'rent_market', label: 'Rent is significantly higher/lower than market with no explanation' },
] as const;

export const TENURE_EVIDENCE_OPTIONS = [
  { id: 'agreement', label: 'Tenancy agreement' },
  { id: 'bank', label: 'Bank statements / payment records' },
  { id: 'receipts_msgs', label: 'Receipts or messages about rent' },
  { id: 'photos', label: 'Photos of the property or notices' },
  { id: 'other_docs', label: 'Other documents' },
] as const;

export type TenureRole = 'tenant' | 'landlord' | 'whistle_blower' | null;
export type TenureContactMode = 'anonymous' | 'contact' | null;
export type TenurePreferredContact = 'email' | 'phone' | 'other' | null;
export type TenurePropertyType = 'house' | 'flat' | 'room' | 'commercial' | 'other' | null;
export type TenureReceipts = 'yes' | 'no' | 'sometimes' | null;
export type TenureRentPeriod = 'monthly' | 'weekly' | null;

export function defaultTenureDate(now = new Date()) {
  return now.toLocaleDateString('en-CA');
}

export const TENURE_STEP_LABELS = [
  'Important notices',
  'Your role',
  'Contact',
  'Property',
  'Landlord',
  'Rent & payments',
  'What you report',
  'Evidence',
  'More details',
  'Declaration',
] as const;
