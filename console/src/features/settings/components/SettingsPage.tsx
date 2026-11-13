'use client';

import { z } from 'zod';
import { DocEditor } from '@/components/admin/DocEditor';
import { PageHeader } from '@/components/admin/PageHeader';
import type { FieldSpec } from '@/components/admin/SpecForm';
import { intField, optionalText, phoneField, urlField } from '@/lib/validation';
import { RequirePermission } from '@/features/auth';

/** Site-wide settings the public site reads (`GET /site/settings`). */
export interface SiteSettings {
  contact: { adminPhone: string; email: string };
  social: { facebook: string; whatsapp: string; telegram: string; tiktok: string; youtube: string };
  posting: { jobDurations: number[]; rentalDays: number; tuitionDays: number; vehicleDays: number; matrimonyDays: number; maxPhotos: number; postsPerDay: number };
  moderation: { autoHideAfterReports: number; reviewSlaHours: number };
  maintenance: { enabled: boolean; message: string };
  updatedAt: string;
  updatedBy: string;
}

const days = (label: string) => intField(`${label} দিনের সংখ্যা দিন`, 1);
const schema = z
  .object({
    adminPhone: phoneField,
    email: z.union([z.email('সঠিক ইমেইল দিন'), z.literal('')]),
    facebook: urlField,
    whatsapp: urlField,
    telegram: urlField,
    tiktok: urlField,
    youtube: urlField,
    jobDurations: z.string().refine((v) => v.split(/[,،\s]+/).filter(Boolean).every((x) => /^[0-9০-৯]+$/.test(x)), 'কমা দিয়ে দিনের সংখ্যা লিখুন, যেমন ৭, ১৫, ৩০'),
    rentalDays: days('বাসা ভাড়া'),
    tuitionDays: days('টিউশন'),
    vehicleDays: days('গাড়ি ভাড়া'),
    matrimonyDays: days('পাত্র-পাত্রী'),
    maxPhotos: intField('ছবির সংখ্যা দিন', 1),
    postsPerDay: intField('দিনে কয়টি পোস্ট, লিখুন', 1),
    autoHideAfterReports: intField('রিপোর্টের সংখ্যা দিন', 1),
    reviewSlaHours: intField('ঘণ্টা লিখুন', 1),
    maintenanceEnabled: z.boolean(),
    maintenanceMessage: optionalText,
  })
  .transform((v) => ({
    contact: { adminPhone: v.adminPhone, email: v.email },
    social: { facebook: v.facebook, whatsapp: v.whatsapp, telegram: v.telegram, tiktok: v.tiktok, youtube: v.youtube },
    posting: {
      jobDurations: v.jobDurations.split(/[,،\s]+/).filter(Boolean).map((x) => Number(x.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))))),
      rentalDays: v.rentalDays,
      tuitionDays: v.tuitionDays,
      vehicleDays: v.vehicleDays,
      matrimonyDays: v.matrimonyDays,
      maxPhotos: v.maxPhotos,
      postsPerDay: v.postsPerDay,
    },
    moderation: { autoHideAfterReports: v.autoHideAfterReports, reviewSlaHours: v.reviewSlaHours },
    maintenance: { enabled: v.maintenanceEnabled, message: v.maintenanceMessage },
  }));

const fields: FieldSpec[] = [
  { name: 'adminPhone', label: 'অ্যাডমিনের নম্বর', type: 'phone', required: true, section: 'যোগাযোগ', hint: 'সাইটের নোটিশ ও ফুটারে দেখায়' },
  { name: 'email', label: 'ইমেইল', type: 'email' },
  { name: 'facebook', label: 'Facebook', type: 'url', section: 'সামাজিক মাধ্যম' },
  { name: 'whatsapp', label: 'WhatsApp', type: 'url' },
  { name: 'telegram', label: 'Telegram', type: 'url' },
  { name: 'tiktok', label: 'TikTok', type: 'url' },
  { name: 'youtube', label: 'YouTube', type: 'url' },
  { name: 'jobDurations', label: 'চাকরির বিজ্ঞাপনের মেয়াদ (দিন)', type: 'text', section: 'পোস্টের নিয়ম', hint: 'পোস্টদাতা এগুলোর একটি বেছে নেবেন' },
  { name: 'rentalDays', label: 'বাসা ভাড়া (দিন)', type: 'number' },
  { name: 'tuitionDays', label: 'টিউশন (দিন)', type: 'number' },
  { name: 'vehicleDays', label: 'গাড়ি ভাড়া (দিন)', type: 'number' },
  { name: 'matrimonyDays', label: 'পাত্র-পাত্রী (দিন)', type: 'number' },
  { name: 'maxPhotos', label: 'প্রতি পোস্টে সর্বোচ্চ ছবি', type: 'number' },
  { name: 'postsPerDay', label: 'একজন দিনে কয়টি পোস্ট দিতে পারবেন', type: 'number' },
  { name: 'autoHideAfterReports', label: 'কয়টি রিপোর্টে পোস্ট নিজে থেকে লুকাবে', type: 'number', section: 'মডারেশন', hint: 'মডারেটর দেখে সিদ্ধান্ত না নেওয়া পর্যন্ত লুকানো থাকবে' },
  { name: 'reviewSlaHours', label: 'যাচাইয়ের লক্ষ্য সময় (ঘণ্টা)', type: 'number', hint: 'এর বেশি অপেক্ষমাণ থাকলে ড্যাশবোর্ডে সতর্ক করা হবে' },
  { name: 'maintenanceEnabled', label: 'রক্ষণাবেক্ষণ মোড', type: 'checkbox', section: 'রক্ষণাবেক্ষণ', hint: 'চালু থাকলে সাইটে নতুন পোস্ট বন্ধ থাকবে; দেখা চলবে' },
  { name: 'maintenanceMessage', label: 'রক্ষণাবেক্ষণের বার্তা', type: 'textarea', rows: 2 },
];

export function SettingsPage() {
  return (
    <RequirePermission permission="settings.manage">
      <PageHeader title="সেটিংস" />
      <DocEditor
        path="/admin/settings"
        schema={schema}
        fields={fields}
        savedMessage="সেটিংস সংরক্ষণ করা হয়েছে"
        toForm={(s: SiteSettings) => ({
          adminPhone: s.contact.adminPhone,
          email: s.contact.email,
          ...s.social,
          jobDurations: s.posting.jobDurations.join(', '),
          rentalDays: String(s.posting.rentalDays),
          tuitionDays: String(s.posting.tuitionDays),
          vehicleDays: String(s.posting.vehicleDays),
          matrimonyDays: String(s.posting.matrimonyDays),
          maxPhotos: String(s.posting.maxPhotos),
          postsPerDay: String(s.posting.postsPerDay),
          autoHideAfterReports: String(s.moderation.autoHideAfterReports),
          reviewSlaHours: String(s.moderation.reviewSlaHours),
          maintenanceEnabled: s.maintenance.enabled,
          maintenanceMessage: s.maintenance.message,
        })}
      />
    </RequirePermission>
  );
}
