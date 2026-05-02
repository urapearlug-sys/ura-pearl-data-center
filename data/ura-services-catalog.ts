/**
 * URA Services hub — scrollable category rail + deep links.
 * URLs verified against common ura.go.ug paths; adjust if the site is reorganized.
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
  url: string;
  imageKey: ServiceImageKey;
  inApp?: 'tax-calculator';
};

export type ServiceGroupId =
  | 'domestic'
  | 'import-export'
  | 'legal-policy'
  | 'opportunities'
  | 'research'
  | 'useful-links';

export type UraServiceCategory = {
  id: string;
  groupId: ServiceGroupId;
  /** Shown as non-clickable section header in the right rail when the group changes */
  groupTitle: string;
  /** Compact label in the sidebar */
  shortLabel: string;
  /** Main panel heading */
  title: string;
  sidebarIcon: string;
  services: UraServiceItem[];
};

export const GROUP_THEME: Record<
  ServiceGroupId,
  {
    activeClass: string;
    activeIconClass: string;
    idleIconClass: string;
    accentClass: string;
  }
> = {
  domestic: {
    activeClass: 'bg-sky-500/25 border-sky-400/60 shadow-[0_0_14px_rgba(56,189,248,0.22)]',
    activeIconClass: 'text-sky-200',
    idleIconClass: 'text-slate-600',
    accentClass: 'text-sky-300',
  },
  'import-export': {
    activeClass: 'bg-teal-500/20 border-teal-400/55 shadow-[0_0_14px_rgba(45,212,191,0.2)]',
    activeIconClass: 'text-teal-200',
    idleIconClass: 'text-slate-600',
    accentClass: 'text-teal-300',
  },
  'legal-policy': {
    activeClass: 'bg-rose-500/20 border-rose-400/50 shadow-[0_0_14px_rgba(251,113,133,0.18)]',
    activeIconClass: 'text-rose-200',
    idleIconClass: 'text-slate-600',
    accentClass: 'text-rose-300',
  },
  opportunities: {
    activeClass: 'bg-amber-500/22 border-amber-400/55 shadow-[0_0_14px_rgba(245,158,11,0.2)]',
    activeIconClass: 'text-amber-200',
    idleIconClass: 'text-slate-600',
    accentClass: 'text-amber-300',
  },
  research: {
    activeClass: 'bg-indigo-500/25 border-indigo-400/55 shadow-[0_0_14px_rgba(129,140,248,0.22)]',
    activeIconClass: 'text-indigo-200',
    idleIconClass: 'text-slate-600',
    accentClass: 'text-indigo-300',
  },
  'useful-links': {
    activeClass: 'bg-cyan-500/20 border-cyan-400/55 shadow-[0_0_14px_rgba(34,211,238,0.18)]',
    activeIconClass: 'text-cyan-200',
    idleIconClass: 'text-slate-600',
    accentClass: 'text-cyan-300',
  },
};

