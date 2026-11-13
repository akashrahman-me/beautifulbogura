import { z } from 'zod';
import type { FieldSpec } from '@/components/admin/SpecForm';
import { DEGREES, SPECIALTIES } from '@/config/catalog';
import { optionalPhone, optionalText, photoField, text } from '@/lib/validation';
import type { ListQuery } from '@/types/api';
import { ChambersField } from '../components/ChambersField';

export interface Chamber {
  hospital: string;
  /** 0 = Sunday … 6 = Saturday. */
  days: number[];
  time: string;
  serial: string;
  fee: number | null;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  degrees: string[];
  phone: string;
  photo: string | null;
  about: string;
  chambers: Chamber[];
  verified: boolean;
  hidden: boolean;
  updatedAt: string;
}

export interface DoctorQuery extends ListQuery {
  specialty?: string;
}

const chamber = z.object({
  hospital: text(2, 'হাসপাতাল বা চেম্বারের নাম লিখুন'),
  days: z.array(z.string()).min(1, 'অন্তত একটি দিন বেছে নিন'),
  time: text(2, 'সময় লিখুন'),
  serial: optionalPhone,
  fee: z.string().transform((v) => (v.trim() ? Number(v.replace(/[^0-9০-৯]/g, '').replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))) : null)),
});

export const doctorSchema = z
  .object({
    name: text(3, 'ডাক্তারের নাম লিখুন'),
    specialty: z.string().min(1, 'বিশেষজ্ঞতা বেছে নিন'),
    degrees: z.array(z.string()),
    degreesOther: optionalText,
    phone: optionalPhone,
    about: optionalText,
    photo: photoField,
    chambers: z.array(chamber).min(1, 'অন্তত একটি চেম্বার যুক্ত করুন'),
    verified: z.boolean(),
    hidden: z.boolean(),
  })
  .transform(({ degreesOther, chambers, ...v }) => ({
    ...v,
    degrees: [...v.degrees, ...degreesOther.split(/[,،]/).map((s) => s.trim()).filter(Boolean)],
    chambers: chambers.map((c) => ({ ...c, days: c.days.map(Number) })),
  }));
export type DoctorForm = z.input<typeof doctorSchema>;

export const emptyChamber = { hospital: '', days: [] as string[], time: '', serial: '', fee: '' };
export const doctorEmpty: DoctorForm = { name: '', specialty: '', degrees: [], degreesOther: '', phone: '', about: '', photo: null, chambers: [emptyChamber], verified: false, hidden: false };

export const doctorFields: FieldSpec[] = [
  { name: 'name', label: 'নাম', type: 'text', required: true, placeholder: 'ডা. …' },
  { name: 'specialty', label: 'বিশেষজ্ঞতা', type: 'select', options: SPECIALTIES, required: true },
  { name: 'degrees', label: 'ডিগ্রি', type: 'multi', options: DEGREES },
  { name: 'degreesOther', label: 'অন্যান্য ডিগ্রি', type: 'text', placeholder: 'যেমন: এফসিপিএস (সার্জারি), এমডি' },
  { name: 'phone', label: 'মোবাইল নম্বর', type: 'phone' },
  { name: 'about', label: 'পরিচিতি', type: 'textarea', rows: 3 },
  { name: 'photo', label: 'ছবি', type: 'image' },
  { name: 'chambers', label: 'চেম্বার', type: 'custom', section: 'চেম্বার', render: (form) => <ChambersField form={form} /> },
  { name: 'verified', label: 'যাচাইকৃত', type: 'checkbox', section: 'প্রকাশ' },
  { name: 'hidden', label: 'সাইটে লুকিয়ে রাখুন', type: 'checkbox' },
];
