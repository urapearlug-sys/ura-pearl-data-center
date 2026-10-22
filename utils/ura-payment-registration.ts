/** URA payment registration (generate-a-payment-slip) — simplified in-app mirror. */

export const URA_TAX_HEAD_CATEGORIES = [
  {
    id: 'ntr-tax-type',
    label: 'NTR Tax Type (IT, VAT, Excise, Withholding, Gaming Tax etc)',
  },
  { id: 'other-ntr', label: 'Other NTR' },
  { id: 'penalties', label: 'Penalties for Non-Compliance' },
] as const;

export type UraTaxHeadCategoryId = (typeof URA_TAX_HEAD_CATEGORIES)[number]['id'];

/** Tax Head * options when category is NTR Tax Type (URA portal / user screenshot). */
export const URA_NTR_TAX_HEADS = [
  'Gaming Tax',
  'Good Cause Tax',
  'Gross Domestic Payment',
  'IT-Digital Service Tax',
  'Imposition of Penalties for Non-Compliance',
  'Income Tax',
  'Income Tax - Advance Tax for Motor Vehicle',
  'Income Tax - Small Businesses',
  'Income tax - Rental',
  'Local Excise Duty',
  'PAYE',
  'Stamp Duty',
  'VAT on Imported Services',
  'VAT-Digital Service Tax',
  'VAT-Withheld',
  'Value Added Tax',
  'Withholding Tax',
] as const;

export type UraNtrTaxHead = (typeof URA_NTR_TAX_HEADS)[number];

export const URA_BASIS_OF_PAYMENT = [
  'Return',
  'Assessment',
  'Audit',
  'Account Payment',
  '30% TAT Payment',
  'Reminder / Agency Notice or Other Enforcement Measure (NOD,WOD etc)',
  'Penalty Payment',
] as const;

export type UraBasisOfPayment = (typeof URA_BASIS_OF_PAYMENT)[number];

export const URA_CURRENCY_TYPES = ['UGANDA SHILLINGS', 'US DOLLAR'] as const;

/** Sample MDAs for Other NTR (portal has full list). */
export const URA_OTHER_NTR_MDA = [
  'MINISTRY OF FINANCE PLANNING AND ECONOMIC DEVELOPMENT',
  'MINISTRY OF WORKS AND TRANSPORT(NEW)',
  'UGANDA REGISTRATION SERVICES BUREAU',
  'DIRECTORATE OF CITIZENSHIP AND IMMIGRATION CONTROL(NATIONAL CITIZENSHIP AND IMMIGRATION CONTROL)',
  'NATIONAL LOTTERIES AND GAMING REGULATORY BOARD',
  'UGANDA REVENUE AUTHORITY',
  'Other MDA',
] as const;

