export type LearnLessonSeed = {
  title: string;
  content: string;
};

export type LearnCategorySeed = {
  slug: string;
  title: string;
  icon: string;
  summary: string;
  topics: string[];
  lessons: LearnLessonSeed[];
  sortOrder: number;
  enabled?: boolean;
};

export const LEARN_CATEGORY_DEFAULTS: LearnCategorySeed[] = [
  {
    slug: 'general-tax',
    title: 'General Tax Information',
    icon: 'i',
    summary: 'Understand core tax concepts, compliance basics, and taxpayer rights.',
    topics: ['Taxpayer rights', 'Tax obligations', 'Important deadlines'],
    lessons: [
      { title: 'Tax basics', content: 'Understand what taxes fund and why timely compliance matters.' },
      { title: 'Key deadlines', content: 'Track filing and payment deadlines to avoid penalties.' },
    ],
    sortOrder: 1,
  },
  {
    slug: 'agriculture',
    title: 'Agriculture',
    icon: 'a',
    summary: 'Tax guidance for farming businesses, cooperatives, and agro suppliers.',
    topics: ['Input VAT', 'Farmer records', 'Produce sales taxes'],
    lessons: [{ title: 'Farm recordkeeping', content: 'Keep clean records for inputs, sales, and transport costs.' }],
    sortOrder: 2,
  },
  {
    slug: 'construction',
    title: 'Construction',
    icon: 'c',
    summary: 'Manage construction-related tax duties for projects and contractors.',
    topics: ['Withholding tax', 'Project invoicing', 'Equipment deductions'],
    lessons: [{ title: 'Project tax workflow', content: 'Set invoice and withholding controls by project milestone.' }],
    sortOrder: 3,
  },
  {
    slug: 'education',
    title: 'Education',
    icon: 'e',
    summary: 'School and training center obligations, fees, and compliance rules.',
    topics: ['Education fees', 'Institution filings', 'Payroll taxes'],
    lessons: [{ title: 'Institution compliance', content: 'Map fee categories and payroll taxes to regular filings.' }],
    sortOrder: 4,
  },
  {
    slug: 'entertainment',
    title: 'Entertainment',
    icon: 'n',
    summary: 'Tax matters for events, creators, venues, and media businesses.',
    topics: ['Event income', 'Ticketing taxes', 'Creator taxation'],
    lessons: [{ title: 'Event revenue taxes', content: 'Separate sponsorship, ticket sales, and service income clearly.' }],
    sortOrder: 5,
  },
  {
    slug: 'fishing',
    title: 'Fishing',
    icon: 'f',
    summary: 'Tax literacy for fishing operations, traders, and processing entities.',
    topics: ['Catch reporting', 'Cold-chain costs', 'Trade documentation'],
    lessons: [{ title: 'Fishing operations', content: 'Use consistent purchase and supply records for tax reporting.' }],
    sortOrder: 6,
  },
  {
    slug: 'health',
    title: 'Health',
    icon: 'h',
    summary: 'Tax and documentation guidance for clinics, pharmacies, and services.',
    topics: ['Medical supplies', 'Service billing', 'Health payroll'],
    lessons: [{ title: 'Clinic billing and records', content: 'Align service billing records with filing periods.' }],
    sortOrder: 7,
  },
  {
    slug: 'hospitality',
    title: 'Hospitality',
    icon: 'r',
    summary: 'Hospitality-specific taxation for hotels, tourism, and food services.',
    topics: ['Hotel tax setup', 'Tour fees', 'Seasonal compliance'],
    lessons: [{ title: 'Hospitality tax setup', content: 'Define service categories and automate recurring declarations.' }],
    sortOrder: 8,
  },
  {
    slug: 'manufacturing',
    title: 'Manufacturing',
    icon: 'm',
    summary: 'Production-sector tax handling, cost tracking, and reporting routines.',
    topics: ['Raw material VAT', 'Inventory controls', 'Factory filings'],
    lessons: [{ title: 'Factory records', content: 'Reconcile materials, finished goods, and tax invoices monthly.' }],
    sortOrder: 9,
  },
  {
    slug: 'mining',
    title: 'Mining',
    icon: 'g',
    summary: 'Tax overview for mining entities, licenses, and exports.',
    topics: ['Mineral royalties', 'License obligations', 'Export taxes'],
    lessons: [{ title: 'Mining compliance', content: 'Track royalties and license milestones alongside exports.' }],
    sortOrder: 10,
  },
  {
    slug: 'real-estate',
    title: 'Real Estate',
    icon: 'u',
    summary: 'Property taxation, rental declarations, and transfer tax guidance.',
    topics: ['Rental income', 'Property transfer', 'Agency records'],
    lessons: [{ title: 'Property tax flow', content: 'Separate rental, sale, and management income streams.' }],
    sortOrder: 11,
  },
  {
    slug: 'transportation',
    title: 'Transportation',
    icon: 't',
    summary: 'Tax responsibilities for logistics, public transport, and fleet firms.',
    topics: ['Fuel records', 'Fleet expenses', 'Route-based reporting'],
    lessons: [{ title: 'Fleet reporting', content: 'Maintain route, fuel, and maintenance logs for compliance.' }],
    sortOrder: 12,
  },
  {
    slug: 'oil-gas',
    title: 'Oil and Gas',
    icon: 'o',
    summary: 'Industry taxation touchpoints across exploration, supply, and retail.',
    topics: ['Sector compliance', 'Import duties', 'Retail declarations'],
    lessons: [{ title: 'Oil and gas filing', content: 'Document imports, distribution, and retail declarations clearly.' }],
    sortOrder: 13,
  },
  {
    slug: 'wholesale-retail',
    title: 'Wholesale & Retail',
    icon: 'w',
    summary: 'Learn transaction tracking and tax duties for shops and distributors.',
    topics: ['Sales records', 'Stock controls', 'E-receipt usage'],
    lessons: [{ title: 'Retail controls', content: 'Use stock movement and e-receipt data to support returns.' }],
    sortOrder: 14,
  },
  {
    slug: 'investors',
    title: 'Investors',
    icon: 'v',
    summary: 'Tax education for investment planning and returns compliance.',
    topics: ['Investment income', 'Capital gains', 'Compliance checklist'],
    lessons: [{ title: 'Investment taxation', content: 'Review returns by asset class and filing treatment.' }],
    sortOrder: 15,
  },
  {
    slug: 'tax-curriculum',
    title: 'Tax Curriculum',
    icon: 'q',
    summary: 'Structured learning path from beginner to advanced tax literacy.',
    topics: ['Beginner modules', 'Practice quizzes', 'Progress milestones'],
    lessons: [{ title: 'Curriculum progression', content: 'Complete modules in sequence and track milestones.' }],
    sortOrder: 16,
  },
  {
    slug: 'government-agencies',
    title: 'Government Agencies',
    icon: 's',
    summary: 'How agencies coordinate on compliance, reporting, and public services.',
    topics: ['Agency roles', 'Data sharing', 'Public service workflow'],
    lessons: [{ title: 'Agency coordination', content: 'Understand roles and escalation channels for compliance support.' }],
    sortOrder: 17,
  },
  {
    slug: 'digital-services',
    title: 'Digital Services',
    icon: 'd',
    summary: 'Tax obligations for online businesses, apps, and platform income.',
    topics: ['Online invoicing', 'Digital subscriptions', 'Cross-border services'],
    lessons: [{ title: 'Digital platform tax', content: 'Classify online revenue and maintain digital audit trails.' }],
    sortOrder: 18,
  },
  {
    slug: 'small-business',
    title: 'Small Business',
    icon: 'b',
    summary: 'Practical tax guidance for startups and growing SMEs.',
    topics: ['Business registration', 'Simple bookkeeping', 'Monthly filing routine'],
    lessons: [{ title: 'SME tax routine', content: 'Build a monthly checklist for filings and bookkeeping.' }],
    sortOrder: 19,
  },
];
