import { z } from 'zod';
import { honeypot, phoneField } from '@/lib/validation';
import type { ListParams } from '@/types/api';

export const GENDERS = [['bride', 'পাত্রী'], ['groom', 'পাত্র']] as const;
export const RELIGIONS = [['islam', 'ইসলাম'], ['hindu', 'হিন্দু'], ['buddhist', 'বৌদ্ধ'], ['christian', 'খ্রিস্টান'], ['other', 'অন্যান্য']] as const;
export const MARITAL = [['unmarried', 'অবিবাহিত'], ['divorced', 'তালাকপ্রাপ্ত'], ['widowed', 'বিধবা / বিপত্নীক']] as const;
export const EDUCATION = ['জেএসসি', 'এসএসসি', 'এইচএসসি', 'ডিপ্লোমা', 'স্নাতক', 'স্নাতকোত্তর', 'অন্যান্য'] as const;

export type Gender = (typeof GENDERS)[number][0];
export type Religion = (typeof RELIGIONS)[number][0];
export type MaritalStatus = (typeof MARITAL)[number][0];
const label = (list: readonly (readonly [string, string])[]) => (v: string) => list.find(([k]) => k === v)?.[1] ?? v;
export const genderLabel = label(GENDERS);
export const religionLabel = label(RELIGIONS);
export const maritalLabel = label(MARITAL);

/** Legal minimum marriage age in Bangladesh (Child Marriage Restraint Act 2017). */
export const MIN_AGE: Record<Gender, number> = { bride: 18, groom: 21 };

export interface Matrimonial {
  id: string;
  ownerId: string;
  gender: Gender;
  name: string;
  birthYear: number;
  religion: Religion;
  maritalStatus: MaritalStatus;
  education: string;
  profession: string;
  familyMembers: string;
  preference: string;
  address: string;
  phone: string;
  whatsapp: boolean;
  photo: string | null;
  createdAt: string;
  status: 'active' | 'done' | 'deleted';
}

export interface MatrimonyListParams extends ListParams {
  gender?: Gender;
  religion?: Religion;
}

const thisYear = new Date().getFullYear();

export const createMatrimonySchema = z
  .object({
    gender: z.enum(['bride', 'groom'], { error: 'পাত্র না পাত্রী বেছে নিন' }),
    name: z.string().trim().min(2, 'পূর্ণ নাম লিখুন'),
    birthYear: z.string().min(4, 'জন্ম সাল বেছে নিন'),
    religion: z.enum(['islam', 'hindu', 'buddhist', 'christian', 'other'], { error: 'ধর্ম বেছে নিন' }),
    maritalStatus: z.enum(['unmarried', 'divorced', 'widowed'], { error: 'বৈবাহিক অবস্থা বেছে নিন' }),
    education: z.string().min(1, 'শিক্ষাগত যোগ্যতা বেছে নিন'),
    profession: z.string().trim().min(2, 'পেশা লিখুন'),
    familyMembers: z.string().trim().min(2, 'পরিবারের সদস্যদের তথ্য লিখুন'),
    preference: z.string().trim().min(5, 'কেমন জীবনসঙ্গী চান, লিখুন'),
    address: z.string().trim().min(2, 'ঠিকানা লিখুন'),
    phone: phoneField,
    whatsapp: z.boolean(),
    images: z.array(z.instanceof(File)).max(1).optional(),
    truthful: z.boolean().refine((v) => v, 'তথ্য সঠিক হলে টিক দিন'),
    website: honeypot,
  })
  .superRefine((v, ctx) => {
    if (v.birthYear && thisYear - Number(v.birthYear) < MIN_AGE[v.gender]) {
      ctx.addIssue({ code: 'custom', path: ['birthYear'], message: `${v.gender === 'bride' ? 'পাত্রীর' : 'পাত্রের'} বয়স অন্তত ${MIN_AGE[v.gender] === 18 ? '১৮' : '২১'} বছর হতে হবে` });
    }
  });
export type CreateMatrimonyIn = z.input<typeof createMatrimonySchema>;
export type CreateMatrimonyInput = z.output<typeof createMatrimonySchema>;
