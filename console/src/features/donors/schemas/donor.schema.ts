import { z } from 'zod';
import type { FieldSpec } from '@/components/admin/SpecForm';
import { BLOOD_GROUPS } from '@/config/catalog';
import { optionalText, phoneField, text } from '@/lib/validation';
import type { ListQuery } from '@/types/api';

export interface Donor {
  id: string;
  name: string;
  group: string;
  phone: string;
  address: string;
  lastDonation: string | null;
  /** Hidden from the public list (asked to be removed for now, unreachable…). */
  hidden: boolean;
  createdAt: string;
}

export interface DonorQuery extends ListQuery {
  group?: string;
  status?: 'ready' | 'not-yet' | 'unknown';
}

export const donorSchema = z.object({
  name: text(2, 'নাম লিখুন'),
  group: z.string().min(1, 'রক্তের গ্রুপ বেছে নিন'),
  phone: phoneField,
  address: optionalText,
  lastDonation: z.string().transform((v) => v || null),
  hidden: z.boolean(),
});
export type DonorForm = z.input<typeof donorSchema>;
export const donorEmpty: DonorForm = { name: '', group: '', phone: '', address: '', lastDonation: '', hidden: false };

export const donorFields: FieldSpec[] = [
  { name: 'name', label: 'নাম', type: 'text', required: true },
  { name: 'group', label: 'রক্তের গ্রুপ', type: 'choice', options: BLOOD_GROUPS, required: true },
  { name: 'phone', label: 'মোবাইল নম্বর', type: 'phone', required: true },
  { name: 'lastDonation', label: 'শেষ রক্তদানের তারিখ', type: 'date', hint: 'জানা না থাকলে খালি রাখুন' },
  { name: 'address', label: 'এলাকা / ঠিকানা', type: 'text', wide: true },
  { name: 'hidden', label: 'তালিকা থেকে লুকিয়ে রাখুন', type: 'checkbox', hint: 'দাতা অনুরোধ করলে বা নম্বরে পাওয়া না গেলে' },
];
