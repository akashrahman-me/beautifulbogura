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

/** A phone that may be left empty. */
export const optionalPhone = z
  .string()
  .transform((v) => latin(v).replace(/[^0-9]/g, ''))
  .refine((v) => !v || BD_MOBILE.test(v), '১১ সংখ্যার মোবাইল নম্বর লিখুন (০১…)');

/** http(s) link or empty. */
export const urlField = z
  .string()
  .trim()
  .refine((v) => !v || /^https?:\/\/\S+$/.test(v), 'https:// দিয়ে শুরু করে পুরো লিংক দিন');

/** A photo field: the stored URL, newly picked files (uploaded on save), or none. */
export const photoField = z.union([z.string(), z.array(z.instanceof(File)), z.null()]).optional().transform((v) => v ?? null);

/** Whole number typed in either digit set. */
export const intField = (message: string, min = 0) =>
  z
    .string()
    .transform((v) => Number(latin(v).replace(/[^0-9]/g, '') || NaN))
    .refine((n) => Number.isFinite(n) && n >= min, message);

export const text = (min: number, message: string) => z.string().trim().min(min, message);
export const optionalText = z.string().trim();
