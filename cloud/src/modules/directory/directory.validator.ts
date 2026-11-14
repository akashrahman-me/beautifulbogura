import { z } from 'zod';
import { DIRECTORY_TYPES } from '@/config/catalog';
import { bdPhone, honeypot, imageUrl, objectId, optionalBdPhone, optionalUrl, queryBool } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

const type = z.enum(DIRECTORY_TYPES);

export const listPublicSchema = z.object({ params: z.object({ type }), query: listQuery(50) });

/** Public “add your info” form — goes to review. */
export const submitSchema = z.object({
  params: z.object({ type }),
  body: z.object({
    name: z.string().trim().min(2, 'নাম লিখুন').max(120),
    role: z.string().trim().max(80).optional().default(''),
    phone: bdPhone,
    whatsapp: z.boolean().default(false),
    address: z.string().trim().min(3, 'ঠিকানা লিখুন').max(200),
    description: z.string().trim().max(300).optional().default(''),
    website: honeypot,
  }),
});

export const rateSchema = z.object({ params: z.object({ type, id: objectId }), body: z.object({ stars: z.number().int().min(1).max(5) }) });

/** Console create / edit. */
export const adminBody = z.object({
  type,
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().max(120).default(''),
  phone: optionalBdPhone,
  whatsapp: z.boolean().default(false),
  address: z.string().trim().max(200).default(''),
  hours: z.string().trim().max(120).default(''),
  description: z.string().trim().max(500).default(''),
  mapUrl: optionalUrl,
  photo: imageUrl.nullable().default(null),
  verified: z.boolean().default(false),
  hidden: z.boolean().default(false),
});
export const adminFilters = z.object({ type: type.optional(), verified: queryBool, hidden: queryBool });
