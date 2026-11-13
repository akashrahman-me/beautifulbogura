export interface FreedomFighter {
  id: string;
  name: string;
  fatherName: string;
  /** Gazette / MIS number. */
  idNo: string;
  village: string;
  union: string;
  /** e.g. “৭ নম্বর সেক্টর”; null when not recorded. */
  sector: string | null;
  alive: boolean;
  photo: string | null;
}

export interface FreedomFighterListParams {
  union?: string;
  search?: string;
}
