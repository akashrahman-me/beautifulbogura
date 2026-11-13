export const CADRES = [
  ['admin', 'প্রশাসন'], ['police', 'পুলিশ'], ['foreign', 'পররাষ্ট্র'], ['health', 'স্বাস্থ্য'], ['education', 'শিক্ষা'],
  ['customs', 'শুল্ক ও আবগারি'], ['tax', 'কর'], ['engineering', 'প্রকৌশল'], ['agriculture', 'কৃষি'], ['judicial', 'বিচার'], ['other', 'অন্যান্য'],
] as const;
export type Cadre = (typeof CADRES)[number][0];
export const cadreLabel = (c: string) => CADRES.find(([v]) => v === c)?.[1] ?? c;

/** A successful son or daughter of the upazila — BCS cadres and others in public service. */
export interface Achiever {
  id: string;
  name: string;
  cadre: Cadre;
  /** BCS batch, e.g. “৩৫তম”; null for non-BCS. */
  batch: string | null;
  post: string;
  workplace: string;
  village: string;
  union: string;
  photo: string | null;
}

export interface AchieverListParams {
  cadre?: Cadre;
  search?: string;
}
