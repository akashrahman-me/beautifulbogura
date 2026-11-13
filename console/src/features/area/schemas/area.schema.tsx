import { z } from 'zod';
import { RepeatField } from '@/components/admin/RepeatField';
import type { FieldSpec } from '@/components/admin/SpecForm';
import { optionalPhone, text } from '@/lib/validation';
import type { ListQuery } from '@/types/api';

const lines = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);
const commas = (v: string) => v.split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
const stat = z.object({ label: text(1, 'নাম লিখুন'), value: text(1, 'মান লিখুন') });
const contact = z.object({ role: text(2, 'পদবি লিখুন'), name: text(2, 'নাম লিখুন'), phone: optionalPhone });

/* ---------- profile ---------- */
export interface AreaProfile {
  name: string;
  summary: string;
  stats: { label: string; value: string }[];
  sections: { id: string; title: string; body: string }[];
  updatedAt: string;
  updatedBy: string;
}
export const profileSchema = z.object({
  name: text(2, 'নাম লিখুন'),
  summary: text(20, 'সারসংক্ষেপ লিখুন'),
  stats: z.array(stat),
  sections: z.array(z.object({ id: z.string(), title: text(2, 'শিরোনাম লিখুন'), body: text(10, 'বিবরণ লিখুন') })),
});
export const profileFields: FieldSpec[] = [
  { name: 'name', label: 'উপজেলার নাম', type: 'text', required: true },
  { name: 'summary', label: 'সারসংক্ষেপ', type: 'textarea', required: true, rows: 4 },
  { name: 'stats', label: 'এক নজরে', type: 'custom', render: (form) => <RepeatField form={form} name="stats" label="এক নজরে (সংখ্যা)" itemLabel="তথ্য" addLabel="তথ্য যুক্ত করুন" empty={{ label: '', value: '' }} fields={[{ name: 'label', label: 'নাম', placeholder: 'সাক্ষরতার হার' }, { name: 'value', label: 'মান', placeholder: '৬৫.৪%' }]} /> },
  { name: 'sections', label: 'অধ্যায়', type: 'custom', render: (form) => <RepeatField form={form} name="sections" label="অধ্যায় (অ্যাকর্ডিয়ন)" itemLabel="অধ্যায়" addLabel="অধ্যায় যুক্ত করুন" empty={{ id: '', title: '', body: '' }} fields={[{ name: 'title', label: 'শিরোনাম', wide: true }, { name: 'body', label: 'বিবরণ', type: 'textarea' }]} /> },
];

/* ---------- administration ---------- */
export interface Administration {
  officials: { role: string; name: string; phone: string; photo: string | null }[];
  formerUnos: { name: string; term: string }[];
  updatedAt: string;
  updatedBy: string;
}
export const administrationSchema = z.object({
  officials: z.array(contact),
  formerUnos: z.array(z.object({ name: text(2, 'নাম লিখুন'), term: text(2, 'মেয়াদ লিখুন') })),
});
export const administrationFields: FieldSpec[] = [
  { name: 'officials', label: 'কর্মকর্তা', type: 'custom', render: (form) => <RepeatField form={form} name="officials" label="বর্তমান কর্মকর্তা" itemLabel="কর্মকর্তা" addLabel="কর্মকর্তা যুক্ত করুন" empty={{ role: '', name: '', phone: '' }} fields={[{ name: 'role', label: 'পদবি', placeholder: 'উপজেলা নির্বাহী অফিসার' }, { name: 'name', label: 'নাম' }, { name: 'phone', label: 'ফোন', type: 'phone' }]} /> },
  { name: 'formerUnos', label: 'সাবেক ইউএনও', type: 'custom', render: (form) => <RepeatField form={form} name="formerUnos" label="সাবেক উপজেলা নির্বাহী অফিসার" itemLabel="সাবেক ইউএনও" addLabel="যুক্ত করুন" empty={{ name: '', term: '' }} fields={[{ name: 'name', label: 'নাম' }, { name: 'term', label: 'মেয়াদ', placeholder: '২০১৯–২০২১' }]} /> },
];

