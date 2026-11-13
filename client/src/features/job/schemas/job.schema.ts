import { z } from 'zod';
import { honeypot, phoneField, pinField } from '@/lib/validation';
import type { ListParams } from '@/types/api';

export interface Job {
  id: string;
  company: string;
  title: string;
  vacancies: number;
  salary: string;
  education: string;
  details: string;
  phone: string;
  whatsapp: boolean;
  address: string;
  image: string | null;
  deadline: string;
  createdAt: string;
  status: 'active' | 'done' | 'deleted';
}

export type JobListParams = ListParams;

export const DURATIONS = ['7', '15', '20', '30'] as const;

export const createJobSchema = z.object({
  company: z.string().trim().min(2, 'প্রতিষ্ঠানের নাম লিখুন'),
  title: z.string().trim().min(2, 'পদের নাম লিখুন'),
  vacancies: z.string().transform((v) => Number(v.replace(/[^0-9০-৯]/g, '').replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))))).refine((n) => n >= 1, 'পদের সংখ্যা লিখুন'),
  salary: z.string().trim().min(1, 'বেতন লিখুন, অথবা “আলোচনা সাপেক্ষে”'),
  deadline: z.string().min(1, 'আবেদনের শেষ তারিখ দিন').refine((v) => new Date(v).getTime() >= new Date().setHours(0, 0, 0, 0), 'আজ বা পরের তারিখ দিন'),
  education: z.string().trim().optional(),
  details: z.string().trim().min(10, 'কাজ, অভিজ্ঞতা ও শর্ত সংক্ষেপে লিখুন'),
  phone: phoneField,
  whatsapp: z.boolean(),
  address: z.string().trim().min(2, 'ঠিকানা লিখুন'),
  duration: z.enum(DURATIONS),
  pin: pinField,
  images: z.array(z.instanceof(File)).max(1).optional(),
  website: honeypot,
});
export type CreateJobIn = z.input<typeof createJobSchema>;
export type CreateJobInput = z.output<typeof createJobSchema>;
