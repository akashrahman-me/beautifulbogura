import { z } from 'zod';
import { INSTITUTION_TYPES } from '@/config/catalog';
import { bdPhone, honeypot, idParams, imageUrl, objectId, optionalBdPhone, optionalUrl } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

const type = z.enum(INSTITUTION_TYPES);
const coord = (min: number, max: number) => z.number().min(min).max(max).nullable().default(null);

export const listInstitutionsSchema = z.object({ query: listQuery(500).extend({ type: type.optional() }) });
export const institutionIdSchema = idParams;

/** Public “add an institution” — reviewed. */
export const submitInstitutionSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3, 'প্রতিষ্ঠানের নাম লিখুন').max(150),
    type,
    eiin: z.string().trim().regex(/^(\d{5,7})?$/, 'ইআইআইএন ৬ সংখ্যার হয়').optional().default(''),
    founder: z.string().trim().max(150).optional().default(''),
    established: z.string().trim().max(40).optional().default(''),
    union: z.string().trim().max(60).optional().default(''),
    phone: optionalBdPhone,
    address: z.string().trim().min(3, 'ঠিকানা লিখুন').max(200),
    website: optionalUrl,
    about: z.string().trim().max(800).optional().default(''),
    submitter: z.string().trim().min(2, 'আপনার নাম লিখুন').max(120),
  }),
});

/** “I run this institution” — reviewed; approval lets them post notices. */
export const claimSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().trim().min(2, 'নাম লিখুন').max(120),
    role: z.string().trim().min(1, 'পদ বেছে নিন').max(80),
    phone: bdPhone,
    email: z.union([z.literal(''), z.email('সঠিক ইমেইল লিখুন')]).optional().default(''),
    proof: z.string().trim().min(10, 'কীভাবে যাচাই করা যাবে লিখুন').max(500),
    website: honeypot,
  }),
});

export const adminBody = z.object({
  name: z.string().trim().min(3).max(150),
  type,
  eiin: z.string().trim().regex(/^([0-9০-৯]{5,7})?$/).default(''),
  founder: z.string().trim().max(150).default(''),
  established: z.string().trim().max(40).default(''),
  union: z.string().trim().max(60).default(''),
  phone: optionalBdPhone,
  address: z.string().trim().min(2).max(200),
  website: optionalUrl,
  about: z.string().trim().max(2000).default(''),
  photo: imageUrl.nullable().default(null),
  lat: coord(20, 27),
  lng: coord(88, 93),
  hidden: z.boolean().default(false),
});
export const adminFilters = z.object({ type: type.optional(), union: z.string().max(60).optional() });
