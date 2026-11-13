import { z } from 'zod';
import { BD_MOBILE, latin } from './utils';

/** Bangladeshi mobile, typed in Bangla or Latin digits; normalised to 01XXXXXXXXX. */
export const phoneField = z
  .string()
  .transform((v) => latin(v).replace(/[^0-9]/g, ''))
  .refine((v) => BD_MOBILE.test(v), '১১ সংখ্যার মোবাইল নম্বর লিখুন (০১…)');

/** Whole taka amount typed in either digit set. */
export const takaField = (message = 'টাকার পরিমাণ লিখুন') =>
  z
    .string()
    .transform((v) => Number(latin(v).replace(/[^0-9]/g, '')))
    .refine((n) => n > 0, message);

/** Hidden honeypot: people never see it, bots fill it. */
export const honeypot = z.string().max(0).optional();