export const URA_DISTRICTS = [
  'KAMPALA',
  'WAKISO',
  'MUKONO',
  'JINJA',
  'MBARARA',
  'GULU',
  'LIRA',
  'MBALE',
  'ARUA',
  'MASAKA',
  'ABIM',
  'ADJUMANI',
  'AGAGO',
  'ALEBTONG',
  'AMOLATAR',
  'AMUDAT',
  'AMURIA',
  'AMURU',
  'APAC',
  'BUDAKA',
  'BUDUDA',
  'BUGIRI',
  'BUHWEJU',
  'BUIKWE',
  'BUKEDEA',
  'BUKOMANSIMBI',
  'BUKWO',
  'BULAMBULI',
  'BULIISA',
  'BUNDIBUGYO',
  'BUNYANGABU',
  'BUSHENYI',
  'BUSIA',
  'BUTALEJA',
  'BUTAMBALA',
  'BUTEBO',
  'BUVUMA',
  'BUYENDE',
  'DOKOLO',
  'GOMBA',
  'HOIMA',
  'IBANDA',
  'IGANGA',
  'ISINGIRO',
  'KAABONG',
  'KABALE',
  'KABAROLE',
  'KABERAMAIDO',
  'KAGADI',
  'KAKUMIRO',
  'KALANGALA',
  'KALIRO',
  'KALUNGU',
  'KAMULI',
  'KAMWENGE',
  'KANUNGU',
  'KAPCHORWA',
  'KASANDA',
  'KASESE',
  'KATAKWI',
  'KAYUNGA',
  'KIBAALE',
  'KIBOGA',
  'KIBUKU',
  'KIRUHURA',
  'KIRYANDONGO',
  'KISORO',
  'KITGUM',
  'KOBOKO',
  'KOLE',
  'KOTIDO',
  'KUMI',
  'KWEEN',
  'KYANKWANZI',
  'KYEGEGWA',
  'KYENJOJO',
  'KYOTERA',
  'LAMWO',
  'LUUKA',
  'LUWEERO',
  'LWENGO',
  'LYANTONDE',
  'MANAFWA',
  'MARACHA',
  'MASINDI',
  'MAYUGE',
  'MITOOMA',
  'MITYANA',
  'MOROTO',
  'MOYO',
  'MPIGI',
  'MUBENDE',
  'NAKAPIRIPIRIT',
  'NAKASEKE',
  'NAKASONGOLA',
  'NAMAYINGO',
  'NAMISINDWA',
  'NAMUTUMBA',
  'NAPAK',
  'NEBBI',
  'NGORA',
  'NTOROKO',
  'NTUNGAMO',
  'NWOYA',
  'OMORO',
  'OTUKE',
  'OYAM',
  'PADER',
  'PAKWACH',
  'PALLISA',
  'RAKAI',
  'RUBANDA',
  'RUBIRIZI',
  'RUKIGA',
  'RUKUNGIRI',
  'SERERE',
  'SHEEMA',
  'SIRONKO',
  'SOROTI',
  'SEMBABULE',
  'TORORO',
  'YUMBE',
  'ZOMBO',
] as const;

export type RegistrationPreset = {
  taxHeadCategory: UraTaxHeadCategoryId;
  taxHead: UraNtrTaxHead | '';
  basisOfPayment: UraBasisOfPayment;
  period: string;
};

/** Step 1 tile → step 2 defaults (URA Tax Head + basis). */
export function registrationPresetForPayItem(itemId: string): RegistrationPreset {
  switch (itemId) {
    case 'vat':
      return {
        taxHeadCategory: 'ntr-tax-type',
        taxHead: 'Value Added Tax',
        basisOfPayment: 'Return',
        period: 'Q1',
      };
    case 'paye':
      return {
        taxHeadCategory: 'ntr-tax-type',
        taxHead: 'PAYE',
        basisOfPayment: 'Return',
        period: 'January',
      };
    case 'customs':
      return {
        taxHeadCategory: 'ntr-tax-type',
        taxHead: 'VAT on Imported Services',
        basisOfPayment: 'Assessment',
        period: 'Annual',
      };
    case 'ntr':
      return {
        taxHeadCategory: 'other-ntr',
        taxHead: '',
        basisOfPayment: 'Account Payment',
        period: 'Annual',
      };
    case 'motor':
      return {
        taxHeadCategory: 'ntr-tax-type',
        taxHead: 'Income Tax - Advance Tax for Motor Vehicle',
        basisOfPayment: 'Return',
        period: 'Annual',
      };
    case 'stamp':
      return {
        taxHeadCategory: 'ntr-tax-type',
        taxHead: 'Stamp Duty',
        basisOfPayment: 'Return',
        period: 'Annual',
      };
    case 'withholding':
      return {
        taxHeadCategory: 'ntr-tax-type',
        taxHead: 'Withholding Tax',
        basisOfPayment: 'Return',
        period: 'Q1',
      };
    case 'penalties':
      return {
        taxHeadCategory: 'penalties',
        taxHead: 'Imposition of Penalties for Non-Compliance',
        basisOfPayment: 'Penalty Payment',
        period: 'Annual',
      };
    case 'income-tax':
    default:
      return {
        taxHeadCategory: 'ntr-tax-type',
        taxHead: 'Income Tax',
        basisOfPayment: 'Return',
        period: 'Annual',
      };
  }
}

export function taxHeadsForCategory(category: UraTaxHeadCategoryId): readonly string[] {
  if (category === 'penalties') return ['Imposition of Penalties for Non-Compliance'];
  if (category === 'other-ntr') return ['Gross Domestic Payment'];
  return URA_NTR_TAX_HEADS;
}