/* ---------- municipality ---------- */
export interface Municipality {
  name: string;
  summary: string;
  stats: { label: string; value: string }[];
  services: string[];
  wards: { number: number; councillor: string; phone: string }[];
  updatedAt: string;
  updatedBy: string;
}
export const municipalitySchema = z
  .object({
    name: text(2, 'নাম লিখুন'),
    summary: text(20, 'সারসংক্ষেপ লিখুন'),
    stats: z.array(stat),
    services: z.string(),
    wards: z.array(z.object({ number: z.string().regex(/^[0-9০-৯]+$/, 'ওয়ার্ড নম্বর দিন'), councillor: text(2, 'কাউন্সিলরের নাম লিখুন'), phone: optionalPhone })),
  })
  .transform((v) => ({ ...v, services: lines(v.services), wards: v.wards.map((w) => ({ ...w, number: Number(w.number.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))) })) }));
export const municipalityFields: FieldSpec[] = [
  { name: 'name', label: 'পৌরসভার নাম', type: 'text', required: true },
  { name: 'summary', label: 'সারসংক্ষেপ', type: 'textarea', required: true, rows: 4 },
  { name: 'stats', label: 'এক নজরে', type: 'custom', render: (form) => <RepeatField form={form} name="stats" label="এক নজরে" itemLabel="তথ্য" addLabel="তথ্য যুক্ত করুন" empty={{ label: '', value: '' }} fields={[{ name: 'label', label: 'নাম' }, { name: 'value', label: 'মান' }]} /> },
  { name: 'services', label: 'নাগরিক সেবা', type: 'textarea', rows: 5, hint: 'প্রতি লাইনে একটি সেবা' },
  { name: 'wards', label: 'ওয়ার্ড', type: 'custom', render: (form) => <RepeatField form={form} name="wards" label="ওয়ার্ড ও কাউন্সিলর" itemLabel="ওয়ার্ড" addLabel="ওয়ার্ড যুক্ত করুন" empty={{ number: '', councillor: '', phone: '' }} fields={[{ name: 'number', label: 'ওয়ার্ড নম্বর' }, { name: 'councillor', label: 'কাউন্সিলর' }, { name: 'phone', label: 'ফোন', type: 'phone' }]} /> },
];

/* ---------- unions ---------- */
export interface Union {
  id: string;
  name: string;
  number: number;
  contacts: { role: string; name: string; phone: string }[];
  villages: string[];
  markets: string[];
  formerChairmen: string[];
  updatedAt: string;
}
export const unionSchema = z
  .object({
    name: text(2, 'ইউনিয়নের নাম লিখুন'),
    number: z.string().regex(/^[0-9০-৯]+$/, 'ক্রমিক নম্বর দিন'),
    contacts: z.array(contact),
    villages: z.string(),
    markets: z.string(),
    formerChairmen: z.string(),
  })
  .transform((v) => ({ ...v, number: Number(v.number.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))), villages: commas(v.villages), markets: lines(v.markets), formerChairmen: lines(v.formerChairmen) }));
export type UnionForm = z.input<typeof unionSchema>;
export const unionEmpty: UnionForm = { name: '', number: '', contacts: [{ role: 'চেয়ারম্যান', name: '', phone: '' }], villages: '', markets: '', formerChairmen: '' };
export const unionFields: FieldSpec[] = [
  { name: 'name', label: 'নাম', type: 'text', required: true },
  { name: 'number', label: 'ক্রমিক নম্বর', type: 'number', required: true },
  { name: 'contacts', label: 'যোগাযোগ', type: 'custom', render: (form) => <RepeatField form={form} name="contacts" label="যোগাযোগ" itemLabel="ব্যক্তি" addLabel="যুক্ত করুন" empty={{ role: '', name: '', phone: '' }} fields={[{ name: 'role', label: 'পদবি' }, { name: 'name', label: 'নাম' }, { name: 'phone', label: 'ফোন', type: 'phone' }]} /> },
  { name: 'villages', label: 'গ্রাম', type: 'textarea', rows: 3, hint: 'কমা দিয়ে আলাদা করুন' },
  { name: 'markets', label: 'হাট-বাজার', type: 'textarea', rows: 3, hint: 'প্রতি লাইনে একটি, হাটের দিনসহ' },
  { name: 'formerChairmen', label: 'সাবেক চেয়ারম্যান', type: 'textarea', rows: 3, hint: 'প্রতি লাইনে একজন, মেয়াদসহ' },
];
export type UnionQuery = ListQuery;
