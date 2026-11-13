import { z } from 'zod';
import { honeypot, phoneField, takaField } from '@/lib/validation';
import type { ListParams } from '@/types/api';

export const RENTAL_TYPES = [['flat', 'ফ্ল্যাট'], ['tin-shed', 'টিনশেড বাড়ি'], ['sublet', 'সাবলেট'], ['mess', 'মেস'], ['hostel', 'হোস্টেল'], ['office', 'অফিস'], ['shop', 'দোকান']] as const;
export type RentalType = (typeof RENTAL_TYPES)[number][0];
export const rentalTypeLabel = (t: string) => RENTAL_TYPES.find(([v]) => v === t)?.[1] ?? t;

export interface Rental {
  id: string;
  type: RentalType;
  title: string;
  rent: number;
  rooms: number;
  gas: boolean;
  attachedBath: boolean;
  description: string;
  ownerName: string;
  phone: string;
  whatsapp: boolean;
  address: string;
  mapUrl: string;
  images: string[];
  /** Set by the server from the signed-in poster; only they can manage the post. */
  ownerId: string;
  createdAt: string;
  status: 'active' | 'rented' | 'deleted';
  featured: boolean;
  verified: boolean;
}

export interface RentalListParams extends ListParams {
  type?: RentalType;
}

export const createRentalSchema = z.object({
  ownerName: z.string().trim().min(2, 'মালিকের নাম লিখুন'),
  phone: phoneField,
  whatsapp: z.boolean(),
  type: z.enum(RENTAL_TYPES.map(([v]) => v) as [RentalType, ...RentalType[]], { message: 'ধরন বেছে নিন' }),
  rent: takaField('মাসিক ভাড়া লিখুন'),
  rooms: z.string().transform((v) => Number(v)).refine((n) => n >= 1 && n <= 20, 'রুমের সংখ্যা দিন'),
  gas: z.boolean(),
  attachedBath: z.boolean(),
  title: z.string().trim().min(5, 'একটি ছোট শিরোনাম দিন, যেমন: ২ রুমের ফ্ল্যাট, মালতীনগর'),
  description: z.string().trim().optional(),
  address: z.string().trim().min(3, 'ঠিকানা লিখুন'),
  mapUrl: z.union([z.literal(''), z.url('সঠিক গুগল ম্যাপস লিংক দিন')]).optional(),
  images: z.array(z.instanceof(File)).max(5),
  website: honeypot,
});
export type CreateRentalIn = z.input<typeof createRentalSchema>;
export type CreateRentalInput = z.output<typeof createRentalSchema>;
export const RENTAL_STEPS = [
  ['ownerName', 'phone', 'whatsapp'],
  ['type', 'rent', 'rooms', 'gas', 'attachedBath', 'title', 'description', 'address', 'mapUrl'],
  ['images'],
] as const;
