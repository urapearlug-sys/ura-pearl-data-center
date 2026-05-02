/**
 * URA Services hub — six top-level sidebar buckets; each opens a full grid of links.
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
  shortLabel: string;
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
  {
    id: 'domestic',
    groupId: 'domestic',
    shortLabel: 'Domestic',
    title: 'Domestic taxes & taxpayer services',
    sidebarIcon: '🏛️',
    services: [
      {
        id: 'tax-calculator',
        title: 'Tax calculator',
        description: 'Estimate VAT at 18% (standard rated) in UGX.',
        url: 'https://ura.go.ug/en/domestic-taxes/',
        imageKey: 'total',
        inApp: 'tax-calculator',
      },
      { id: 'tin-apply', title: 'Get a TIN', description: 'Registration for individuals & businesses.', url: 'https://ura.go.ug/en/domestic-taxes/tin-application/', imageKey: 'dailyReward' },
      { id: 'etax-login', title: 'eTax portal', description: 'Log in with TIN — returns, payments, services.', url: 'https://ura.go.ug/en/etax-login/', imageKey: 'uraTreasuryCounter' },
      { id: 'efris', title: 'EFRIS hub', description: 'E-invoicing & fiscal receipting.', url: 'https://ura.go.ug/en/efris/', imageKey: 'collection' },
      { id: 'efris-reg', title: 'EFRIS registration', description: 'First-time setup & OTP.', url: 'https://ura.go.ug/en/efris/efris-registration/', imageKey: 'earnRewardsIcon' },
      { id: 'efris-login', title: 'EFRIS login', description: 'Portal & desktop client.', url: 'https://ura.go.ug/en/efris/efris-login/', imageKey: 'dailyCipher' },
      { id: 'efris-handbook', title: 'EFRIS handbook', description: 'Operational reference.', url: 'https://ura.go.ug/en/efris-handbook/', imageKey: 'announcements' },
      { id: 'incentives', title: 'Tax incentives & exemptions', description: 'Investment incentives framework.', url: 'https://ura.go.ug/en/domestic-taxes/tax-exemption/', imageKey: 'baseGift' },
      { id: 'wht-agents', title: 'Designated WHT agents', description: 'Published lists (e.g. FY designations).', url: 'https://ura.go.ug/en/domestic-taxes/tax-exemption/designated-income-tax-wht-agents-for-fy-2024-25/', imageKey: 'pearlBlue' },
      { id: 'domestic-hub', title: 'Domestic taxes overview', description: 'All domestic tax types.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'uraFiscalFunBanner' },
      { id: 'objections', title: 'Objections & appeals', description: 'Disputes and appellate routes.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'game' },
      { id: 'tax-appeals-act', title: 'Tax Appeals Tribunals Act', description: 'Legal framework (downloads).', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'dailyCipher' },
      { id: 'case-digest-dom', title: 'Case digests', description: 'Summaries & policy notes.', url: 'https://ura.go.ug/download-category/legal-and-policy/', imageKey: 'pearlGolden' },
      { id: 'e-returns', title: 'File e-returns', description: 'Online return filing.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'dailyCipher' },
      { id: 'vat-returns', title: 'VAT returns', description: 'Periodic VAT compliance.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'pearlWhite' },
      { id: 'income-tax-ret', title: 'Income tax returns', description: 'Corporate & individual filing.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'total' },
      { id: 'dts-portal', title: 'DTS portal', description: 'Digital tracking (eligible cargo).', url: 'https://dts.go.ug/', imageKey: 'telegram' },
      { id: 'dts-info', title: 'DTS & customs context', description: 'Related clearance information.', url: 'https://ura.go.ug/en/customs/', imageKey: 'blockchain' },
      { id: 'mv-ura', title: 'Motor vehicle (URA)', description: 'Search, registration & transfer.', url: 'https://ura.go.ug/en/domestic-taxes/motor-vehicle/', imageKey: 'uraLanding' },
      { id: 'mv-calc', title: 'Motor vehicle calculator', description: 'Duty / tax estimation.', url: 'https://services.ura.go.ug/faces/mv_calculator.xhtml', imageKey: 'dailyCombo' },
      { id: 'mv-refund', title: 'MV / stamp / permit refunds', description: 'Refund process.', url: 'https://ura.go.ug/en/domestic-taxes/get-a-refund/motor-vehicle-or-stamp-duty/', imageKey: 'pearlGolden' },
      { id: 'stamp-act', title: 'Stamp duty (Acts)', description: 'Legislation & instruments.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'paidTrophy1' },
      { id: 'stamp-domestic', title: 'Stamp duty services', description: 'Domestic stamping guidance.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'collection' },
      { id: 'prn', title: 'Generate payment slip (PRN)', description: 'Payment registration.', url: 'https://ura.go.ug/en/domestic-taxes/make-a-payment/generate-a-payment-slip/', imageKey: 'uraTreasuryCounter' },
      { id: 'payment-hub', title: 'Make a payment', description: 'Banks & payment channels.', url: 'https://ura.go.ug/en/domestic-taxes/make-a-payment/', imageKey: 'dailyCombo' },
      { id: 'refund-hub', title: 'Get a refund', description: 'Domestic tax refunds.', url: 'https://ura.go.ug/en/domestic-taxes/get-a-refund/', imageKey: 'pearlWhite' },
      { id: 'tax-agent-reg', title: 'Tax agents registration', description: 'TARC registration & renewal.', url: 'https://ura.go.ug/en/tax-agents-registration/', imageKey: 'navServices' },
      { id: 'tax-agent-faq', title: 'Tax agent FAQ', description: 'Appointment & licensed agents.', url: 'https://ura.go.ug/en/dt-faqs/agents-services/', imageKey: 'friends' },
      { id: 'tax-services', title: 'Tax services', description: 'Using agents on the portal.', url: 'https://ura.go.ug/en/tax-services/', imageKey: 'earnRewardsIcon' },
      { id: 'clearance', title: 'Tax clearance certificate', description: 'Compliance for tenders & business.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'pearlGolden' },
    ],
  },
  {
    id: 'import-export',
    groupId: 'import-export',
    shortLabel: 'Trade',
    title: 'Import, export & customs',
    sidebarIcon: '🚢',
    services: [
      { id: 'customs-home', title: 'Customs home', description: 'Import, export & transit.', url: 'https://ura.go.ug/en/customs/', imageKey: 'uraLanding' },
      { id: 'export-proc', title: 'Export procedures', description: 'Documentation & rebates.', url: 'https://ura.go.ug/en/customs/', imageKey: 'pearlWhite' },
      { id: 'valuation', title: 'Customs valuation', description: 'Transaction value & rules.', url: 'https://ura.go.ug/en/customs/', imageKey: 'mitroplus' },
      { id: 'cet', title: 'Common External Tariff', description: 'Classification & schedules.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'blockchain' },
      { id: 'aeo-info', title: 'Authorized Economic Operator', description: 'Trusted trader programme.', url: 'https://ura.go.ug/en/customs/', imageKey: 'paidTrophy1' },
      { id: 'bonded', title: 'Warehousing & bonds', description: 'Bonded warehouses & suspense.', url: 'https://ura.go.ug/en/customs/', imageKey: 'collection' },
      { id: 'uesw-ura', title: 'Uganda Electronic Single Window', description: 'UESW overview (URA).', url: 'https://ura.go.ug/en/uesw/', imageKey: 'navServices' },
      { id: 'uesw-portal', title: 'Single Window portal', description: 'singlewindow.go.ug — STP login.', url: 'https://www.singlewindow.go.ug/', imageKey: 'telegram' },
      { id: 'uesw-faq', title: 'UESW FAQs', description: 'How to register and transact.', url: 'https://ura.go.ug/en/frequently-asked-questionsfaqs-on-the-uganda-electronic-single-windowuesw/', imageKey: 'announcements' },
      { id: 'sct', title: 'Single Customs Territory', description: 'EAC regional transit.', url: 'https://ura.go.ug/en/customs/', imageKey: 'friends' },
      { id: 'eaccma', title: 'EACCMA & duty remission', description: 'Legal texts & remissions.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'dailyCipher' },
      { id: 'cust-audit', title: 'Customs audits', description: 'Post-clearance compliance.', url: 'https://ura.go.ug/en/customs/', imageKey: 'game' },
      { id: 'cust-refund', title: 'Customs refunds', description: 'Drawback & refunds.', url: 'https://ura.go.ug/en/customs/', imageKey: 'pearlGolden' },
      { id: 'enforcement', title: 'Customs enforcement', description: 'Compliance & seizures.', url: 'https://ura.go.ug/en/customs/', imageKey: 'pearlBlue' },
      { id: 'overstay-notice', title: 'Overstayed cargo notice', description: 'Clear overstayed goods.', url: 'https://ura.go.ug/en/clearance-removal-of-overstayed-motor-vehicles-at-mombasa-and-cargo-at-the-customs-warehouse/', imageKey: 'uraLanding' },
      { id: 'clearing-agents', title: 'Clearing & forwarding', description: 'Licensed agents & UESW.', url: 'https://ura.go.ug/en/uesw/', imageKey: 'friends' },
      { id: 'ucifa', title: 'UCIFA', description: 'Clearing & forwarding association.', url: 'https://www.ucifa.or.ug/', imageKey: 'website' },
      { id: 'public-auction', title: 'Public customs auction', description: 'Online auction information.', url: 'https://ura.go.ug/en/import-export/public-online-auction/', imageKey: 'game' },
    ],
  },
  {
    id: 'legal-policy',
    groupId: 'legal-policy',
    shortLabel: 'Legal',
    title: 'Legal & policy',
    sidebarIcon: '⚖️',
    services: [
      { id: 'laws-archive', title: 'Laws, Acts & regulations', description: 'Download tax & customs law.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'dailyCipher' },
      { id: 'legal-policy-cat', title: 'Legal & policy library', description: 'Digests, debt function & reports.', url: 'https://ura.go.ug/download-category/legal-and-policy/', imageKey: 'announcements' },
      { id: 'case-digest', title: 'Case summary reports', description: 'URA case digests & volumes.', url: 'https://ura.go.ug/download-category/legal-and-policy/', imageKey: 'game' },
      { id: 'east-africa-tax', title: 'East African Tax Law Report', description: 'Regional jurisprudence.', url: 'https://ura.go.ug/download-category/legal-and-policy/', imageKey: 'pearlGolden' },
      { id: 'debt-fn', title: 'Debt collections', description: 'Debt collection function publications.', url: 'https://ura.go.ug/download-category/legal-and-policy/', imageKey: 'uraTreasuryCounter' },
      { id: 'fia-portal', title: 'Financial Intelligence Authority', description: 'National AML/CFT authority.', url: 'https://fia.go.ug/', imageKey: 'blockchain' },
      { id: 'aml-act', title: 'Anti-Money Laundering Act', description: 'Related legal downloads.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'pearlBlue' },
      { id: 'dtaa', title: 'Double taxation agreements', description: 'Treaties & international tax.', url: 'https://ura.go.ug/en/domestic-taxes/', imageKey: 'friends' },
      { id: 'mutual-assist', title: 'Mutual administrative assistance', description: 'International cooperation.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'website' },
      { id: 'delegated', title: 'Delegated competent authority', description: 'Origin & certificates.', url: 'https://ura.go.ug/en/customs/', imageKey: 'collection' },
      { id: 'rules-origin', title: 'Rules of origin', description: 'EAC instruments.', url: 'https://ura.go.ug/download-category/laws-and-acts/', imageKey: 'mitroplus' },
    ],
  },
  {
    id: 'opportunities',
    groupId: 'opportunities',
    shortLabel: 'Careers',
    title: 'Opportunities',
    sidebarIcon: '💼',
    services: [
      { id: 'careers-ura', title: 'Careers at URA', description: 'Jobs and recruitment.', url: 'https://ura.go.ug/en/opportunities/careers/', imageKey: 'paidTrophy1' },
      { id: 'elearning-page', title: 'URA E-Learning', description: 'Courses for taxpayers & staff.', url: 'https://ura.go.ug/en/opportunities/e-learning-platform/', imageKey: 'earnRewardsIcon' },
      { id: 'elearning-lms', title: 'URA LMS (Moodle)', description: 'Direct learning platform.', url: 'https://elearning.ura.go.ug/', imageKey: 'zoom' },
      { id: 'tenders-ura', title: 'Tenders', description: 'Procurement & suppliers.', url: 'https://ura.go.ug/en/opportunities/tenders/', imageKey: 'announcements' },
      { id: 'auctions-ura', title: 'Auctions', description: 'Asset disposal & ADMS.', url: 'https://ura.go.ug/en/opportunities/auctions/', imageKey: 'game' },
      { id: 'auction-apply', title: 'Auction application', description: 'Bidding platform.', url: 'https://ura.go.ug/en/opportunities/auctions/auctioning-application/', imageKey: 'uraTreasuryCounter' },
      { id: 'auction-notice', title: 'Electronic auction notices', description: 'Disposal notices.', url: 'https://ura.go.ug/en/notice-for-disposal-of-assets-by-electronic-auctioning/', imageKey: 'uraLanding' },
    ],
  },
  {
    id: 'research',
    groupId: 'research',
    shortLabel: 'Research',
    title: 'Research & publications',
    sidebarIcon: '📊',
    services: [
      { id: 'research-hub', title: 'Research & publications', description: 'Lab, plans, bulletins hub.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'mitroplus' },
      { id: 'corp-plans', title: 'Corporate plans', description: 'Strategic corporate documents.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'total' },
      { id: 'bulletins', title: 'Research bulletins', description: 'Analytical briefs.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'announcements' },
      { id: 'rev-perf', title: 'Revenue performance reports', description: 'Collections reporting.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'pearlGolden' },
      { id: 'stats', title: 'Statistics', description: 'Official revenue & trade stats.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'dailyCipher' },
      { id: 'strategic', title: 'Strategic documents', description: 'Policy strategy papers.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'baseGift' },
      { id: 'trade-rep', title: 'Trade reports', description: 'Import/export analysis.', url: 'https://ura.go.ug/en/research-publications/', imageKey: 'uraLanding' },
      { id: 'innovation', title: 'Innovations & digital', description: 'Modernization (eTax, UESW, EFRIS).', url: 'https://www.ura.go.ug/', imageKey: 'blockchain' },
      { id: 'reap', title: 'REAP / e-tax programme', description: 'Finance ministry programme.', url: 'https://reap.finance.go.ug/e-tax/', imageKey: 'website' },
      { id: 'tax-education', title: 'Tax education', description: 'Public taxpayer learning.', url: 'https://ura.go.ug/en/tax-education/', imageKey: 'earnRewardsIcon' },
    ],
  },
  {
    id: 'useful-links',
    groupId: 'useful-links',
    shortLabel: 'Links',
    title: 'Useful links',
    sidebarIcon: '🔗',
    services: [
      { id: 'mofped', title: 'Ministry of Finance (MoFPED)', description: 'National economic policy.', url: 'https://www.finance.go.ug/', imageKey: 'navServices' },
      { id: 'sw-portal', title: 'Uganda Electronic Single Window', description: 'singlewindow.go.ug portal.', url: 'https://www.singlewindow.go.ug/', imageKey: 'telegram' },
      { id: 'cma', title: 'Capital Markets Authority', description: 'Investor-facing regulator.', url: 'https://www.cmauganda.co.ug/', imageKey: 'pearlBlue' },
      { id: 'uia', title: 'Uganda Investment Authority', description: 'Investment promotion.', url: 'https://www.uia.go.ug/', imageKey: 'friends' },
      { id: 'eac', title: 'East African Community', description: 'Customs union & integration.', url: 'https://www.eac.int/', imageKey: 'friends' },
      { id: 'ucifa-link', title: 'UCIFA', description: 'Clearing industry association.', url: 'https://www.ucifa.or.ug/', imageKey: 'uraLanding' },
      { id: 'ura-contact', title: 'Contact URA', description: 'Offices & helpdesk.', url: 'https://www.ura.go.ug/en/contact-us/', imageKey: 'zoom' },
      { id: 'ura-sitemap', title: 'URA website', description: 'Full site directory.', url: 'https://www.ura.go.ug/', imageKey: 'website' },
    ],
  },
];

export const URA_SERVICES_DEFAULT_CATEGORY_ID = URA_SERVICE_CATEGORIES[0]?.id ?? 'domestic';
