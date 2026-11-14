import { z } from 'zod';
import { listQuery } from '@/utils/pagination';

/** Public lookup: never the whole roll — a 3+ character search, a date of birth or a birth year is required. */
export const lookupSchema = z.object({
  query: listQuery(50)
    .extend({ union: z.string().max(60).optional(), dob: z.iso.date().optional(), birthYear: z.string().regex(/^(19|20)\d{2}$/).optional() })
    .refine((q) => (q.search?.length ?? 0) >= 3 || q.dob || q.birthYear, { path: ['search'], message: 'নাম, ভোটার নম্বর বা জন্ম তারিখ দিন' }),
});
/** Staff search: 3+ characters, always audited. */
export const adminSearchSchema = z.object({
  query: listQuery(100).extend({ union: z.string().max(60).optional() }).refine((q) => (q.search?.length ?? 0) >= 3, { path: ['search'], message: 'অন্তত ৩ অক্ষর লিখুন' }),
});
export const CSV_COLUMNS = ['voterNo', 'name', 'fatherName', 'motherName', 'dob', 'gender', 'union', 'village', 'centre'] as const;
