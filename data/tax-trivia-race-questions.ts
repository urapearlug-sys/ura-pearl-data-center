export type TaxTriviaRaceQuestion = {
  id: string;
  questionText: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explain: string;
};

/** Uganda tax trivia — multiple choice for timed quiz race. */
export const TAX_TRIVIA_RACE_POOL: TaxTriviaRaceQuestion[] = [
  {
    id: 'tt1',
    questionText: 'What does TIN stand for in URA context?',
    options: ['Tax Identification Number', 'Trade Invoice Number', 'Total Income Notice', 'Treasury Index Number'],
    correctIndex: 0,
    explain: 'TIN identifies taxpayers for registration and filing.',
  },
  {
    id: 'tt2',
    questionText: 'A PRN is mainly used to…',
    options: ['Pay URA taxes and fees', 'Register a new company only', 'Apply for a passport', 'Vote in elections'],
    correctIndex: 0,
    explain: 'Payment Registration Numbers link payments to the right tax head.',
  },
  {
    id: 'tt3',
    questionText: 'PAYE is typically withheld by…',
    options: ['The employer', 'The employee at year-end only', 'Banks on all withdrawals', 'Local councils'],
    correctIndex: 0,
    explain: 'Employers deduct PAYE from salaries and remit to URA.',
  },
  {
    id: 'tt4',
    questionText: 'VAT stands for…',
    options: ['Value Added Tax', 'Variable Asset Tariff', 'Verified Annual Total', 'Vendor Account Tax'],
    correctIndex: 0,
    explain: 'VAT is charged on taxable supplies by registered persons.',
  },
  {
    id: 'tt5',
    questionText: 'EFRIS in Uganda relates to…',
    options: ['Electronic fiscal invoicing / reporting', 'Export freight insurance', 'Employee fitness records', 'Environmental fees'],
    correctIndex: 0,
    explain: 'EFRIS supports electronic invoicing for eligible taxpayers.',
  },
  {
    id: 'tt6',
    questionText: 'Rental income for landlords is generally…',
    options: ['Taxable when earned', 'Always exempt', 'Taxed only for foreigners', 'Paid only in USD'],
    correctIndex: 0,
    explain: 'Rental income must be declared and taxed according to the law.',
  },
  {
    id: 'tt7',
    questionText: 'Missing a tax return deadline can lead to…',
    options: ['Penalties and interest', 'Automatic citizenship', 'Free PRN generation forever', 'No consequences'],
    correctIndex: 0,
    explain: 'Late filing and payment attract penalties under tax law.',
  },
  {
    id: 'tt8',
    questionText: 'Withholding tax is…',
    options: ['Tax deducted at source on certain payments', 'A tax paid only on imports', 'A lottery tax', 'Optional for all businesses'],
    correctIndex: 0,
    explain: 'WHT is deducted by the payer on specified transactions.',
  },
  {
    id: 'tt9',
    questionText: 'Customs duties are mainly collected on…',
    options: ['Imported goods at the border', 'Salaries only', 'School fees', 'Domestic rent only'],
    correctIndex: 0,
    explain: 'Customs applies to imports (and some exports) per URA customs law.',
  },
  {
    id: 'tt10',
    questionText: 'A tax invoice helps because it…',
    options: ['Documents a taxable supply and VAT', 'Replaces a TIN', 'Guarantees a loan', 'Is only for NGOs'],
    correctIndex: 0,
    explain: 'Proper invoices support VAT compliance and audits.',
  },
  {
    id: 'tt11',
    questionText: 'Excise duty often applies to…',
    options: ['Specific goods like alcohol or fuel', 'All salary payments', 'Free health services', 'Passport photos'],
    correctIndex: 0,
    explain: 'Excise targets listed products and services.',
  },
  {
    id: 'tt12',
    questionText: 'Tax evasion means…',
    options: ['Illegal non-payment or under-declaration', 'Paying early for a discount', 'Using mobile money', 'Filing on time'],
    correctIndex: 0,
    explain: 'Evasion is deliberate breaking of tax law.',
  },
];

export const TAX_TRIVIA_RACE_CONFIG = {
  questionsPerRace: 8,
  secondsPerQuestion: 12,
  basePearlsPerCorrect: 20,
  streakBonusPearls: 10,
  streakEvery: 3,
  speedBonusPearls: 5,
  speedBonusThresholdSec: 5,
} as const;
