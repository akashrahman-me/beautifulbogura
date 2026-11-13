import { z } from 'zod';
import type { FieldSpec } from '@/components/admin/SpecForm';
import { DIRECTORY_TYPES } from '@/config/catalog';
import { optionalPhone, optionalText, photoField, text, urlField } from '@/lib/validation';
import type { ListQuery } from '@/types/api';

export interface DirectoryEntry {
  id: string;
  type: string;
  name: string;
  role: string;
  phone: string;
  whatsapp: boolean;
  address: string;
  hours: string;
  description: string;
  mapUrl: string;
  photo: string | null;
  verified: boolean;
  /** Hidden from the site without deleting (e.g. closed for now). */
  hidden: boolean;
  rating: number | null;
  ratingCount: number;
  updatedAt: string;
}

export interface DirectoryQuery extends ListQuery {
  type?: string;
  verified?: boolean;
  hidden?: boolean;
}

export const directorySchema = z.object({
  type: z.string().min(1, 'তালিকা বেছে নিন'),
  name: text(2, 'নাম লিখুন'),
  role: optionalText,
  phone: optionalPhone,
  whatsapp: z.boolean(),
  address: optionalText,
  hours: optionalText,
  description: z.string().trim().max(500, '৫০০ অক্ষরের মধ্যে লিখুন'),
  mapUrl: urlField,
  photo: photoField,
  verified: z.boolean(),
  hidden: z.boolean(),
});
export type DirectoryForm = z.input<typeof directorySchema>;

export const directoryEmpty: DirectoryForm = { type: '', name: '', role: '', phone: '', whatsapp: false, address: '', hours: '', description: '', mapUrl: '', photo: null, verified: false, hidden: false };

export const directoryFields: FieldSpec[] = [
  { name: 'type', label: 'তালিকা', type: 'select', options: DIRECTORY_TYPES, required: true },
  { name: 'name', label: 'নাম', type: 'text', required: true },
  { name: 'role', label: 'পদবি বা ধরন', type: 'text', placeholder: 'যেমন: অফিসার ইনচার্জ' },
  { name: 'phone', label: 'মোবাইল নম্বর', type: 'phone' },
  { name: 'whatsapp', label: 'এই নম্বরে হোয়াটসঅ্যাপ আছে', type: 'checkbox' },
  { name: 'hours', label: 'খোলার সময়', type: 'text', placeholder: 'যেমন: সকাল ৯টা – রাত ৮টা' },
  { name: 'address', label: 'ঠিকানা', type: 'text', wide: true },
  { name: 'mapUrl', label: 'গুগল ম্যাপ লিংক', type: 'url', wide: true },
  { name: 'description', label: 'বিবরণ', type: 'textarea', rows: 3 },
  { name: 'photo', label: 'ছবি', type: 'image' },
  { name: 'verified', label: 'যাচাইকৃত', type: 'checkbox', hint: 'অ্যাডমিন তথ্য মিলিয়ে দেখেছেন', section: 'প্রকাশ' },
  { name: 'hidden', label: 'সাইটে লুকিয়ে রাখুন', type: 'checkbox', hint: 'মুছে না ফেলে সাময়িক সরিয়ে রাখতে' },
];
