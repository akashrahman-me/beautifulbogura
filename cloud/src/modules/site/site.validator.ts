import { z } from 'zod';
import { bdPhone, optionalBdPhone, optionalUrl } from '@/utils/defineRoutes';

const days = z.number().int().min(1).max(365);
const sitePath = z.string().trim().max(300).regex(/^(\/[^\s]*|https?:\/\/\S+)?$/, 'সাইটের পাতা (/blood-bank) বা পুরো লিংক দিন');

export const settingsSchema = z.object({
  body: z.object({
    contact: z.object({ adminPhone: bdPhone, email: z.union([z.literal(''), z.email()]) }),
    social: z.object({ facebook: optionalUrl, whatsapp: optionalUrl, telegram: optionalUrl, tiktok: optionalUrl, youtube: optionalUrl }),
    posting: z.object({ jobDurations: z.array(days).min(1).max(8), rentalDays: days, tuitionDays: days, vehicleDays: days, matrimonyDays: days, maxPhotos: z.number().int().min(1).max(10), postsPerDay: z.number().int().min(1).max(100) }),
    moderation: z.object({ autoHideAfterReports: z.number().int().min(1).max(100), reviewSlaHours: z.number().int().min(1).max(720) }),
    maintenance: z.object({ enabled: z.boolean(), message: z.string().trim().max(300) }),
  }),
});

export const noticeSchema = z.object({
  body: z
    .object({
      enabled: z.boolean(),
      severity: z.enum(['info', 'warning', 'emergency']),
      title: z.string().trim().max(120),
      body: z.string().trim().max(500),
      linkLabel: z.string().trim().max(60),
      linkHref: sitePath,
      expiresAt: z.iso.datetime({ offset: true }).nullable(),
    })
    .refine((v) => !v.enabled || v.title.length >= 4, { path: ['title'], message: 'চালু করতে শিরোনাম লিখুন' }),
});

const stat = z.object({ label: z.string().trim().min(1).max(60), value: z.string().trim().min(1).max(60) });
const contact = z.object({ role: z.string().trim().min(2).max(80), name: z.string().trim().min(2).max(120), phone: optionalBdPhone });

export const profileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    summary: z.string().trim().min(20).max(3000),
    stats: z.array(stat).max(20),
    sections: z.array(z.object({ id: z.string().max(40).default(''), title: z.string().trim().min(2).max(120), body: z.string().trim().min(10).max(10000) })).max(30),
  }),
});
export const administrationSchema = z.object({
  body: z.object({
    officials: z.array(contact.extend({ photo: z.string().nullable().optional().default(null) })).max(60),
    formerUnos: z.array(z.object({ name: z.string().trim().min(2).max(120), term: z.string().trim().min(2).max(60) })).max(100),
  }),
});
export const municipalitySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    summary: z.string().trim().min(20).max(3000),
    stats: z.array(stat).max(20),
    services: z.array(z.string().trim().min(1).max(200)).max(50),
    wards: z.array(z.object({ number: z.number().int().min(1).max(99), councillor: z.string().trim().min(2).max(120), phone: optionalBdPhone })).max(60),
  }),
});
