import type { ListQuery } from '@/types/api';

export const POST_KINDS = [
  { value: 'job', label: 'চাকরি', path: '/jobs' },
  { value: 'listing', label: 'কেনাবেচা', path: '/buy-sell' },
  { value: 'rental', label: 'বাসা ভাড়া', path: '/to-let' },
  { value: 'vehicle', label: 'গাড়ি ভাড়া', path: '/car-rent' },
  { value: 'tuition', label: 'টিউশন', path: '/tuition' },
  { value: 'matrimony', label: 'পাত্র-পাত্রী', path: '/marriage' },
] as const;
export type PostKind = (typeof POST_KINDS)[number]['value'];
export const postKindLabel = (k: string) => POST_KINDS.find((x) => x.value === k)?.label ?? k;
/** Where the post can be seen on the public site. Jobs have detail pages; the rest are lists. */
export const postPath = (kind: string, id: string) => (kind === 'job' ? `/jobs/${id}` : (POST_KINDS.find((x) => x.value === kind)?.path ?? '/'));

export const POST_STATUSES = [
  { value: 'active', label: 'চালু' },
  { value: 'done', label: 'সম্পন্ন' },
  { value: 'expired', label: 'মেয়াদ শেষ' },
  { value: 'hidden', label: 'লুকানো (রিপোর্টে)' },
  { value: 'removed', label: 'সরানো হয়েছে' },
] as const;

/** A community post as staff see it: the public fields plus moderation state. */
export interface AdminPost {
  id: string;
  kind: PostKind;
  title: string;
  /** Short text: description, details or note. */
  body: string;
  phone: string;
  address: string;
  images: string[];
  owner: { id: string; name: string; banned: boolean };
  status: 'active' | 'done' | 'expired' | 'hidden' | 'removed';
  featured: boolean;
  verified: boolean;
  reports: number;
  views: number;
  createdAt: string;
  expiresAt: string | null;
  removedReason: string | null;
}

export interface PostQuery extends ListQuery {
  kind?: PostKind;
  status?: AdminPost['status'];
  featured?: boolean;
  owner?: string;
}

export const REMOVE_REASONS = ['ভুয়া বা প্রতারণা', 'নিষিদ্ধ পণ্য বা সেবা', 'অশালীন বিষয়বস্তু', 'একই পোস্ট বারবার', 'ভুল বিভাগে পোস্ট'];
