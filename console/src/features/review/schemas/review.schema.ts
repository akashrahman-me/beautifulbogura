import type { ListQuery } from '@/types/api';

export const SUBMISSION_KINDS = [
  { value: 'doctor', label: 'ডাক্তার' },
  { value: 'directory', label: 'তালিকার তথ্য' },
  { value: 'institution', label: 'শিক্ষা প্রতিষ্ঠান' },
  { value: 'claim', label: 'প্রতিষ্ঠানের দাবি' },
] as const;
export type SubmissionKind = (typeof SUBMISSION_KINDS)[number]['value'];
export const kindLabel = (k: string) => SUBMISSION_KINDS.find((x) => x.value === k)?.label ?? k;

/** Something the public sent in that waits for a staff decision before it appears on the site. */
export interface Submission {
  id: string;
  kind: SubmissionKind;
  status: 'pending' | 'approved' | 'rejected';
  title: string;
  /** One line under the title in the queue, e.g. “শিশু বিশেষজ্ঞ · ২টি চেম্বার”. */
  summary: string;
  submittedAt: string;
  submitter: { name: string; phone: string | null; userId: string | null };
  /** The submitted fields as sent; the approver may edit plain fields before approving. */
  data: Record<string, unknown>;
  /** For directory submissions: which list. */
  directoryType: string | null;
  decidedAt: string | null;
  decidedBy: string | null;
  reason: string | null;
  /** Earlier submissions from the same phone that were rejected — a hint for spam. */
  priorRejections: number;
}

export interface SubmissionQuery extends ListQuery {
  kind?: SubmissionKind;
  status?: Submission['status'];
}

/** Bangla labels for submitted field keys. Unknown keys show as-is. */
export const FIELD_LABELS: Record<string, string> = {
  name: 'নাম', specialty: 'বিশেষজ্ঞতা', degrees: 'ডিগ্রি', phone: 'মোবাইল', chambers: 'চেম্বার', role: 'পদবি বা ধরন', whatsapp: 'হোয়াটসঅ্যাপ',
  address: 'ঠিকানা', hours: 'সময়', description: 'বিবরণ', mapUrl: 'ম্যাপ লিংক', type: 'ধরন', eiin: 'ইআইআইএন', founder: 'প্রতিষ্ঠাতা',
  established: 'প্রতিষ্ঠা', union: 'ইউনিয়ন', website: 'ওয়েবসাইট', about: 'পরিচিতি', institution: 'প্রতিষ্ঠান', email: 'ইমেইল', proof: 'প্রমাণ',
  photo: 'ছবি', fee: 'ফি',
};

export const REJECT_REASONS = ['তথ্য অসম্পূর্ণ', 'ভুল বা যাচাই করা যায়নি', 'আগেই তালিকায় আছে', 'বিজ্ঞাপন বা স্প্যাম', 'অনুপযুক্ত বিষয়বস্তু'];
