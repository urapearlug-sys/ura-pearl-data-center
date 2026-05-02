/**
 * URA-aligned service catalog for the Services hub.
 * URLs point to official Uganda Revenue Authority and related government channels where applicable.
 * Update paths if URA reorganizes their site; base domain https://www.ura.go.ug
 */

export type ServiceImageKey =
  | 'dailyReward'
  | 'dailyCipher'
  | 'dailyCombo'
  | 'uraTreasuryCounter'
  | 'pearlWhite'
  | 'pearlBlue'
  | 'pearlGolden'
  | 'collection'
  | 'baseGift'
  | 'blockchain'
  | 'uraFiscalFunBanner'
  | 'earnRewardsIcon'
  | 'uraLanding'
  | 'announcements'
  | 'total'
  | 'game'
  | 'friends'
  | 'telegram'
  | 'navServices'
  | 'paidTrophy1'
  | 'mitroplus'
  | 'zoom'
  | 'website';

export type UraServiceItem = {
  id: string;
  title: string;
  description: string;
  /** Official or partner portal; opened in secure browser / Telegram openLink (also used as “more info” for in-app tools). */
  url: string;
  imageKey: ServiceImageKey;
  /** Opens a built-in tool instead of the browser */
  inApp?: 'tax-calculator';
};

export type UraServiceCategoryId = 'domestic-etax' | 'compliance-efris' | 'customs-trade' | 'support-programmes';

export type UraServiceCategory = {
  id: UraServiceCategoryId;
  /** Sidebar — short label */
  shortLabel: string;
  /** Full name for header */
  title: string;
  /** Large emoji shown in sidebar */
  sidebarIcon: string;
  /** Tailwind classes for active sidebar pill (background + border) */
  activeClass: string;
  /** Icon tint when selected */
  activeIconClass: string;
  /** Muted sidebar when idle */
  idleIconClass: string;
  /** Accent for section heading in main panel */
  accentClass: string;
  services: UraServiceItem[];
};

