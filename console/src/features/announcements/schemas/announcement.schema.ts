import { z } from 'zod';
import type { FieldSpec } from '@/components/admin/SpecForm';
import { optionalText, text } from '@/lib/validation';
import type { ListQuery } from '@/types/api';

const path = z
  .string()
  .trim()
  .refine((v) => /^\/[^\s]*$/.test(v) || /^https?:\/\/\S+$/.test(v), 'সাইটের পাতা (/blood-bank) বা পুরো লিংক দিন');
const optionalPath = z
  .string()
  .trim()
  .refine((v) => !v || /^\/[^\s]*$/.test(v) || /^https?:\/\/\S+$/.test(v), 'সাইটের পাতা (/blood-bank) বা পুরো লিংক দিন');
const dateOrNull = z.string().transform((v) => (v ? new Date(v).toISOString() : null));

/* ---------- home slides (client HeroSlider) ---------- */
export const SLIDE_TONES = [
  { value: 'brand', label: 'নদী (সবুজ-নীল)' },
  { value: 'accent', label: 'মাটি (টেরাকোটা)' },
  { value: 'gold', label: 'সরিষা (হলুদ)' },
  { value: 'emergency', label: 'জরুরি (লাল)' },
];
export const SLIDE_ICONS = ['grid', 'drop', 'briefcase', 'tree', 'megaphone', 'house', 'school', 'stethoscope', 'calendar', 'bell'].map((v) => ({ value: v, label: v }));

export interface Slide {
  id: string;
  order: number;
  tone: 'brand' | 'accent' | 'gold' | 'emergency';
  icon: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  updatedAt: string;
}
export const slideSchema = z
  .object({
    order: z.string().regex(/^[0-9০-৯]+$/, 'ক্রম দিন'),
    tone: z.string().min(1, 'রং বেছে নিন'),
    icon: z.string().min(1, 'আইকন বেছে নিন'),
    eyebrow: text(2, 'ছোট শিরোনাম লিখুন'),
    title: text(4, 'শিরোনাম লিখুন').max(60, '৬০ অক্ষরের মধ্যে রাখুন'),
    body: optionalText.pipe(z.string().max(120, '১২০ অক্ষরের মধ্যে রাখুন')),
    ctaLabel: text(2, 'বোতামের লেখা দিন'),
    ctaHref: path,
    startsAt: dateOrNull,
    endsAt: dateOrNull,
    active: z.boolean(),
  })
  .transform(({ ctaLabel, ctaHref, order, ...v }) => ({ ...v, order: Number(order.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))), cta: { label: ctaLabel, href: ctaHref } }));
export type SlideForm = z.input<typeof slideSchema>;
export const slideEmpty: SlideForm = { order: '1', tone: 'brand', icon: 'megaphone', eyebrow: '', title: '', body: '', ctaLabel: '', ctaHref: '', startsAt: '', endsAt: '', active: true };
export const slideFields: FieldSpec[] = [
  { name: 'eyebrow', label: 'ছোট শিরোনাম', type: 'text', required: true, placeholder: 'রক্ত ব্যাংক' },
  { name: 'order', label: 'ক্রম', type: 'number', required: true, hint: 'ছোট সংখ্যা আগে দেখাবে' },
  { name: 'title', label: 'শিরোনাম', type: 'text', required: true, wide: true, hint: '৬০ অক্ষরের মধ্যে' },
  { name: 'body', label: 'বিবরণ', type: 'textarea', rows: 2, hint: '১২০ অক্ষরের মধ্যে' },
  { name: 'ctaLabel', label: 'বোতামের লেখা', type: 'text', required: true, placeholder: 'দাতার তালিকা' },
  { name: 'ctaHref', label: 'বোতামের লিংক', type: 'text', required: true, placeholder: '/blood-bank' },
  { name: 'tone', label: 'রং', type: 'choice', options: SLIDE_TONES, required: true },
  { name: 'icon', label: 'আইকন', type: 'select', options: SLIDE_ICONS, required: true },
  { name: 'startsAt', label: 'দেখানো শুরু', type: 'date', section: 'সময়সূচি', hint: 'খালি থাকলে এখনই' },
  { name: 'endsAt', label: 'দেখানো শেষ', type: 'date', hint: 'খালি থাকলে যতদিন চালু' },
  { name: 'active', label: 'চালু', type: 'checkbox' },
];

/* ---------- site-wide notice bar ---------- */
export interface SiteNotice {
  enabled: boolean;
  severity: 'info' | 'warning' | 'emergency';
  title: string;
  body: string;
  linkLabel: string;
  linkHref: string;
  expiresAt: string | null;
  updatedAt: string;
  updatedBy: string;
}
export const noticeSchema = z
  .object({
    enabled: z.boolean(),
    severity: z.enum(['info', 'warning', 'emergency']),
    title: z.string().trim(),
    body: optionalText,
    linkLabel: optionalText,
    linkHref: optionalPath,
    expiresAt: dateOrNull,
  })
  .superRefine((v, ctx) => {
    if (v.enabled && v.title.length < 4) ctx.addIssue({ code: 'custom', path: ['title'], message: 'চালু করতে শিরোনাম লিখুন' });
    if (v.linkLabel && !v.linkHref) ctx.addIssue({ code: 'custom', path: ['linkHref'], message: 'লিংক দিন' });
  });
export const noticeFields: FieldSpec[] = [
  { name: 'enabled', label: 'সব পাতার উপরে নোটিশ দেখান', type: 'checkbox' },
  { name: 'severity', label: 'ধরন', type: 'choice', required: true, options: [{ value: 'info', label: 'তথ্য' }, { value: 'warning', label: 'সতর্কতা' }, { value: 'emergency', label: 'জরুরি' }] },
  { name: 'title', label: 'শিরোনাম', type: 'text', wide: true, placeholder: 'বন্যা সতর্কতা: করতোয়ার পানি বিপদসীমার উপরে' },
  { name: 'body', label: 'বিবরণ', type: 'textarea', rows: 3 },
  { name: 'linkLabel', label: 'লিংকের লেখা', type: 'text', placeholder: 'আশ্রয়কেন্দ্রের তালিকা' },
  { name: 'linkHref', label: 'লিংক', type: 'text', placeholder: '/directory/office' },
  { name: 'expiresAt', label: 'নিজে থেকে বন্ধ হবে', type: 'date', hint: 'খালি থাকলে যতক্ষণ না বন্ধ করেন' },
];

/* ---------- push notifications ---------- */
export const AUDIENCES = [
  { value: 'all', label: 'সবাই (যারা চালু করেছেন)' },
  { value: 'donors', label: 'শুধু রক্তদাতা' },
];
export interface PushMessage {
  id: string;
  title: string;
  body: string;
  url: string;
  audience: 'all' | 'donors';
  /** Blood requests target one group. */
  bloodGroup: string | null;
  sentAt: string;
  sentBy: string;
  recipients: number;
  status: 'sent' | 'scheduled';
}
export type PushQuery = ListQuery;
export const pushSchema = z.object({
  title: text(4, 'শিরোনাম লিখুন').max(60, '৬০ অক্ষরের মধ্যে রাখুন'),
  body: text(4, 'বার্তা লিখুন').max(160, '১৬০ অক্ষরের মধ্যে রাখুন'),
  url: path,
  audience: z.enum(['all', 'donors']),
  bloodGroup: z.string().transform((v) => v || null),
});
export type PushForm = z.input<typeof pushSchema>;
