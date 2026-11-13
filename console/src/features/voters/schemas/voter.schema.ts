import type { ListQuery } from '@/types/api';

export interface Voter {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  voterNo: string;
  dob: string;
  gender: 'male' | 'female' | 'third';
  union: string;
  village: string;
  centre: string;
}

export interface VoterQuery extends ListQuery {
  union?: string;
}

export interface VoterStats {
  total: number;
  byUnion: { union: string; total: number; male: number; female: number; third: number }[];
  lastImport: VoterImport | null;
}

export interface VoterImport {
  id: string;
  at: string;
  by: string;
  file: string;
  imported: number;
  updated: number;
  skipped: number;
  /** First rows that failed, with the reason. */
  errors: { row: number; message: string }[];
}

/** Columns the CSV must have, in any order. One row per voter; `voterNo` is the key (re-import updates). */
export const CSV_COLUMNS = ['voterNo', 'name', 'fatherName', 'motherName', 'dob', 'gender', 'union', 'village', 'centre'];
