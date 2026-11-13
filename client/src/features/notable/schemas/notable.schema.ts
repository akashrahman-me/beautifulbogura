export const FIELDS = [
  ['politics', 'রাজনীতি'], ['literature', 'সাহিত্য ও সংস্কৃতি'], ['education', 'শিক্ষা'], ['liberation', 'মুক্তিযুদ্ধ'], ['sports', 'খেলাধুলা'], ['social', 'সমাজসেবা'],
] as const;
export type NotableField = (typeof FIELDS)[number][0];
export const fieldLabel = (f: string) => FIELDS.find(([v]) => v === f)?.[1] ?? f;

/** A biography post. `body` is plain text; blank lines separate paragraphs. */
export interface NotablePerson {
  id: string;
  name: string;
  /** One-line identity, e.g. “ভাষাসৈনিক ও শিক্ষাবিদ”. */
  title: string;
  field: NotableField;
  born: string | null;
  died: string | null;
  photo: string | null;
  excerpt: string;
  body: string;
}

export type NotableSummary = Omit<NotablePerson, 'body'>;

export interface NotableListParams {
  field?: NotableField;
  search?: string;
}