export const URA_SERVICE_CATEGORIES: UraServiceCategory[] = [
  {
    id: 'domestic-etax',
    shortLabel: 'eTax',
    title: 'Domestic taxes & eTax',
    sidebarIcon: '💻',
    activeClass: 'bg-sky-500/25 border-sky-400/60 shadow-[0_0_20px_rgba(56,189,248,0.25)]',
    activeIconClass: 'text-sky-200',
    idleIconClass: 'text-slate-500',
    accentClass: 'text-sky-300',
    services: [
      {
        id: 'tax-calculator',
        title: 'Tax calculator',
        description: 'Estimate VAT at 18% — amount before tax, after tax, or VAT only in UGX.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'total',
        inApp: 'tax-calculator',
      },
      {
        id: 'etax-portal',
        title: 'eTax portal',
        description: 'Secure login — returns, assessments, account services 24/7.',
        url: 'https://ura.go.ug/en/etax-login/',
        imageKey: 'uraTreasuryCounter',
      },
      {
        id: 'tin-application',
        title: 'Get a TIN',
        description: 'Tax Identification Number registration and requirements.',
        url: 'https://ura.go.ug/en/domestic-taxes/tin-application/',
        imageKey: 'dailyReward',
      },
      {
        id: 'instant-tin',
        title: 'Instant TIN',
        description: 'Fast-track individual TIN via national ID (where eligible).',
        url: 'https://ura.go.ug/en/domestic-taxes/tin-application/',
        imageKey: 'pearlWhite',
      },
      {
        id: 'payment-registration',
        title: 'Generate payment slip',
        description: 'PRN / payment registration for domestic taxes.',
        url: 'https://ura.go.ug/en/domestic-taxes/make-a-payment/generate-a-payment-slip/',
        imageKey: 'dailyCombo',
      },
      {
        id: 'domestic-taxes-hub',
        title: 'Domestic taxes hub',
        description: 'Overview of income tax, VAT, rental, PAYE and more.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'uraFiscalFunBanner',
      },
      {
        id: 'e-returns',
        title: 'e-Returns & filing',
        description: 'Online return filing workflow and templates.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'dailyCipher',
      },
      {
        id: 'vat-information',
        title: 'VAT services',
        description: 'Registration, returns and compliance for VAT taxpayers.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'pearlGolden',
      },
      {
        id: 'paye-wht',
        title: 'PAYE & withholding',
        description: 'Employer obligations and withholding tax tools.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'total',
      },
      {
        id: 'rental-income',
        title: 'Rental income tax',
        description: 'Guidance for property rental taxation.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'collection',
      },
      {
        id: 'excise-levy',
        title: 'Excise & levies',
        description: 'Excise duties and sector-specific levies.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'pearlBlue',
      },
    ],
  },
  {
    id: 'compliance-efris',
    shortLabel: 'EFRIS',
    title: 'EFRIS & compliance',
    sidebarIcon: '📠',
    activeClass: 'bg-amber-500/20 border-amber-400/55 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    activeIconClass: 'text-amber-200',
    idleIconClass: 'text-slate-500',
    accentClass: 'text-amber-300',
    services: [
      {
        id: 'efris-home',
        title: 'EFRIS overview',
        description: 'Electronic fiscal receipting & e-invoicing solution.',
        url: 'https://ura.go.ug/en/efris/',
        imageKey: 'collection',
      },
      {
        id: 'efris-register',
        title: 'EFRIS registration',
        description: 'First-time setup, OTP, e-invoicing vs EFD choice.',
        url: 'https://ura.go.ug/en/efris/efris-registration/',
        imageKey: 'earnRewardsIcon',
      },
      {
        id: 'efris-handbook',
        title: 'EFRIS handbook',
        description: 'Technical and operational reference for businesses.',
        url: 'https://ura.go.ug/en/efris-handbook/',
        imageKey: 'dailyCipher',
      },
      {
        id: 'efris-login',
        title: 'EFRIS login',
        description: 'Access e-invoicing portal and desktop tools.',
        url: 'https://ura.go.ug/en/efris/efris-login/',
        imageKey: 'uraTreasuryCounter',
      },
      {
        id: 'stamp-duty',
        title: 'Stamp duty',
        description: 'Instruments, rates and digital stamping guidance.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'paidTrophy1',
      },
      {
        id: 'tax-clearance',
        title: 'Tax clearance',
        description: 'Certificates and compliance status for tenders.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'pearlGolden',
      },
      {
        id: 'audit-compliance',
        title: 'Audits & record keeping',
        description: 'Compliance visits and documentation expectations.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'blockchain',
      },
      {
        id: 'penalties-interest',
        title: 'Penalties & interest',
        description: 'Late filing and payment — how to regularize.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'pearlBlue',
      },
    ],
  },
  {
    id: 'customs-trade',
    shortLabel: 'Trade',
    title: 'Customs & regional trade',
    sidebarIcon: '🚢',
    activeClass: 'bg-teal-500/20 border-teal-400/55 shadow-[0_0_20px_rgba(45,212,191,0.2)]',
    activeIconClass: 'text-teal-200',
    idleIconClass: 'text-slate-500',
    accentClass: 'text-teal-300',
    services: [
      {
        id: 'customs-home',
        title: 'Customs services',
        description: 'Import, export, tariffs and border procedures.',
        url: 'https://ura.go.ug/en/customs/',
        imageKey: 'uraLanding',
      },
      {
        id: 'asycuda',
        title: 'ASYCUDA / clearance',
        description: 'Electronic customs declarations and processing.',
        url: 'https://ura.go.ug/en/customs/',
        imageKey: 'blockchain',
      },
      {
        id: 'single-territory',
        title: 'EAC single customs territory',
        description: 'Regional transit and coordinated border management.',
        url: 'https://ura.go.ug/en/customs/',
        imageKey: 'friends',
      },
      {
        id: 'bonds-warehouse',
        title: 'Bonds & warehouses',
        description: 'Suspense regimes and bonded warehouse rules.',
        url: 'https://ura.go.ug/en/customs/',
        imageKey: 'collection',
      },
      {
        id: 'import-duties',
        title: 'Import duties & HS codes',
        description: 'Classification and duty computation resources.',
        url: 'https://ura.go.ug/en/customs/',
        imageKey: 'dailyCombo',
      },
      {
        id: 'export-procedures',
        title: 'Export procedures',
        description: 'Documentation and rebates for exporters.',
        url: 'https://ura.go.ug/en/customs/',
        imageKey: 'pearlWhite',
      },
      {
        id: 'trade-facilitation',
        title: 'Trade facilitation',
        description: 'Authorized economic operators and fast lanes.',
        url: 'https://ura.go.ug/en/customs/',
        imageKey: 'mitroplus',
      },
      {
        id: 'dts',
        title: 'Digital Tracking Solution',
        description: 'DTS platform for cargo monitoring (where applicable).',
        url: 'https://dts.go.ug/',
        imageKey: 'telegram',
      },
    ],
  },
  {
    id: 'support-programmes',
    shortLabel: 'Support',
    title: 'Support, rulings & programmes',
    sidebarIcon: '🤝',
    activeClass: 'bg-violet-500/25 border-violet-400/55 shadow-[0_0_20px_rgba(167,139,250,0.25)]',
    activeIconClass: 'text-violet-200',
    idleIconClass: 'text-slate-500',
    accentClass: 'text-violet-300',
    services: [
      {
        id: 'ura-home',
        title: 'URA official site',
        description: 'News, publications and service directory.',
        url: 'https://www.ura.go.ug/',
        imageKey: 'navServices',
      },
      {
        id: 'tax-education',
        title: 'Tax education',
        description: 'Publications, guides and taxpayer learning.',
        url: 'https://ura.go.ug/en/tax-education/',
        imageKey: 'announcements',
      },
      {
        id: 'objections-appeals',
        title: 'Objections & appeals',
        description: 'Dispute resolution and appellate processes.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'game',
      },
      {
        id: 'advance-ruling',
        title: 'Advance rulings',
        description: 'Certainty on tax treatment for proposed transactions.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'dailyCipher',
      },
      {
        id: 'incentives-exemptions',
        title: 'Incentives & exemptions',
        description: 'Investment incentives and statutory exemptions.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'baseGift',
      },
      {
        id: 'reap-programme',
        title: 'REAP / e-government',
        description: 'Resource enhancement & accountability programme portal.',
        url: 'https://reap.finance.go.ug/e-tax/',
        imageKey: 'website',
      },
      {
        id: 'contact-ura',
        title: 'Contact & service centres',
        description: 'Offices, hotlines and appointment channels.',
        url: 'https://www.ura.go.ug/en/contact-us/',
        imageKey: 'zoom',
      },
      {
        id: 'whistleblower',
        title: 'Integrity & whistleblower',
        description: 'Report suspected malpractice (follow official channels).',
        url: 'https://www.ura.go.ug/',
        imageKey: 'pearlBlue',
      },
      {
        id: 'careers',
        title: 'Careers at URA',
        description: 'Recruitment and professional opportunities.',
        url: 'https://www.ura.go.ug/',
        imageKey: 'paidTrophy1',
      },
      {
        id: 'foi-transparency',
        title: 'Transparency & data',
        description: 'Reports, statistics and accountability resources.',
        url: 'https://www.ura.go.ug/',
        imageKey: 'pearlGolden',
      },
    ],
  },
];
