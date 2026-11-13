import { z } from 'zod';
import { honeypot, phoneField, pinField, takaField } from '@/lib/validation';
import type { ListParams } from '@/types/api';

export const LISTING_CATEGORIES = [
  ['mobile', 'মোবাইল'], ['laptop', 'ল্যাপটপ'], ['computer', 'কম্পিউটার'], ['motorcycle', 'মোটরসাইকেল'], ['tv', 'টিভি'], ['fridge', 'ফ্রিজ'],
  ['sound', 'সাউন্ড সিস্টেম'], ['furniture', 'ফার্নিচার'], ['car', 'গাড়ি'], ['cycle', 'সাইকেল'], ['animal', 'পশু-পাখি'], ['land', 'জমি'], ['flat', 'ফ্ল্যাট'], ['other', 'অন্যান্য'],
] as const;
export type ListingCategory = (typeof LISTING_CATEGORIES)[number][0];
export const categoryLabel = (c: string) => LISTING_CATEGORIES.find(([v]) => v === c)?.[1] ?? c;

export const CONDITIONS = [['new', 'নতুন'], ['used', 'ব্যবহৃত'], ['refurbished', 'রিফার্বিশড'], ['parts', 'পার্টস']] as const;
export const conditionLabel = (c: string) => CONDITIONS.find(([v]) => v === c)?.[1] ?? c;

export interface Listing {
  id: string;
  category: ListingCategory;
  title: string;
  condition: (typeof CONDITIONS)[number][0];
  price: number;
  description: string;
  images: string[];
  sellerName: string;
  phone: string;
  whatsapp: boolean;
  address: string;
  createdAt: string;
  status: 'active' | 'sold' | 'deleted';
}

export interface ListingListParams extends ListParams {
  category?: ListingCategory;
}

export const createListingSchema = z.object({
  category: z.enum(LISTING_CATEGORIES.map(([v]) => v) as [ListingCategory, ...ListingCategory[]], { message: 'ক্যাটাগরি বেছে নিন' }),
  title: z.string().trim().min(3, 'পণ্যের নাম লিখুন'),
  condition: z.enum(CONDITIONS.map(([v]) => v) as ['new', 'used', 'refurbished', 'parts'], { message: 'অবস্থা বেছে নিন' }),
  price: takaField('দাম লিখুন'),
  description: z.string().trim().min(10, 'পণ্য সম্পর্কে দু-এক লাইন লিখুন'),
  images: z.array(z.instanceof(File)).max(5),
  sellerName: z.string().trim().min(2, 'আপনার নাম লিখুন'),
  phone: phoneField,
  whatsapp: z.boolean(),
  address: z.string().trim().min(2, 'এলাকার নাম লিখুন'),
  pin: pinField,
  website: honeypot,
});
export type CreateListingIn = z.input<typeof createListingSchema>;
export type CreateListingInput = z.output<typeof createListingSchema>;
/** Fields checked before moving from step 1 to step 2. */
export const LISTING_STEP_1 = ['category', 'title', 'condition', 'price', 'description', 'images'] as const;
