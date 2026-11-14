import { z, type ZodObject } from 'zod';
import { LISTING_CATEGORIES, LISTING_CONDITIONS, MARITAL_STATUSES, MATRIMONY_GENDERS, POST_KIND_KEYS, RELIGIONS, RENTAL_TYPES, TUITION_KINDS, VEHICLE_TYPES, type PostKind } from '@/config/catalog';
import { bdPhone, honeypot, idParams, imageUrl, objectId, optionalUrl, queryBool, reasonBody } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

const text = (min: number, max: number, msg: string) => z.string().trim().min(min, msg).max(max);
const contact = { phone: bdPhone, whatsapp: z.boolean().default(false), website: honeypot };

/** What each create form sends (client/src/features/<kind>/api). Featured / verified are never accepted here. */
const BODIES: Record<PostKind, ZodObject> = {
  job: z.object({
    ...contact,
    company: text(2, 150, 'প্রতিষ্ঠানের নাম লিখুন'),
    title: text(2, 150, 'পদের নাম লিখুন'),
    vacancies: z.number().int().min(1).max(1000),
    salary: text(1, 100, 'বেতন লিখুন'),
    deadline: z.iso.datetime({ offset: true }),
    education: z.string().trim().max(150).optional().default(''),
    details: text(10, 5000, 'কাজ, অভিজ্ঞতা ও শর্ত লিখুন'),
    address: text(2, 200, 'ঠিকানা লিখুন'),
    durationDays: z.number().int(),
    images: z.array(imageUrl).max(1).default([]),
  }),
  listing: z.object({
    ...contact,
    category: z.enum(LISTING_CATEGORIES),
    title: text(3, 150, 'পণ্যের নাম লিখুন'),
    condition: z.enum(LISTING_CONDITIONS),
    price: z.number().int().min(1).max(1_000_000_000),
    description: text(10, 3000, 'পণ্য সম্পর্কে লিখুন'),
    sellerName: text(2, 120, 'আপনার নাম লিখুন'),
    address: text(2, 200, 'এলাকার নাম লিখুন'),
    images: z.array(imageUrl).max(10).default([]),
  }),
  rental: z.object({
    ...contact,
    ownerName: text(2, 120, 'মালিকের নাম লিখুন'),
    type: z.enum(RENTAL_TYPES),
    rent: z.number().int().min(1).max(10_000_000),
    rooms: z.number().int().min(1).max(20),
    gas: z.boolean(),
    attachedBath: z.boolean(),
    title: text(5, 150, 'একটি ছোট শিরোনাম দিন'),
    description: z.string().trim().max(3000).optional().default(''),
    address: text(3, 200, 'ঠিকানা লিখুন'),
    mapUrl: optionalUrl,
    images: z.array(imageUrl).max(10).default([]),
    durationDays: z.number().int().optional(),
  }),
  vehicle: z.object({ ...contact, type: z.enum(VEHICLE_TYPES), ownerName: text(2, 120, 'মালিক বা চালকের নাম লিখুন'), description: text(5, 2000, 'গাড়ির বিবরণ লিখুন') }),
  tuition: z.object({
      ...contact,
      kind: z.enum(TUITION_KINDS),
      name: text(2, 120, 'নাম লিখুন'),
      classLevel: text(1, 60, 'শ্রেণি লিখুন'),
      subject: text(1, 120, 'বিষয় লিখুন'),
      qualification: z.string().trim().max(200).optional().default(''),
      experience: z.string().trim().max(60).optional().default(''),
      address: text(2, 200, 'এলাকা লিখুন'),
      note: z.string().trim().max(300).optional().default(''),
      images: z.array(imageUrl).max(1).default([]),
      durationDays: z.number().int().optional(),
    }),
  matrimony: z.object({
    ...contact,
    gender: z.enum(MATRIMONY_GENDERS),
    name: text(2, 120, 'পূর্ণ নাম লিখুন'),
    birthYear: z.number().int().min(1940).max(new Date().getFullYear()),
    religion: z.enum(RELIGIONS),
    maritalStatus: z.enum(MARITAL_STATUSES),
    education: text(1, 60, 'শিক্ষাগত যোগ্যতা বেছে নিন'),
    profession: text(2, 120, 'পেশা লিখুন'),
    familyMembers: text(2, 500, 'পরিবারের সদস্যদের তথ্য লিখুন'),
    preference: text(5, 1000, 'কেমন জীবনসঙ্গী চান, লিখুন'),
    address: text(2, 200, 'ঠিকানা লিখুন'),
    photo: imageUrl.nullable().default(null),
  }),
};

/** Cross-field rules apply to a new post; edits only check the fields they send. */
export const CREATE_BODIES: Record<PostKind, z.ZodType> = {
  ...BODIES,
  tuition: BODIES.tuition.refine((v) => v.kind !== 'want-to-teach' || String(v.qualification ?? '').length > 1, { path: ['qualification'], message: 'শিক্ষাগত যোগ্যতা লিখুন' }),
};

/** Public list filters per kind. */
export const LIST_FILTERS: Record<PostKind, ZodObject> = {
  job: z.object({}),
  listing: z.object({ category: z.enum(LISTING_CATEGORIES).optional() }),
  rental: z.object({ type: z.enum(RENTAL_TYPES).optional() }),
  vehicle: z.object({ type: z.enum(VEHICLE_TYPES).optional() }),
  tuition: z.object({ kind: z.enum(TUITION_KINDS).optional() }),
  matrimony: z.object({ gender: z.enum(MATRIMONY_GENDERS).optional(), religion: z.enum(RELIGIONS).optional() }),
};

export const listSchema = (kind: PostKind) => z.object({ query: listQuery(50, 12).extend(LIST_FILTERS[kind].shape) });
export const createSchema = (kind: PostKind) => z.object({ body: CREATE_BODIES[kind] });
/** The owner may edit their own fields; images stay as they are unless sent. */
export const updateSchema = (kind: PostKind) => z.object({ params: z.object({ id: objectId }), body: BODIES[kind].partial() });
export const postIdSchema = idParams;
export const manageSchema = z.object({ params: z.object({ id: objectId }), body: z.object({ action: z.enum(['delete', 'mark-done']) }) });
export const reportSchema = z.object({ params: z.object({ id: objectId }), body: z.object({ reason: z.enum(['fake', 'sold', 'wrong-info', 'other']), note: z.string().trim().max(300).optional() }) });

/* ---------- console ---------- */
export const adminListSchema = z.object({
  query: listQuery(100).extend({
    kind: z.enum(POST_KIND_KEYS as [PostKind, ...PostKind[]]).optional(),
    status: z.enum(['active', 'done', 'expired', 'hidden', 'removed']).optional(),
    featured: queryBool,
    owner: objectId.optional(),
  }),
});
export const toggleSchema = z.object({ params: z.object({ id: objectId }), body: z.object({ value: z.boolean() }) });
export const extendSchema = z.object({ params: z.object({ id: objectId }), body: z.object({ days: z.number().int().min(1).max(365) }) });
export const removeSchema = z.object({ params: z.object({ id: objectId }), body: reasonBody });
