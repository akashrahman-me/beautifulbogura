import { z } from 'zod';
import { BD_MOBILE, latin } from '@/lib/utils';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

/** Days after a whole-blood donation before someone can give again. */
export const DONATION_GAP_DAYS = 120;

export type DonorStatus = 'ready' | 'not-yet' | 'unknown';

export interface Donor {
  id: string;
  name: string;
  group: BloodGroup;
  phone: string;
  address: string;
  lastDonation: string | null;
}

export interface DonorStats {
  total: number;
  byGroup: Partial<Record<BloodGroup, number>>;
  ready: number;
  notYet: number;
  unknown: number;
}

export interface DonorListParams {
  group?: BloodGroup;
  status?: DonorStatus;
  search?: string;
}

const phone = z
  .string()
  .transform((v) => latin(v).replace(/[^0-9]/g, ''))
  .refine((v) => BD_MOBILE.test(v), '১১ সংখ্যার মোবাইল নম্বর লিখুন (০১…)');

const pastDate = z
  .string()
  .optional()
  .refine((v) => !v || new Date(v).getTime() <= Date.now(), 'আজকের পরের তারিখ দেওয়া যাবে না');

export const registerDonorSchema = z.object({
  name: z.string().trim().min(3, 'পুরো নাম লিখুন'),
  phone,
  group: z.enum(BLOOD_GROUPS, { message: 'রক্তের গ্রুপ বেছে নিন' }),
  lastDonation: pastDate,
  address: z.string().trim().min(3, 'এলাকার নাম লিখুন'),
  website: z.string().max(0).optional(),
});
export type RegisterDonorIn = z.input<typeof registerDonorSchema>;
export type RegisterDonorInput = z.output<typeof registerDonorSchema>;

export const updateDonationSchema = z.object({
  phone,
  lastDonation: z.string().min(1, 'তারিখ বেছে নিন').refine((v) => new Date(v).getTime() <= Date.now(), 'আজকের পরের তারিখ দেওয়া যাবে না'),
});
export type UpdateDonationIn = z.input<typeof updateDonationSchema>;
export type UpdateDonationInput = z.output<typeof updateDonationSchema>;
