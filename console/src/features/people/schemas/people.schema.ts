import { z } from 'zod';
import type { FieldSpec } from '@/components/admin/SpecForm';
import { CADRES, NOTABLE_FIELDS, SECTORS, UNIONS } from '@/config/catalog';
import { optionalText, photoField, text } from '@/lib/validation';
import type { ListQuery } from '@/types/api';

/* ---------- freedom fighters ---------- */
export interface FreedomFighter {
  id: string;
  name: string;
  fatherName: string;
  idNo: string;
  village: string;
  union: string;
  sector: string | null;
  alive: boolean;
  photo: string | null;
  updatedAt: string;
}
export interface FreedomFighterQuery extends ListQuery {
  union?: string;
}
export const freedomFighterSchema = z.object({
  name: text(3, 'নাম লিখুন'),
  fatherName: text(3, 'পিতার নাম লিখুন'),
  idNo: text(1, 'গেজেট বা এমআইএস নম্বর লিখুন'),
  village: text(2, 'গ্রাম লিখুন'),
  union: z.string().min(1, 'ইউনিয়ন বেছে নিন'),
  sector: z.string().transform((v) => v || null),
  alive: z.boolean(),
  photo: photoField,
});
export type FreedomFighterForm = z.input<typeof freedomFighterSchema>;
export const freedomFighterEmpty: FreedomFighterForm = { name: '', fatherName: '', idNo: '', village: '', union: '', sector: '', alive: true, photo: null };
export const freedomFighterFields: FieldSpec[] = [
  { name: 'name', label: 'নাম', type: 'text', required: true },
  { name: 'fatherName', label: 'পিতার নাম', type: 'text', required: true },
  { name: 'idNo', label: 'গেজেট / এমআইএস নম্বর', type: 'text', required: true },
  { name: 'sector', label: 'সেক্টর', type: 'select', options: SECTORS, placeholder: 'জানা নেই' },
  { name: 'village', label: 'গ্রাম', type: 'text', required: true },
  { name: 'union', label: 'ইউনিয়ন', type: 'select', options: UNIONS, required: true },
  { name: 'alive', label: 'জীবিত আছেন', type: 'checkbox' },
  { name: 'photo', label: 'ছবি', type: 'image' },
];

/* ---------- notable persons ---------- */
export interface NotablePerson {
  id: string;
  name: string;
  title: string;
  field: string;
  born: string | null;
  died: string | null;
  photo: string | null;
  excerpt: string;
  body: string;
  published: boolean;
  updatedAt: string;
}
export interface NotableQuery extends ListQuery {
  field?: string;
}
export const notableSchema = z.object({
  name: text(3, 'নাম লিখুন'),
  title: text(3, 'এক লাইনে পরিচয় লিখুন'),
  field: z.string().min(1, 'ক্ষেত্র বেছে নিন'),
  born: z.string().trim().transform((v) => v || null),
  died: z.string().trim().transform((v) => v || null),
  photo: photoField,
  excerpt: z.string().trim().min(20, 'অন্তত ২০ অক্ষরের সারসংক্ষেপ লিখুন').max(240, '২৪০ অক্ষরের মধ্যে রাখুন'),
  body: z.string().trim().min(100, 'জীবনী অন্তত ১০০ অক্ষরের হোক'),
  published: z.boolean(),
});
export type NotableForm = z.input<typeof notableSchema>;
export const notableEmpty: NotableForm = { name: '', title: '', field: '', born: '', died: '', photo: null, excerpt: '', body: '', published: false };
export const notableFields: FieldSpec[] = [
  { name: 'name', label: 'নাম', type: 'text', required: true },
  { name: 'title', label: 'পরিচয় (এক লাইনে)', type: 'text', required: true, placeholder: 'যেমন: শিক্ষাবিদ ও ভাষাসৈনিক' },
  { name: 'field', label: 'ক্ষেত্র', type: 'choice', options: NOTABLE_FIELDS, required: true },
  { name: 'born', label: 'জন্ম সাল', type: 'text', placeholder: '১৯২৮' },
  { name: 'died', label: 'মৃত্যু সাল', type: 'text', placeholder: 'জীবিত হলে খালি রাখুন' },
  { name: 'photo', label: 'ছবি', type: 'image' },
  { name: 'excerpt', label: 'সারসংক্ষেপ', type: 'textarea', rows: 2, required: true, hint: 'তালিকার কার্ডে দেখাবে, ২৪০ অক্ষরের মধ্যে' },
  { name: 'body', label: 'জীবনী', type: 'textarea', rows: 14, required: true, hint: 'অনুচ্ছেদের মাঝে একটি ফাঁকা লাইন রাখুন' },
  { name: 'published', label: 'সাইটে প্রকাশ করুন', type: 'checkbox', section: 'প্রকাশ', hint: 'না দিলে খসড়া হিসেবে থাকবে' },
];

/* ---------- achievers ---------- */
export interface Achiever {
  id: string;
  name: string;
  cadre: string;
  batch: string | null;
  post: string;
  workplace: string;
  village: string;
  union: string;
  photo: string | null;
  updatedAt: string;
}
export interface AchieverQuery extends ListQuery {
  cadre?: string;
}
export const achieverSchema = z.object({
  name: text(3, 'নাম লিখুন'),
  cadre: z.string().min(1, 'ক্যাডার বেছে নিন'),
  batch: z.string().trim().transform((v) => v || null),
  post: text(2, 'পদ লিখুন'),
  workplace: text(2, 'কর্মস্থল লিখুন'),
  village: optionalText,
  union: z.string(),
  photo: photoField,
});
export type AchieverForm = z.input<typeof achieverSchema>;
export const achieverEmpty: AchieverForm = { name: '', cadre: '', batch: '', post: '', workplace: '', village: '', union: '', photo: null };
export const achieverFields: FieldSpec[] = [
  { name: 'name', label: 'নাম', type: 'text', required: true },
  { name: 'cadre', label: 'ক্যাডার', type: 'select', options: CADRES, required: true },
  { name: 'batch', label: 'বিসিএস ব্যাচ', type: 'text', placeholder: '৩৮তম' },
  { name: 'post', label: 'বর্তমান পদ', type: 'text', required: true },
  { name: 'workplace', label: 'কর্মস্থল', type: 'text', required: true, wide: true },
  { name: 'village', label: 'গ্রাম', type: 'text' },
  { name: 'union', label: 'ইউনিয়ন', type: 'select', options: UNIONS },
  { name: 'photo', label: 'ছবি', type: 'image' },
];
