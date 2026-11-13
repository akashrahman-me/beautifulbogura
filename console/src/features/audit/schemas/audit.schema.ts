import type { ListQuery, StaffRole } from '@/types/api';

/** One recorded staff action. Written by the API on every admin write; never editable. */
export interface AuditEntry {
  id: string;
  at: string;
  actor: { id: string; name: string; role: StaffRole };
  /** Verb key, e.g. `review.approve`, `post.remove`, `user.ban`. */
  action: string;
  resource: { type: string; id: string; label: string };
  reason: string | null;
  /** Changed fields, for edits: `{ field: [before, after] }`. */
  changes: Record<string, [unknown, unknown]> | null;
}

export interface AuditQuery extends ListQuery {
  actor?: string;
  action?: string;
  type?: string;
  from?: string;
  to?: string;
}

const ACTIONS: Record<string, string> = {
  'review.approve': 'অনুমোদন দিয়েছেন',
  'review.reject': 'বাতিল করেছেন',
  'report.dismiss': 'রিপোর্ট খারিজ করেছেন',
  'report.resolve': 'রিপোর্টের ব্যবস্থা নিয়েছেন',
  'post.remove': 'পোস্ট সরিয়েছেন',
  'post.restore': 'পোস্ট ফিরিয়েছেন',
  'post.feature': 'ফিচার্ড করেছেন',
  'post.unfeature': 'ফিচার্ড থেকে সরিয়েছেন',
  'post.verify': 'যাচাইকৃত করেছেন',
  'post.unverify': 'যাচাইকৃত থেকে সরিয়েছেন',
  'post.extend': 'মেয়াদ বাড়িয়েছেন',
  'user.ban': 'নিষিদ্ধ করেছেন',
  'user.unban': 'নিষেধাজ্ঞা তুলেছেন',
  'content.create': 'যুক্ত করেছেন',
  'content.update': 'হালনাগাদ করেছেন',
  'content.delete': 'মুছে ফেলেছেন',
  'content.restore': 'ফিরিয়ে এনেছেন',
  'staff.invite': 'আমন্ত্রণ পাঠিয়েছেন',
  'staff.role': 'ভূমিকা বদলেছেন',
  'staff.remove': 'স্টাফ থেকে সরিয়েছেন',
  'settings.update': 'সেটিংস বদলেছেন',
  'announcement.publish': 'ঘোষণা প্রকাশ করেছেন',
  'push.send': 'নোটিফিকেশন পাঠিয়েছেন',
  'voters.import': 'ভোটার তালিকা ইমপোর্ট করেছেন',
  'voters.search': 'ভোটার খুঁজেছেন',
};
export const actionLabel = (a: string) => ACTIONS[a] ?? a;
export const AUDIT_ACTIONS = Object.entries(ACTIONS).map(([value, label]) => ({ value, label }));

export const RESOURCE_TYPES = [
  { value: 'submission', label: 'জমা দেওয়া তথ্য' },
  { value: 'report', label: 'রিপোর্ট' },
  { value: 'post', label: 'পোস্ট' },
  { value: 'user', label: 'ব্যবহারকারী' },
  { value: 'content', label: 'তথ্যভান্ডার' },
  { value: 'staff', label: 'স্টাফ' },
  { value: 'settings', label: 'সেটিংস' },
  { value: 'announcement', label: 'ঘোষণা' },
  { value: 'voters', label: 'ভোটার তালিকা' },
] as const;
