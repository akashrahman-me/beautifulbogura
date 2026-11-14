import { z } from 'zod';
import { TRADES } from '@/config/catalog';
import { bdPhone, honeypot } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

export const listWorkersSchema = z.object({ query: listQuery(50).extend({ trade: z.enum(TRADES).optional() }) });
export const registerWorkerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'নাম লিখুন').max(120),
    phone: bdPhone,
    trades: z.array(z.enum(TRADES)).min(1, 'অন্তত একটি কাজ বেছে নিন').max(8),
    address: z.string().trim().max(200).optional().default(''),
    website: honeypot,
  }),
});
export const adminBody = z.object({
  name: z.string().trim().min(2).max(120),
  phone: bdPhone,
  trades: z.array(z.enum(TRADES)).min(1).max(8),
  address: z.string().trim().max(200).default(''),
  hidden: z.boolean().default(false),
});
export const adminFilters = z.object({ trade: z.enum(TRADES).optional() });
