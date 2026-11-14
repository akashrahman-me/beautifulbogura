import { z } from 'zod';
import { BLOOD_GROUPS } from '@/config/catalog';
import { bdPhone, honeypot, objectId } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

const status = z.enum(['ready', 'not-yet', 'unknown']);
const pastDate = z.iso
  .datetime({ offset: true })
  .refine((v) => new Date(v).getTime() <= Date.now() + 864e5, 'ভবিষ্যতের তারিখ দেওয়া যাবে না');

export const listDonorsSchema = z.object({ query: listQuery(50, 12).extend({ group: z.enum(BLOOD_GROUPS).optional(), status: status.optional() }) });

export const registerDonorSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3, 'পুরো নাম লিখুন').max(120),
    group: z.enum(BLOOD_GROUPS, { error: 'রক্তের গ্রুপ বেছে নিন' }),
    phone: bdPhone,
    address: z.string().trim().min(3, 'এলাকার নাম লিখুন').max(200),
    lastDonation: pastDate.nullable().default(null),
    website: honeypot,
  }),
});

/** The donor proves it is them by the registered number — there is no account for donors. */
export const lastDonationSchema = z.object({ params: z.object({ id: objectId }), body: z.object({ phone: bdPhone, lastDonation: pastDate }) });

export const adminBody = z.object({
  name: z.string().trim().min(2).max(120),
  group: z.enum(BLOOD_GROUPS),
  phone: bdPhone,
  address: z.string().trim().max(200).default(''),
  lastDonation: z.union([z.iso.date(), z.iso.datetime({ offset: true })]).nullable().default(null),
  hidden: z.boolean().default(false),
});
export const adminFilters = z.object({ group: z.enum(BLOOD_GROUPS).optional(), status: status.optional() });
