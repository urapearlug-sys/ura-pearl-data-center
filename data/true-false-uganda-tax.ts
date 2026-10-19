export type TrueFalseQuestion = {
  id: string;
  statement: string;
  isTrue: boolean;
  explain: string;
};

/** In-app True or False – Uganda Tax Edition (simulated education, not official rulings). */
export const TRUE_FALSE_UGANDA_TAX: TrueFalseQuestion[] = [
  {
    id: 'tf1',
    statement: 'Every taxpayer in Uganda must have a TIN to file domestic tax returns.',
    isTrue: true,
    explain: 'A TIN identifies taxpayers for registration, filing, and payments.',
  },
  {
    id: 'tf2',
    statement: 'A PRN is only used for customs declarations, never for domestic tax payments.',
    isTrue: false,
    explain: 'PRNs are used across many URA payment channels, including domestic taxes.',
  },
  {
    id: 'tf3',
    statement: 'VAT-registered businesses generally charge VAT on taxable supplies.',
    isTrue: true,
    explain: 'VAT-registered suppliers charge VAT and claim input tax where allowed.',
  },
  {
    id: 'tf4',
    statement: 'PAYE is deducted by employees themselves and paid only once a year.',
    isTrue: false,
    explain: 'Employers withhold PAYE from salaries and remit it according to the schedule.',
  },
  {
    id: 'tf5',
    statement: 'EFRIS helps track electronic invoicing for eligible taxpayers.',
    isTrue: true,
    explain: 'EFRIS is URA’s electronic fiscal reporting / invoicing system.',
  },
  {
    id: 'tf6',
    statement: 'You never need a receipt when paying taxes if you remember the amount.',
    isTrue: false,
    explain: 'Keep payment evidence (PRN slip/receipt) for records and disputes.',
  },
  {
    id: 'tf7',
    statement: 'Customs duties may apply when importing goods into Uganda.',
    isTrue: true,
    explain: 'Import clearance can involve duties, VAT, and other border charges.',
  },
  {
    id: 'tf8',
    statement: 'Whistle-blowing tax fraud is discouraged and never rewarded.',
    isTrue: false,
    explain: 'URA encourages reporting non-compliance through official channels.',
  },
];

export const TRUE_FALSE_REWARD_WHITE = 150;
