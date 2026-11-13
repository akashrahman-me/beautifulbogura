import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------- Bangla numerals ---------- */
const BN = '০১২৩৪৫৬৭৮৯';

/** Convert every Latin digit in a value to Bangla. */
export const bn = (value: string | number | null | undefined) =>
  String(value ?? '').replace(/[0-9]/g, (d) => BN.charAt(Number(d)));

/** Convert Bangla digits back to Latin (for tel: links, form parsing). */
export const latin = (value: string | null | undefined) =>
  String(value ?? '').replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));

/** Lakh-grouped Bangla number: 1248 → ১,২৪৮ */
export const bnNumber = (n: number) => bn(new Intl.NumberFormat('en-IN').format(n));

/** Taka amount: 28500 → ৳ ২৮,৫০০ (no paisa). */
export const money = (n: number, period?: string) => `৳ ${bnNumber(n)}${period ? `/${period}` : ''}`;

/* ---------- phone links ---------- */
export const telHref = (phone: string) => `tel:${latin(phone).replace(/[^0-9+]/g, '')}`;
export const waHref = (phone: string) => {
  let d = latin(phone).replace(/[^0-9]/g, '');
  if (d.startsWith('0')) d = `88${d}`;
  return `https://wa.me/${d}`;
};
/** Bangladeshi mobile in Bangla digits with a dash: 01700000123 → ০১৭০০-০০০১২৩ */
export const formatPhone = (phone: string) => {
  const d = latin(phone).replace(/[^0-9]/g, '');
  return bn(d.length === 11 ? `${d.slice(0, 5)}-${d.slice(5)}` : phone);
};
export const BD_MOBILE = /^01[3-9]\d{8}$/;

/* ---------- dates ---------- */
export const WEEKDAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
export const WEEKDAYS_SHORT = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
const MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const BANGLA_MONTHS = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];

const DAY = 864e5;
const toDate = (d: string | number | Date) => (d instanceof Date ? d : new Date(d));

/** “১২ জুলাই ২০২৬” (or “১২ জুলাই” when withYear is false). */
export const formatDate = (d: string | number | Date, withYear = true) => {
  const x = toDate(d);
  return `${bn(x.getDate())} ${MONTHS[x.getMonth()]}${withYear ? ` ${bn(x.getFullYear())}` : ''}`;
};

/**
 * Revised Bangladesh calendar (2019): the year starts 14 April; months 1–6 have 31 days,
 * Falgun 29 (30 in a leap year), the rest 30.
 */
export function banglaDate(d: Date) {
  const y = d.getFullYear();
  const sy = d.getMonth() > 3 || (d.getMonth() === 3 && d.getDate() >= 14) ? y : y - 1;
  let days = Math.round((Date.UTC(y, d.getMonth(), d.getDate()) - Date.UTC(sy, 3, 14)) / DAY);
  const gy = sy + 1;
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const len = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, leap ? 30 : 29, 30];
  let m = 0;
  while (days >= len[m]) days -= len[m++];
  return { day: days + 1, month: BANGLA_MONTHS[m], year: sy - 593, text: `${bn(days + 1)} ${BANGLA_MONTHS[m]} ${bn(sy - 593)}` };
}

export const greeting = (hour: number) =>
  hour >= 5 && hour < 11 ? 'শুভ সকাল' : hour < 15 && hour >= 11 ? 'শুভ দুপুর' : hour < 18 && hour >= 15 ? 'শুভ বিকেল' : hour < 20 && hour >= 18 ? 'শুভ সন্ধ্যা' : 'শুভ রাত্রি';

/** Whole days from `from` to now (or to `to`). */
export const daysSince = (from: string | Date, to: Date = new Date()) =>
  Math.floor((to.getTime() - toDate(from).getTime()) / DAY);

export const daysUntil = (until: string | Date, from: Date = new Date()) =>
  Math.ceil((toDate(until).getTime() - from.getTime()) / DAY);

/** “২ ঘণ্টা আগে”, “৩ দিন আগে”, “এইমাত্র”. */
export function timeAgo(d: string | Date, now: Date = new Date()) {
  const s = Math.max(0, (now.getTime() - toDate(d).getTime()) / 1000);
  if (s < 60) return 'এইমাত্র';
  if (s < 3600) return `${bn(Math.floor(s / 60))} মিনিট আগে`;
  if (s < 86400) return `${bn(Math.floor(s / 3600))} ঘণ্টা আগে`;
  if (s < 86400 * 30) return `${bn(Math.floor(s / 86400))} দিন আগে`;
  return formatDate(d);
}

/** Initial for an avatar, skipping honorifics. */
export const initialOf = (name: string) => {
  const s = name.replace(/^(ডা\.|মো\.|মোঃ|মোছা\.|অ্যাড\.)\s*/, '');
  return s.charAt(0) + (/[া-ৌ্]/.test(s.charAt(1)) ? s.charAt(1) : '');
};