export const URA_SERVICE_CATEGORIES: UraServiceCategory[] = [
  /* ——— Domestic taxes ——— */
  {
    id: 'get-tin',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'Get a TIN',
    title: 'Get a TIN',
    sidebarIcon: '🆔',
    services: [
      {
        id: 'tax-calculator',
        title: 'Tax calculator',
        description: 'Estimate VAT at 18% (standard rated) in UGX.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'total',
        inApp: 'tax-calculator',
      },
      {
        id: 'tin-apply',
        title: 'TIN application',
        description: 'Requirements and application for individuals & non-individuals.',
        url: 'https://ura.go.ug/en/domestic-taxes/tin-application/',
        imageKey: 'dailyReward',
      },
      {
        id: 'etax-login',
        title: 'eTax portal',
        description: 'Log in with TIN for registrations, returns and payments.',
        url: 'https://ura.go.ug/en/etax-login/',
        imageKey: 'uraTreasuryCounter',
      },
    ],
  },
  {
    id: 'efris',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'EFRIS',
    title: 'EFRIS',
    sidebarIcon: '📠',
    services: [
      { id: 'efris', title: 'EFRIS hub', description: 'E-invoicing & fiscal receipting.', url: 'https://ura.go.ug/en/efris/', imageKey: 'collection' },
      { id: 'efris-reg', title: 'EFRIS registration', description: 'First-time registration & OTP.', url: 'https://ura.go.ug/en/efris/efris-registration/', imageKey: 'earnRewardsIcon' },
      { id: 'efris-login', title: 'EFRIS login', description: 'Portal & desktop client access.', url: 'https://ura.go.ug/en/efris/efris-login/', imageKey: 'dailyCipher' },
      { id: 'efris-handbook', title: 'EFRIS handbook', description: 'Operational reference.', url: 'https://ura.go.ug/en/efris-handbook/', imageKey: 'announcements' },
    ],
  },
  {
    id: 'tax-incentives',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'Tax incentives',
    title: 'Tax incentives',
    sidebarIcon: '🎯',
    services: [
      { id: 'incentives', title: 'Incentives & exemptions', description: 'Investment incentives and exemption frameworks.', url: 'https://ura.go.ug/en/domestic-taxes/tax-exemption/', imageKey: 'baseGift' },
      { id: 'wht-agents', title: 'Designated WHT agents', description: 'Published lists (e.g. FY designations).', url: 'https://ura.go.ug/en/domestic-taxes/tax-exemption/designated-income-tax-wht-agents-for-fy-2024-25/', imageKey: 'pearlBlue' },
      { id: 'domestic-hub', title: 'Domestic taxes overview', description: 'All domestic tax types and guidance.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'uraFiscalFunBanner' },
    ],
  },
  {
    id: 'objection-appeals',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'Objections',
    title: 'Objection & appeals',
    sidebarIcon: '⚖️',
    services: [
      { id: 'objections', title: 'Objections & appeals', description: 'Disputes, objections and appellate routes.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'game' },
      { id: 'tax-appeals-act', title: 'Tax Appeals Tribunals Act', description: 'Legal framework (downloads).', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'dailyCipher' },
      { id: 'case-digest', title: 'Case digests', description: 'URA case summaries & policy notes.', url: 'https://ura.go.ug/download-category/legal-and-policy/', imageKey: 'pearlGolden' },
    ],
  },
  {
    id: 'file-return',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'File a return',
    title: 'File a return',
    sidebarIcon: '📤',
    services: [
      { id: 'e-returns', title: 'e-Returns & filing', description: 'File domestic tax returns online.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'dailyCipher' },
      { id: 'vat-returns', title: 'VAT returns', description: 'Monthly / periodic VAT compliance.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'pearlWhite' },
      { id: 'income-tax-ret', title: 'Income tax returns', description: 'Corporate & individual filing.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'total' },
    ],
  },
  {
    id: 'dts',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'DTS',
    title: 'Digital Tracking Solution (DTS)',
    sidebarIcon: '📡',
    services: [
      { id: 'dts-portal', title: 'DTS portal', description: 'Digital tracking for eligible cargo movements.', url: 'https://dts.go.ug/', imageKey: 'telegram' },
      { id: 'dts-info', title: 'DTS information', description: 'Related customs & domestic compliance context.', url: 'https://ura.go.ug/en/customs/', imageKey: 'blockchain' },
    ],
  },
  {
    id: 'motor-vehicle',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'Motor vehicle',
    title: 'Motor vehicle',
    sidebarIcon: '🚗',
    services: [
      { id: 'mv-ura', title: 'Motor vehicle (URA)', description: 'Search, registration & transfer hub.', url: 'https://ura.go.ug/en/domestic-taxes/motor-vehicle/', imageKey: 'uraLanding' },
      { id: 'mv-calc', title: 'Motor vehicle calculator', description: 'Duty / tax estimation tool (services portal).', url: 'https://services.ura.go.ug/faces/mv_calculator.xhtml', imageKey: 'dailyCombo' },
      { id: 'mv-refund', title: 'MV / stamp / permit refunds', description: 'Refund process for overpayments.', url: 'https://ura.go.ug/en/domestic-taxes/get-a-refund/motor-vehicle-or-stamp-duty/', imageKey: 'pearlGolden' },
    ],
  },
  {
    id: 'stamp-duty',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'Stamp duty',
    title: 'Stamp duty',
    sidebarIcon: '📜',
    services: [
      { id: 'stamp-act', title: 'Stamp Duty Act & guides', description: 'Legal instruments and rates.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'paidTrophy1' },
      { id: 'stamp-domestic', title: 'Stamp duty services', description: 'Domestic taxes — stamping guidance.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'collection' },
    ],
  },
  {
    id: 'make-payment',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'Make payment',
    title: 'Make a payment',
    sidebarIcon: '💳',
    services: [
      { id: 'prn', title: 'Generate payment slip (PRN)', description: 'Payment registration for taxes.', url: 'https://ura.go.ug/en/domestic-taxes/make-a-payment/generate-a-payment-slip/', imageKey: 'uraTreasuryCounter' },
      { id: 'payment-hub', title: 'Payment methods', description: 'Banks, mobile money & channels.', url: 'https://ura.go.ug/en/domestic-taxes/make-a-payment/', imageKey: 'dailyCombo' },
    ],
  },
  {
    id: 'get-refund',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'Get a refund',
    title: 'Get a refund',
    sidebarIcon: '💸',
    services: [
      { id: 'refund-hub', title: 'Refunds hub', description: 'Claim domestic tax refunds.', url: 'https://ura.go.ug/en/domestic-taxes/get-a-refund/', imageKey: 'pearlWhite' },
      { id: 'refund-mv', title: 'Motor vehicle / stamp refunds', description: 'Specific refund categories.', url: 'https://ura.go.ug/en/domestic-taxes/get-a-refund/motor-vehicle-or-stamp-duty/', imageKey: 'pearlGolden' },
    ],
  },
  {
    id: 'tax-agent',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'Tax agent',
    title: 'Choose a tax agent',
    sidebarIcon: '👤',
    services: [
      { id: 'tax-agent-reg', title: 'Tax agents registration', description: 'TARC registration & renewal.', url: 'https://ura.go.ug/en/tax-agents-registration/', imageKey: 'navServices' },
      { id: 'tax-agent-faq', title: 'Agent services FAQ', description: 'Appointment & domestic tax agents.', url: 'https://ura.go.ug/en/dt-faqs/agents-services/', imageKey: 'friends' },
      { id: 'tax-services', title: 'Tax services', description: 'How to register and use agents.', url: 'https://ura.go.ug/en/tax-services/', imageKey: 'earnRewardsIcon' },
    ],
  },
  {
    id: 'tax-clearance',
    groupId: 'domestic',
    groupTitle: 'Domestic taxes',
    shortLabel: 'Tax clearance',
    title: 'Tax clearance',
    sidebarIcon: '✅',
    services: [
      { id: 'clearance', title: 'Tax clearance certificate', description: 'Compliance certificates for business & tenders.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'pearlGolden' },
      { id: 'transactional-clearance', title: 'Transactional clearance', description: 'Related clearance processes on portal.', url: 'https://ura.go.ug/en/etax-login/', imageKey: 'dailyCipher' },
    ],
  },

  /* ——— Import & export ——— */
  {
    id: 'export-process',
    groupId: 'import-export',
    groupTitle: 'Import & export',
    shortLabel: 'Export',
    title: 'The export process',
    sidebarIcon: '📦',
    services: [
      { id: 'export-proc', title: 'Export procedures', description: 'Clearance, documentation & rebates.', url: 'https://ura.go.ug/en/customs/', imageKey: 'pearlWhite' },
      { id: 'customs-home', title: 'Customs home', description: 'Import, export & transit overview.', url: 'https://ura.go.ug/en/customs/', imageKey: 'uraLanding' },
    ],
  },
  {
    id: 'customs-valuation',
    groupId: 'import-export',
    groupTitle: 'Import & export',
    shortLabel: 'Valuation',
    title: 'Customs valuation',
    sidebarIcon: '🔎',
    services: [
      { id: 'valuation', title: 'Customs valuation', description: 'Transaction value, rules & disputes.', url: 'https://ura.go.ug/en/customs/', imageKey: 'mitroplus' },
      { id: 'cet', title: 'Common External Tariff', description: 'Tariff schedules & classification.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'blockchain' },
    ],
  },
  {
    id: 'aeo',
    groupId: 'import-export',
    groupTitle: 'Import & export',
    shortLabel: 'AEO',
    title: 'Authorized Economic Operator',
    sidebarIcon: '⭐',
    services: [
      { id: 'aeo-info', title: 'AEO programme', description: 'Trusted trader facilitation.', url: 'https://ura.go.ug/en/customs/', imageKey: 'paidTrophy1' },
      { id: 'trade-facilitation', title: 'Trade facilitation', description: 'Compliance & faster clearance.', url: 'https://ura.go.ug/en/customs/', imageKey: 'friends' },
    ],
  },
  {
    id: 'warehousing',
    groupId: 'import-export',
    groupTitle: 'Import & export',
    shortLabel: 'Warehousing',
    title: 'Warehousing',
    sidebarIcon: '🏭',
    services: [
      { id: 'bonded', title: 'Bonded warehouses', description: 'Licensing & suspense regimes.', url: 'https://ura.go.ug/en/customs/', imageKey: 'collection' },
      { id: 'uesw-wh', title: 'UESW & warehousing', description: 'Single window warehouse modules.', url: 'https://ura.go.ug/en/uesw/', imageKey: 'website' },
    ],
  },
  {
    id: 'uesw',
    groupId: 'import-export',
    groupTitle: 'Import & export',
    shortLabel: 'UESW',
    title: 'Uganda Electronic Single Window',
    sidebarIcon: '🪟',
    services: [
      { id: 'uesw-ura', title: 'UESW (URA)', description: 'Vision, agencies & benefits.', url: 'https://ura.go.ug/en/uesw/', imageKey: 'navServices' },
      { id: 'uesw-portal', title: 'Single Window portal', description: 'Single Transaction Portal login.', url: 'https://www.singlewindow.go.ug/', imageKey: 'telegram' },
      { id: 'uesw-faq', title: 'UESW FAQs', description: 'How to register and transact.', url: 'https://ura.go.ug/en/frequently-asked-questionsfaqs-on-the-uganda-electronic-single-windowuesw/', imageKey: 'announcements' },
    ],
  },
  {
    id: 'single-customs',
    groupId: 'import-export',
    groupTitle: 'Import & export',
    shortLabel: 'SCT',
    title: 'Single Customs Territory',
    sidebarIcon: '🌍',
    services: [
      { id: 'sct', title: 'EAC Single Customs Territory', description: 'Regional transit & coordinated borders.', url: 'https://ura.go.ug/en/customs/', imageKey: 'friends' },
      { id: 'eac-cma', title: 'EAC Customs Management Act', description: 'Legal framework downloads.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'dailyCipher' },
    ],
  },
  {
    id: 'customs-audits-refunds',
    groupId: 'import-export',
    groupTitle: 'Import & export',
    shortLabel: 'Audit/refund',
    title: 'Customs audits & refunds',
    sidebarIcon: '📋',
    services: [
      { id: 'cust-audit', title: 'Customs audits', description: 'Post-clearance audit & compliance.', url: 'https://ura.go.ug/en/customs/', imageKey: 'game' },
      { id: 'cust-refund', title: 'Customs refunds', description: 'Drawback & refund procedures.', url: 'https://ura.go.ug/en/customs/', imageKey: 'pearlGolden' },
    ],
  },
  {
    id: 'customs-enforcement',
    groupId: 'import-export',
    groupTitle: 'Import & export',
    shortLabel: 'Enforcement',
    title: 'Customs enforcement',
    sidebarIcon: '🛡️',
    services: [
      { id: 'enforcement', title: 'Enforcement & seizures', description: 'Compliance, penalties & disposal notices.', url: 'https://ura.go.ug/en/customs/', imageKey: 'pearlBlue' },
      { id: 'overstay-notice', title: 'Overstayed cargo notice', description: 'Clearance of overstayed goods.', url: 'https://ura.go.ug/en/clearance-removal-of-overstayed-motor-vehicles-at-mombasa-and-cargo-at-the-customs-warehouse/', imageKey: 'uraLanding' },
    ],
  },
  {
    id: 'customs-agent',
    groupId: 'import-export',
    groupTitle: 'Import & export',
    shortLabel: 'Cust. agent',
    title: 'Choose a customs agent',
    sidebarIcon: '🧾',
    services: [
      { id: 'clearing-agents', title: 'Clearing & forwarding', description: 'Licensed agents via URA / UESW processes.', url: 'https://ura.go.ug/en/uesw/', imageKey: 'friends' },
      { id: 'ucifa', title: 'UCIFA', description: 'Uganda Clearing Industry & Forwarding Association.', url: 'https://www.ucifa.or.ug/', imageKey: 'website' },
    ],
  },
  {
    id: 'eaccma-exemptions',
    groupId: 'import-export',
    groupTitle: 'Import & export',
    shortLabel: 'EACCMA',
    title: 'Exemptions under EACCMA',
    sidebarIcon: '📑',
    services: [
      { id: 'eaccma', title: 'EAC Customs Management Act', description: 'Remissions, exemptions & legal texts.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'dailyCipher' },
      { id: 'duty-remission', title: 'Duty remission regulations', description: 'Procedure manuals & CET.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'baseGift' },
    ],
  },

  /* ——— Legal & policy ——— */
  {
    id: 'laws-acts',
    groupId: 'legal-policy',
    groupTitle: 'Legal & policy',
    shortLabel: 'Laws & Acts',
    title: 'Laws, Acts & regulations',
    sidebarIcon: '📚',
    services: [
      { id: 'laws-archive', title: 'Laws & Acts archive', description: 'Download tax and customs legislation.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'dailyCipher' },
      { id: 'legal-policy', title: 'Legal & policy', description: 'Policies, digests and reports.', url: 'https://ura.go.ug/download-category/legal-and-policy/', imageKey: 'announcements' },
    ],
  },
  {
    id: 'case-summaries',
    groupId: 'legal-policy',
    groupTitle: 'Legal & policy',
    shortLabel: 'Case reports',
    title: 'Case summary reports',
    sidebarIcon: '⚖️',
    services: [
      { id: 'case-digest-vol', title: 'URA case digests', description: 'Published case summary volumes.', url: 'https://ura.go.ug/download-category/legal-and-policy/', imageKey: 'game' },
      { id: 'east-africa-tax', title: 'East African Tax Law Report', description: 'Regional tax jurisprudence.', url: 'https://ura.go.ug/download-category/legal-and-policy/', imageKey: 'pearlGolden' },
    ],
  },
  {
    id: 'debt-collection',
    groupId: 'legal-policy',
    groupTitle: 'Legal & policy',
    shortLabel: 'Debt',
    title: 'Debt collections',
    sidebarIcon: '💼',
    services: [
      { id: 'debt-fn', title: 'Debt collection function', description: 'URA debt management publications.', url: 'https://ura.go.ug/download-category/legal-and-policy/', imageKey: 'uraTreasuryCounter' },
      { id: 'compliance-dom', title: 'Compliance & payment plans', description: 'Regularize through domestic office.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'dailyCombo' },
    ],
  },
  {
    id: 'fia',
    groupId: 'legal-policy',
    groupTitle: 'Legal & policy',
    shortLabel: 'FIA',
    title: 'Financial Intelligence Authority',
    sidebarIcon: '🏛️',
    services: [
      { id: 'fia-portal', title: 'FIA Uganda', description: 'AML / CFT national authority.', url: 'https://fia.go.ug/', imageKey: 'blockchain' },
      { id: 'aml-act', title: 'Anti-Money Laundering Act', description: 'Related legal downloads (URA archive).', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'pearlBlue' },
    ],
  },
  {
    id: 'dtaa',
    groupId: 'legal-policy',
    groupTitle: 'Legal & policy',
    shortLabel: 'DTAA',
    title: 'Double taxation agreements',
    sidebarIcon: '🌐',
    services: [
      { id: 'dtaa-ura', title: 'Treaties & international tax', description: 'DTAA and cross-border guidance.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'friends' },
      { id: 'mutual-assist', title: 'Mutual administrative assistance', description: 'International tax cooperation acts.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'website' },
    ],
  },
  {
    id: 'delegated-authority',
    groupId: 'legal-policy',
    groupTitle: 'Legal & policy',
    shortLabel: 'Delegated',
    title: 'Delegated competent authority',
    sidebarIcon: '✒️',
    services: [
      { id: 'delegated', title: 'Certificates & origin', description: 'Preferential origin & competent authority.', url: 'https://ura.go.ug/en/customs/', imageKey: 'collection' },
      { id: 'rules-origin', title: 'Rules of origin', description: 'EAC rules of origin instruments.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'mitroplus' },
    ],
  },

  /* ——— Opportunities ——— */
  {
    id: 'careers',
    groupId: 'opportunities',
    groupTitle: 'Opportunities',
    shortLabel: 'Careers',
    title: 'Careers',
    sidebarIcon: '👔',
    services: [
      { id: 'careers-ura', title: 'Careers at URA', description: 'Jobs and professional growth.', url: 'https://ura.go.ug/en/opportunities/careers/', imageKey: 'paidTrophy1' },
      { id: 'ura-home', title: 'URA home', description: 'News and institution overview.', url: 'https://www.ura.go.ug/', imageKey: 'navServices' },
    ],
  },
  {
    id: 'e-learning',
    groupId: 'opportunities',
    groupTitle: 'Opportunities',
    shortLabel: 'E-Learning',
    title: 'URA E-Learning',
    sidebarIcon: '🎓',
    services: [
      { id: 'elearning-page', title: 'E-Learning platform', description: 'Courses for taxpayers and staff.', url: 'https://ura.go.ug/en/opportunities/e-learning-platform/', imageKey: 'earnRewardsIcon' },
      { id: 'elearning-lms', title: 'URA LMS', description: 'Direct Moodle / learning access.', url: 'https://elearning.ura.go.ug/', imageKey: 'zoom' },
    ],
  },
  {
    id: 'tenders',
    groupId: 'opportunities',
    groupTitle: 'Opportunities',
    shortLabel: 'Tenders',
    title: 'Tenders',
    sidebarIcon: '📋',
    services: [
      { id: 'tenders-ura', title: 'URA tenders', description: 'Procurement & supplier portal.', url: 'https://ura.go.ug/en/opportunities/tenders/', imageKey: 'announcements' },
    ],
  },
  {
    id: 'auctions',
    groupId: 'opportunities',
    groupTitle: 'Opportunities',
    shortLabel: 'Auctions',
    title: 'Auctions',
    sidebarIcon: '🔨',
    services: [
      { id: 'auctions-ura', title: 'URA auctions', description: 'Asset disposal & ADMS.', url: 'https://ura.go.ug/en/opportunities/auctions/', imageKey: 'game' },
      { id: 'auction-apply', title: 'Auction application', description: 'Bidding platform access.', url: 'https://ura.go.ug/en/opportunities/auctions/auctioning-application/', imageKey: 'uraTreasuryCounter' },
      { id: 'public-auction', title: 'Public online auction', description: 'Customs & general auctions info.', url: 'https://ura.go.ug/en/import-export/public-online-auction/', imageKey: 'uraLanding' },
    ],
  },

  /* ——— Research & publications ——— */
  {
    id: 'research-lab',
    groupId: 'research',
    groupTitle: 'Research & publications',
    shortLabel: 'Research lab',
    title: 'Research lab',
    sidebarIcon: '🔬',
    services: [
      { id: 'research-hub', title: 'Research & publications', description: 'URA research hub landing.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'mitroplus' },
    ],
  },
  {
    id: 'corporate-plans',
    groupId: 'research',
    groupTitle: 'Research & publications',
    shortLabel: 'Corp. plans',
    title: 'Corporate plans',
    sidebarIcon: '📈',
    services: [
      { id: 'corp-plans', title: 'Corporate plans', description: 'Strategic and corporate planning docs.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'total' },
    ],
  },
  {
    id: 'research-bulletins',
    groupId: 'research',
    groupTitle: 'Research & publications',
    shortLabel: 'Bulletins',
    title: 'Research bulletins',
    sidebarIcon: '📰',
    services: [
      { id: 'bulletins', title: 'Research bulletins', description: 'Analytical bulletins & briefs.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'announcements' },
    ],
  },
  {
    id: 'revenue-performance',
    groupId: 'research',
    groupTitle: 'Research & publications',
    shortLabel: 'Revenue',
    title: 'Revenue performance reports',
    sidebarIcon: '💹',
    services: [
      { id: 'rev-perf', title: 'Revenue performance', description: 'Collections and performance reporting.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'pearlGolden' },
    ],
  },
  {
    id: 'statistics',
    groupId: 'research',
    groupTitle: 'Research & publications',
    shortLabel: 'Statistics',
    title: 'Statistics',
    sidebarIcon: '📊',
    services: [
      { id: 'stats', title: 'Official statistics', description: 'Revenue and trade statistics.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'dailyCipher' },
    ],
  },
  {
    id: 'strategic-docs',
    groupId: 'research',
    groupTitle: 'Research & publications',
    shortLabel: 'Strategy',
    title: 'Strategic documents',
    sidebarIcon: '🎯',
    services: [
      { id: 'strategic', title: 'Strategic documents', description: 'Plans and policy strategy papers.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'baseGift' },
    ],
  },
  {
    id: 'trade-reports',
    groupId: 'research',
    groupTitle: 'Research & publications',
    shortLabel: 'Trade',
    title: 'Trade reports',
    sidebarIcon: '🚢',
    services: [
      { id: 'trade-rep', title: 'Trade reports', description: 'Import/export and trade analysis.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'uraLanding' },
    ],
  },
  {
    id: 'innovations',
    groupId: 'research',
    groupTitle: 'Research & publications',
    shortLabel: 'Innovation',
    title: 'Innovations',
    sidebarIcon: '💡',
    services: [
      { id: 'innovation', title: 'Innovation & digital', description: 'Modernization initiatives (eTax, UESW, EFRIS).', url: 'https://www.ura.go.ug/', imageKey: 'blockchain' },
      { id: 'reap', title: 'REAP / e-tax programme', description: 'Finance ministry accountability programme.', url: 'https://reap.finance.go.ug/e-tax/', imageKey: 'website' },
    ],
  },

  /* ——— Useful links ——— */
  {
    id: 'link-mofped',
    groupId: 'useful-links',
    groupTitle: 'Useful links',
    shortLabel: 'MoFPED',
    title: 'Ministry of Finance, Planning & Economic Development',
    sidebarIcon: '🏛️',
    services: [
      { id: 'mofped', title: 'MoFPED', description: 'National economic & budget policy.', url: 'https://www.finance.go.ug/', imageKey: 'navServices' },
    ],
  },
  {
    id: 'link-uesw',
    groupId: 'useful-links',
    groupTitle: 'Useful links',
    shortLabel: 'UESW portal',
    title: 'Uganda Electronic Single Window',
    sidebarIcon: '🪟',
    services: [
      { id: 'sw-portal', title: 'singlewindow.go.ug', description: 'National single window transaction portal.', url: 'https://www.singlewindow.go.ug/', imageKey: 'telegram' },
    ],
  },
  {
    id: 'link-investor',
    groupId: 'useful-links',
    groupTitle: 'Useful links',
    shortLabel: 'Investors',
    title: 'Investor protection',
    sidebarIcon: '🤝',
    services: [
      { id: 'cma', title: 'Capital Markets Authority', description: 'Uganda capital markets regulator.', url: 'https://www.cmauganda.co.ug/', imageKey: 'pearlBlue' },
      { id: 'uia', title: 'Uganda Investment Authority', description: 'Investment promotion & business support.', url: 'https://www.uia.go.ug/', imageKey: 'friends' },
    ],
  },
  {
    id: 'link-eac',
    groupId: 'useful-links',
    groupTitle: 'Useful links',
    shortLabel: 'EAC',
    title: 'East African Customs Union',
    sidebarIcon: '🌍',
    services: [
      { id: 'eac', title: 'East African Community', description: 'Customs union & regional integration.', url: 'https://www.eac.int/', imageKey: 'friends' },
    ],
  },
  {
    id: 'link-ucifa',
    groupId: 'useful-links',
    groupTitle: 'Useful links',
    shortLabel: 'UCIFA',
    title: 'Uganda Clearing Industry & Forwarding Association',
    sidebarIcon: '🚛',
    services: [
      { id: 'ucifa-link', title: 'UCIFA', description: 'Industry association for clearing & forwarding.', url: 'https://www.ucifa.or.ug/', imageKey: 'uraLanding' },
    ],
  },
  {
    id: 'link-more',
    groupId: 'useful-links',
    groupTitle: 'Useful links',
    shortLabel: 'More links',
    title: 'More related links',
    sidebarIcon: '🔗',
    services: [
      { id: 'ura-contact', title: 'Contact URA', description: 'Offices and helpdesk.', url: 'https://www.ura.go.ug/en/contact-us/', imageKey: 'zoom' },
      { id: 'tax-education', title: 'Tax education', description: 'Public taxpayer education.', url: 'https://ura.go.ug/en/tax-education/', imageKey: 'earnRewardsIcon' },
      { id: 'ura-sitemap', title: 'URA website', description: 'Browse all sections on ura.go.ug.', url: 'https://www.ura.go.ug/', imageKey: 'website' },
    ],
  },
];

export const URA_SERVICES_DEFAULT_CATEGORY_ID = URA_SERVICE_CATEGORIES[0]?.id ?? 'get-tin';
