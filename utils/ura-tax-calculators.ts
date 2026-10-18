/**
 * URA tax calculator helpers based on published rates at
 * https://ura.go.ug/en/tax-calculators/ and related URA guides.
 * Estimates only — confirm with URA / official calculators before payment.
 */

export function formatUgx(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return `UGX ${Math.round(n).toLocaleString('en-UG')}`;
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/,/g, '').trim();
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Official resident / non-resident monthly PAYE (URA paye-rates). */
export type PayeResidence = 'resident' | 'non-resident';

export function calculatePaye(grossMonthly: number, residence: PayeResidence): {
  tax: number;
  net: number;
  note: string;
} {
  const income = Math.max(0, grossMonthly);
  let tax = 0;

  if (residence === 'resident') {
    if (income <= 335_000) tax = 0;
    else if (income <= 410_000) tax = 0.2 * (income - 335_000);
    else if (income <= 485_000) tax = 15_000 + 0.25 * (income - 410_000);
    else if (income <= 10_000_000) tax = 33_750 + 0.3 * (income - 485_000);
    else tax = 33_750 + 0.3 * (income - 485_000) + 0.1 * (income - 10_000_000);
  } else {
    if (income <= 335_000) tax = income * 0.1;
    else if (income <= 410_000) tax = 33_500 + 0.2 * (income - 335_000);
    else if (income <= 10_000_000) tax = 48_500 + 0.3 * (income - 410_000);
    else tax = 48_500 + 0.3 * (income - 410_000) + 0.1 * (income - 10_000_000);
  }

  return {
    tax: Math.round(tax),
    net: Math.round(income - tax),
    note: 'Monthly PAYE estimate from URA published brackets.',
  };
}

const RENTAL_THRESHOLD = 2_820_000;
const RENTAL_RATE = 0.12;

/** Individual rental income tax — 12% of gross above UGX 2,820,000 (no other deductions). */
export function calculateRentalTaxIndividuals(grossAnnual: number): {
  chargeable: number;
  tax: number;
  note: string;
} {
  const gross = Math.max(0, grossAnnual);
  const chargeable = Math.max(0, gross - RENTAL_THRESHOLD);
  return {
    chargeable: Math.round(chargeable),
    tax: Math.round(chargeable * RENTAL_RATE),
    note: 'Individuals: threshold UGX 2,820,000; rate 12%; no expense deductions.',
  };
}

export type AdvanceMvKind = 'goods' | 'trailer' | 'psv' | 'bus' | 'boda';

/** Advance tax on transport (FY 2024/25 brochure rates). */
export function calculateAdvanceMotorVehicleTax(
  kind: AdvanceMvKind,
  quantity: number
): { tax: number; unitLabel: string; note: string } {
  const q = Math.max(0, quantity);
  if (kind === 'boda') {
    return {
      tax: 20_000,
      unitLabel: 'flat annual',
      note: 'Motorcycle (boda boda) pays UGX 20,000 per year.',
    };
  }
  if (kind === 'goods' || kind === 'trailer') {
    return {
      tax: Math.round(q * 50_000),
      unitLabel: 'UGX 50,000 per tonne / year',
      note: 'Goods vehicles above 2 tonnes and trailers: UGX 50,000 per tonne per year.',
    };
  }
  return {
    tax: Math.round(q * 20_000),
    unitLabel: 'UGX 20,000 per passenger / year',
    note: 'Passenger service vehicles and buses: UGX 20,000 per passenger per year.',
  };
}

export type MvImportStatus = 'new' | 'old';

export type MvImportBreakdown = {
  customsValueUgx: number;
  importDuty: number;
  vat: number;
  wht: number;
  infrastructureLevy: number;
  environmentalLevy: number;
  total: number;
  ageYears: number | null;
  note: string;
};

/**
 * Indicative motor vehicle import taxes from CIF (URA FAQ worked example rates).
 * Official liability uses URA valuation database — treat as estimate only.
 */
export function calculateMotorVehicleImportTax(input: {
  cif: number;
  currency: 'UGX' | 'USD';
  usdToUgx: number;
  yearOfManufacture: number | null;
  status: MvImportStatus;
  /** Apply passenger-style environmental levy when aged 9+ years. */
  applyEnvironmentalLevy: boolean;
}): MvImportBreakdown {
  const cifUgx =
    input.currency === 'USD' ? input.cif * Math.max(1, input.usdToUgx) : input.cif;
  const customsValueUgx = Math.max(0, cifUgx);

  const importDuty = customsValueUgx * 0.25;
  const vat = (customsValueUgx + importDuty) * 0.18;
  const wht = customsValueUgx * 0.06;
  const infrastructureLevy = customsValueUgx * 0.015;

  const currentYear = new Date().getFullYear();
  const ageYears =
    input.yearOfManufacture != null && input.yearOfManufacture > 1900
      ? Math.max(0, currentYear - input.yearOfManufacture)
      : input.status === 'old'
        ? 9
        : 0;

  const envApplies =
    input.applyEnvironmentalLevy && (input.status === 'old' || ageYears >= 9);
  const environmentalLevy = envApplies ? customsValueUgx * 0.5 : 0;

  const total = importDuty + vat + wht + infrastructureLevy + environmentalLevy;

  return {
    customsValueUgx: Math.round(customsValueUgx),
    importDuty: Math.round(importDuty),
    vat: Math.round(vat),
    wht: Math.round(wht),
    infrastructureLevy: Math.round(infrastructureLevy),
    environmentalLevy: Math.round(environmentalLevy),
    total: Math.round(total),
    ageYears: input.yearOfManufacture != null ? ageYears : null,
    note:
      'Estimate using common rates (ID 25%, VAT 18% on CV+ID, WHT 6%, infra 1.5%, env 50% if aged 9+). Confirm on URA motor vehicle calculator / valuation guide.',
  };
}

export const URA_TAX_CALC_URL = 'https://ura.go.ug/en/tax-calculators/';
export const URA_PAY_PRN_URL =
  'https://ura.go.ug/en/domestic-taxes/make-a-payment/generate-a-payment-slip/';
/** Pay using an existing Payment Registration Number (PRN). */
export const URA_PAY_AGAINST_PRN_URL = 'https://ura.go.ug/en/domestic-taxes/make-a-payment/';
/** Register / generate a new payment slip (PRN). */
export const URA_REGISTER_NEW_PAYMENT_URL =
  'https://ura.go.ug/en/domestic-taxes/make-a-payment/generate-a-payment-slip/';
/** Motor vehicle / driving-related URA payments hub. */
export const URA_DRIVER_LICENSE_PAY_URL = 'https://ura.go.ug/en/domestic-taxes/motor-vehicle/';
/** Contact URA / ask the Commissioner (helpdesk). */
export const URA_ASK_COMMISSIONER_URL = 'https://www.ura.go.ug/en/contact-us/';
export const URA_MAKE_PAYMENT_URL = 'https://ura.go.ug/en/domestic-taxes/make-a-payment/';
export const URA_MV_OFFICIAL_CALC_URL = 'https://services.ura.go.ug/faces/mv_calculator.xhtml';
export const URA_PAYE_RATES_URL = 'https://ura.go.ug/en/domestic-taxes/paye-rates/';
export const URA_RENTAL_TAX_URL = 'https://ura.go.ug/en/rental-income-tax-2/';
