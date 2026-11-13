import { z } from 'zod';
import { BD_MOBILE, latin } from './utils';

/** Bangladeshi mobile, typed in Bangla or Latin digits; normalised to 01XXXXXXXXX. */
export const phoneField = z
  .string()
  .transform((v) => latin(v).replace(/[^0-9]/g, ''))
  .refine((v) => BD_MOBILE.test(v), '১১ সংখ্যার মোবাইল নম্বর লিখুন (০১…)');

/** Owner PIN for anonymous posts: 4–6 digits. */
export const pinField = z
  .string()
  .transform((v) => latin(v).replace(/\D/g, ''))
  .refine((v) => /^\d{4,6}$/.test(v), '৪ থেকে ৬ সংখ্যার একটি পিন দিন');

/** Whole taka amount typed in either digit set. */
export const takaField = (message = 'টাকার পরিমাণ লিখুন') =>
  z
    .string()
    .transform((v) => Number(latin(v).replace(/[^0-9]/g, '')))
    .refine((n) => n > 0, message);

/** Hidden honeypot: people never see it, bots fill it. */
export const honeypot = z.string().max(0).optional();

export const PIN_HINT = 'এই পিন দিয়ে পরে পোস্ট সম্পাদনা, মুছে ফেলা বা “সম্পন্ন” করতে পারবেন। মনে রাখুন, কাউকে দেবেন না।';
