import { z } from 'zod';
import { bdPhone, honeypot, idParams, imageUrl, optionalBdPhone, queryBool } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

const chamber = z.object({
  hospital: z.string().trim().min(2, 'হাসপাতাল বা চেম্বারের নাম লিখুন').max(150),
  days: z.array(z.number().int().min(0).max(6)).min(1, 'অন্তত একটি দিন বেছে নিন').max(7),
  time: z.string().trim().min(2, 'সময় লিখুন').max(80),
  serial: optionalBdPhone,
  fee: z.number().int().min(0).max(100000).nullable().optional().transform((v) => v ?? null),
});

export const listDoctorsSchema = z.object({ query: listQuery(50, 12).extend({ specialty: z.string().max(60).optional(), today: queryBool }) });
export const doctorIdSchema = idParams;

/** Public “add a doctor” form — goes to review. */
export const submitDoctorSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3, 'ডাক্তারের নাম লিখুন').max(120),
    specialty: z.string().trim().min(2, 'বিশেষজ্ঞতা বেছে নিন').max(60),
    degrees: z.array(z.string().trim().max(40)).max(15).default([]),
    phone: bdPhone,
    chambers: z.array(chamber).min(1, 'অন্তত একটি চেম্বার যুক্ত করুন').max(6),
    website: honeypot,
  }),
});

export const adminBody = z.object({
  name: z.string().trim().min(3).max(120),
  specialty: z.string().trim().min(2).max(60),
  degrees: z.array(z.string().trim().max(40)).max(15).default([]),
  phone: optionalBdPhone,
  about: z.string().trim().max(1000).default(''),
  photo: imageUrl.nullable().default(null),
  chambers: z.array(chamber).min(1).max(6),
  verified: z.boolean().default(false),
  hidden: z.boolean().default(false),
});
export const adminFilters = z.object({ specialty: z.string().max(60).optional() });
