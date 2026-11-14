import { z } from 'zod';
import { BLOOD_GROUPS } from '@/config/catalog';
import { listQuery } from '@/utils/pagination';

const sitePath = z.string().trim().max(300).regex(/^(\/[^\s]*|https?:\/\/\S+)$/, 'সাইটের পাতা (/blood-bank) বা পুরো লিংক দিন');

export const slideBody = z.object({
  order: z.number().int().min(0).max(100),
  tone: z.enum(['brand', 'accent', 'gold', 'emergency']),
  icon: z.string().regex(/^[a-z-]{2,30}$/),
  eyebrow: z.string().trim().min(2).max(40),
  title: z.string().trim().min(4).max(60),
  body: z.string().trim().max(120).default(''),
  cta: z.object({ label: z.string().trim().min(2).max(30), href: sitePath }),
  startsAt: z.iso.datetime({ offset: true }).nullable().default(null),
  endsAt: z.iso.datetime({ offset: true }).nullable().default(null),
  active: z.boolean().default(true),
});

export const pushListSchema = z.object({ query: listQuery(100) });
export const sendPushSchema = z.object({
  body: z.object({
    title: z.string().trim().min(4).max(60),
    body: z.string().trim().min(4).max(160),
    url: sitePath,
    audience: z.enum(['all', 'donors']),
    bloodGroup: z.enum(BLOOD_GROUPS).nullable().optional().default(null),
  }),
});

/** A browser's PushSubscription.toJSON(), from the site. */
export const subscribeSchema = z.object({
  body: z.object({
    subscription: z.object({ endpoint: z.url().startsWith('https://'), keys: z.object({ p256dh: z.string().min(10).max(200), auth: z.string().min(8).max(100) }) }),
    donor: z.boolean().default(false),
    bloodGroup: z.enum(BLOOD_GROUPS).nullable().optional().default(null),
  }),
});
export const unsubscribeSchema = z.object({ body: z.object({ endpoint: z.url() }) });
