import { z } from 'zod';
import { BD_MOBILE, latin } from '@/lib/utils';

export interface Chamber {
  hospital: string;
  /** 0 = Sunday … 6 = Saturday */
  days: number[];
  time: string;
  serial?: string;
  fee?: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  degrees: string[];
  phone: string;
  photo: string | null;
  about?: string;
  chambers: Chamber[];
  /** Computed by the API from chamber days — never typed by the submitter. */
  sittingToday: boolean;
}

export interface DoctorStats {
  total: number;
  sittingToday: number;
  specialties: { name: string; count: number }[];
}

export interface DoctorListParams {
  search?: string;
  specialty?: string;
  today?: boolean;
}

export const SPECIALTIES = [
  'মেডিসিন', 'শিশু', 'গাইনি', 'হৃদরোগ', 'নাক-কান-গলা', 'দন্ত', 'অর্থোপেডিক', 'চর্ম ও যৌন', 'মানসিক', 'চক্ষু', 'নিউরোলজি', 'নিউরোসার্জারি',
  'কিডনি', 'ইউরোলজি', 'লিভার ও পরিপাকতন্ত্র', 'বক্ষব্যাধি', 'ডায়াবেটিস ও হরমোন', 'ক্যান্সার', 'জেনারেল সার্জারি', 'শিশু সার্জারি', 'প্লাস্টিক সার্জারি',
  'বাতজ্বর ও বাতব্যথা', 'ফিজিক্যাল মেডিসিন', 'পুষ্টি', 'রেডিওলজি', 'প্যাথলজি', 'অ্যানেসথেসিয়া', 'হেমাটোলজি', 'হোমিওপ্যাথি', 'ইউনানি', 'আয়ুর্বেদ',
  'ফিজিওথেরাপি', 'সাধারণ চিকিৎসক', 'অন্যান্য',
];

export const DEGREES = ['MBBS', 'BDS', 'FCPS', 'MD', 'MS', 'FRCS', 'MRCP', 'DCH', 'DGO', 'DDV', 'DO', 'MPH', 'BCS (স্বাস্থ্য)', 'DHMS', 'অন্যান্য'];

const phone = z
  .string()
  .transform((v) => latin(v).replace(/[^0-9]/g, ''))
  .refine((v) => BD_MOBILE.test(v), '১১ সংখ্যার মোবাইল নম্বর লিখুন (০১…)');

export const chamberSchema = z.object({
  hospital: z.string().trim().min(2, 'হাসপাতাল বা চেম্বারের নাম লিখুন'),
  days: z.array(z.number().int().min(0).max(6)).min(1, 'অন্তত একটি দিন বেছে নিন'),
  time: z.string().trim().min(2, 'সময় লিখুন, যেমন: বিকেল ৪টা – রাত ৯টা'),
  serial: z.string().optional().or(z.literal('')),
  fee: z.string().optional().or(z.literal('')),
});

export const createDoctorSchema = z
  .object({
    name: z.string().trim().min(3, 'ডাক্তারের পুরো নাম লিখুন'),
    specialty: z.string().min(1, 'বিশেষজ্ঞতা বেছে নিন'),
    specialtyOther: z.string().trim().optional(),
    degrees: z.array(z.string()),
    degreesOther: z.string().trim().optional(),
    phone,
    chambers: z.array(chamberSchema).min(1, 'অন্তত একটি চেম্বার যুক্ত করুন'),
    website: z.string().max(0).optional(), // honeypot
  })
  .refine((v) => v.specialty !== 'অন্যান্য' || (v.specialtyOther ?? '').length > 1, { path: ['specialtyOther'], message: 'বিশেষজ্ঞতা লিখুন' });

export type CreateDoctorIn = z.input<typeof createDoctorSchema>;
export type CreateDoctorInput = z.output<typeof createDoctorSchema>;
