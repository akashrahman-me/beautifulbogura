import { z } from 'zod';
import { honeypot, phoneField } from '@/lib/validation';

export const INSTITUTION_TYPES = [
  ['primary', 'প্রাথমিক বিদ্যালয়'], ['secondary', 'মাধ্যমিক বিদ্যালয়'], ['college', 'কলেজ'], ['madrasa', 'মাদ্রাসা'],
  ['university', 'বিশ্ববিদ্যালয়'], ['technical', 'কারিগরি'], ['kindergarten', 'কিন্ডারগার্টেন'],
] as const;
export type InstitutionType = (typeof INSTITUTION_TYPES)[number][0];
export const institutionTypeLabel = (t: string) => INSTITUTION_TYPES.find(([v]) => v === t)?.[1] ?? t;

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  eiin: string;
  founder: string;
  established: string;
  area: string;
  union: string;
  phone: string;
  address: string;
  website: string;
  about: string;
  image: string | null;
  lat: number;
  lng: number;
  claimed: boolean;
}

export interface Notice {
  id: string;
  institutionId: string;
  institutionName: string;
  title: string;
  body: string;
  link: string;
  createdAt: string;
}

export interface InstitutionListParams {
  type?: InstitutionType;
  search?: string;
}

export const addInstitutionSchema = z.object({
  name: z.string().trim().min(3, 'প্রতিষ্ঠানের নাম লিখুন'),
  type: z.enum(INSTITUTION_TYPES.map(([v]) => v) as [InstitutionType, ...InstitutionType[]], { message: 'ধরন বেছে নিন' }),
  eiin: z.string().trim().regex(/^(\d{6})?$/, 'ইআইআইএন ৬ সংখ্যার হয়').optional(),
  founder: z.string().trim().optional(),
  established: z.string().trim().optional(),
  union: z.string().trim().optional(),
  phone: z.union([z.literal(''), phoneField]).optional(),
  address: z.string().trim().min(3, 'ঠিকানা লিখুন'),
  site: z.union([z.literal(''), z.url('সঠিক ওয়েবসাইট লিংক দিন')]).optional(),
  about: z.string().trim().max(800).optional(),
  submitter: z.string().trim().min(2, 'আপনার নাম লিখুন'),
  website: honeypot,
});
export type AddInstitutionIn = z.input<typeof addInstitutionSchema>;
export type AddInstitutionInput = z.output<typeof addInstitutionSchema>;

export const CLAIM_ROLES = ['প্রধান শিক্ষক', 'অধ্যক্ষ', 'সহকারী শিক্ষক', 'পরিচালনা কমিটির সদস্য', 'অফিস সহকারী'];

export const claimSchema = z.object({
  name: z.string().trim().min(2, 'নাম লিখুন'),
  role: z.string().min(1, 'পদ বেছে নিন'),
  phone: phoneField,
  email: z.union([z.literal(''), z.email('সঠিক ইমেইল লিখুন')]).optional(),
  proof: z.string().trim().min(10, 'কীভাবে যাচাই করা যাবে লিখুন, যেমন: প্রতিষ্ঠানের অফিস নম্বর'),
  website: honeypot,
});
export type ClaimIn = z.input<typeof claimSchema>;
export type ClaimInput = z.output<typeof claimSchema>;
