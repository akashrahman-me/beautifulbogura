export interface Voter {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  voterNo: string;
  /** ISO date (yyyy-mm-dd). */
  dob: string;
  gender: 'male' | 'female' | 'third';
  union: string;
  village: string;
  /** Polling centre for this voter's area. */
  centre: string;
}

/**
 * The server answers only when at least one narrowing filter is given — a name / voter-number
 * search of 3+ characters, a date of birth or a birth year — so the roll cannot be paged through.
 */
export interface VoterLookupParams {
  union?: string;
  search?: string;
  dob?: string;
  birthYear?: string;
}

export const hasLookupFilter = (p: VoterLookupParams) => (p.search?.length ?? 0) >= 3 || !!p.dob || !!p.birthYear;
