import { z } from 'zod';
import type { FieldSpec } from '@/components/admin/SpecForm';
import { INSTITUTION_TYPES, UNIONS } from '@/config/catalog';
import { optionalPhone, optionalText, photoField, text, urlField } from '@/lib/validation';
import type { ListQuery } from '@/types/api';
import { InstitutionSelect } from '../components/InstitutionSelect';

export interface Institution {
  id: string;
  name: string;
  type: string;
  eiin: string;
  founder: string;
  established: string;
  union: string;
  phone: string;
  address: string;
  website: string;
  about: string;
  photo: string | null;
  lat: number | null;
  lng: number | null;
  /** Staff member of the institution whose claim was approved; they may post notices. */
  claimedBy: string | null;
  hidden: boolean;
  notices: number;
  updatedAt: string;
}

export interface InstitutionQuery extends ListQuery {
  type?: string;
  union?: string;
}

const coord = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v) => (v ? Number(v) : null))
    .refine((n) => n == null || (Number.isFinite(n) && n >= min && n <= max), 'সঠিক স্থানাঙ্ক দিন');

export const institutionSchema = z.object({
  name: text(3, 'প্রতিষ্ঠানের নাম লিখুন'),
  type: z.string().min(1, 'ধরন বেছে নিন'),
  eiin: z.string().trim().refine((v) => !v || /^[0-9০-৯]{5,7}$/.test(v), 'ইআইআইএন ৫–৭ অঙ্কের'),
  founder: optionalText,
  established: optionalText,
  union: optionalText,
  phone: optionalPhone,
  address: text(2, 'ঠিকানা লিখুন'),
  website: urlField,
  about: optionalText,
  photo: photoField,
  lat: coord(20, 27),
  lng: coord(88, 93),
  hidden: z.boolean(),
});
export type InstitutionForm = z.input<typeof institutionSchema>;
export const institutionEmpty: InstitutionForm = { name: '', type: '', eiin: '', founder: '', established: '', union: '', phone: '', address: '', website: '', about: '', photo: null, lat: '', lng: '', hidden: false };

export const institutionFields: FieldSpec[] = [
  { name: 'name', label: 'নাম', type: 'text', required: true, wide: true },
  { name: 'type', label: 'ধরন', type: 'select', options: INSTITUTION_TYPES, required: true },
  { name: 'eiin', label: 'ইআইআইএন', type: 'text' },
  { name: 'founder', label: 'প্রতিষ্ঠাতা', type: 'text' },
  { name: 'established', label: 'প্রতিষ্ঠার সাল বা তারিখ', type: 'text', placeholder: '১৯৬২' },
  { name: 'union', label: 'ইউনিয়ন / পৌরসভা', type: 'select', options: UNIONS },
  { name: 'phone', label: 'ফোন', type: 'phone' },
  { name: 'address', label: 'ঠিকানা', type: 'text', required: true, wide: true },
  { name: 'website', label: 'ওয়েবসাইট', type: 'url', wide: true },
  { name: 'about', label: 'পরিচিতি', type: 'textarea', rows: 4 },
  { name: 'photo', label: 'ছবি', type: 'image' },
  { name: 'lat', label: 'অক্ষাংশ (lat)', type: 'text', placeholder: '24.85', section: 'ম্যাপে অবস্থান', hint: 'গুগল ম্যাপে জায়গায় ডান-ক্লিক করে স্থানাঙ্ক কপি করুন' },
  { name: 'lng', label: 'দ্রাঘিমাংশ (lng)', type: 'text', placeholder: '89.37' },
  { name: 'hidden', label: 'সাইটে লুকিয়ে রাখুন', type: 'checkbox', section: 'প্রকাশ' },
];

export interface Notice {
  id: string;
  institutionId: string;
  institutionName: string;
  title: string;
  body: string;
  link: string;
  pinned: boolean;
  createdAt: string;
}

export interface NoticeQuery extends ListQuery {
  institution?: string;
}

export const noticeSchema = z.object({
  institutionId: z.string().min(1, 'প্রতিষ্ঠান বেছে নিন'),
  title: text(3, 'শিরোনাম লিখুন'),
  body: text(5, 'নোটিশের বিবরণ লিখুন'),
  link: urlField,
  pinned: z.boolean(),
});
export type NoticeForm = z.input<typeof noticeSchema>;
export const noticeEmpty: NoticeForm = { institutionId: '', title: '', body: '', link: '', pinned: false };

export const noticeFields: FieldSpec[] = [
  { name: 'institutionId', label: 'প্রতিষ্ঠান', type: 'custom', render: (form) => <InstitutionSelect form={form} /> },
  { name: 'title', label: 'শিরোনাম', type: 'text', required: true, wide: true },
  { name: 'body', label: 'বিবরণ', type: 'textarea', required: true, rows: 5 },
  { name: 'link', label: 'সংযুক্তি বা বিস্তারিত লিংক', type: 'url', wide: true },
  { name: 'pinned', label: 'উপরে পিন করে রাখুন', type: 'checkbox' },
];
