/** Four warehousing questions — complaint / URA help must stay last. */
export const WAREHOUSING_SURVEY_QUESTIONS = [
  {
    id: 'facilities',
    text: 'Were the warehouse facilities clean, secure, and well maintained?',
  },
  {
    id: 'handling',
    text: 'Was goods handling and storage done professionally and on time?',
  },
  {
    id: 'procedures',
    text: 'Were bond and customs warehousing procedures clearly explained to you?',
  },
  {
    id: 'ura_help',
    text: 'In case of any complaint, would you like URA to help you?',
  },
] as const;

export type WarehousingSurveyAnswers = {
  warehouseName: string;
  warehouseNumber: string;
  experienceFriendly: 'friendly' | 'not_friendly' | null;
  questionAnswers: Record<string, boolean | null>;
  stars: number;
  comment: string;
};
