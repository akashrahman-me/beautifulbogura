import type { AuthProvider } from '@/types/api';

export type { AuthProvider, Session, SessionUser } from '@/types/api';

export const PROVIDERS: { id: AuthProvider; label: string }[] = [
  { id: 'google', label: 'Google দিয়ে চালিয়ে যান' },
  { id: 'facebook', label: 'Facebook দিয়ে চালিয়ে যান' },
  { id: 'apple', label: 'Apple দিয়ে চালিয়ে যান' },
];

/** Community post kinds a signed-in user can own, with where they live and what “done” means. */
export const POST_KINDS = {
  job: { label: 'চাকরি', base: '/jobs', doneLabel: 'নিয়োগ সম্পন্ন হয়েছে', doneBadge: 'নিয়োগ সম্পন্ন' },
  listing: { label: 'কেনাবেচা', base: '/listings', doneLabel: 'বিক্রি হয়ে গেছে', doneBadge: 'বিক্রি হয়েছে' },
  rental: { label: 'বাসা ভাড়া', base: '/rentals', doneLabel: 'ভাড়া হয়ে গেছে', doneBadge: 'ভাড়া হয়েছে' },
  vehicle: { label: 'গাড়ি ভাড়া', base: '/vehicles', doneLabel: undefined, doneBadge: 'বন্ধ' },
  tuition: { label: 'টিউশন', base: '/tuitions', doneLabel: 'পেয়ে গেছি', doneBadge: 'পেয়ে গেছেন' },
} as const;
export type PostKind = keyof typeof POST_KINDS;

/** One row of “আমার পোস্ট” (`GET /me/posts`). */
export interface MyPost {
  kind: PostKind;
  id: string;
  title: string;
  /** `active`, or the kind's done state (`done`, `sold`, `rented`). Deleted posts are not returned. */
  status: string;
  createdAt: string;
  /** Where the post can be seen on the site. */
  href: string;
}

/** Error codes the API may put on `/?authError=` after a failed provider round-trip. */
export const AUTH_ERRORS: Record<string, string> = {
  cancelled: 'সাইন ইন বাতিল করা হয়েছে।',
  email_required: 'সাইন ইন করতে ইমেইল শেয়ার করার অনুমতি দিন।',
  provider_error: 'সাইন ইন করা যায়নি। একটু পরে আবার চেষ্টা করুন।',
};
