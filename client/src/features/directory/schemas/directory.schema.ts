import { z } from 'zod';
import type { IconName } from '@/components/ui/Icon';
import type { AvatarTone } from '@/components/ui/Misc';
import { BD_MOBILE, latin } from '@/lib/utils';

export interface DirectoryEntry {
  id: string;
  type: string;
  name: string;
  role?: string;
  phone?: string;
  whatsapp?: boolean;
  address?: string;
  hours?: string;
  description?: string;
  photo?: string | null;
  verified?: boolean;
  rating?: number;
  ratingCount?: number;
  mapUrl?: string;
}

export interface DirectoryParams {
  type: string;
  search?: string;
}

export interface DirectoryType {
  title: string;
  description: string;
  icon: IconName;
  tone: AvatarTone;
  /** “+ add your info” form, published after admin review. */
  addable?: boolean;
  /** Star rating with “Rate” action (graphics, restaurants). */
  ratable?: boolean;
  /** Emergency numbers use the emergency call button. */
  emergency?: boolean;
  countLabel?: string;
}

export const DIRECTORY_TYPES: Record<string, DirectoryType> = {
  police: { title: 'থানা পুলিশ', description: 'থানার কর্মকর্তাদের সরাসরি নম্বর। জরুরি অবস্থায় আগে ৯৯৯ এ কল করুন।', icon: 'police', tone: 'emergency', emergency: true, countLabel: 'টি নম্বর' },
  'fire-service': { title: 'ফায়ার সার্ভিস', description: 'আগুন লাগলে আগে ৯৯৯ নম্বরে কল করুন, তারপর স্টেশনে।', icon: 'flame', tone: 'emergency', emergency: true, countLabel: 'টি নম্বর' },
  ambulance: { title: 'অ্যাম্বুলেন্স ও লাশবাহী গাড়ি', description: 'নম্বরে চাপ দিলেই কল হবে।', icon: 'ambulance', tone: 'emergency', emergency: true, addable: true, countLabel: 'টি সেবা' },
  electricity: { title: 'বিদ্যুৎ অফিস', description: 'পল্লী বিদ্যুৎ ও পিডিবির অভিযোগ কেন্দ্র।', icon: 'bolt', tone: 'brand', emergency: true },
  hospital: { title: 'হাসপাতাল ও ক্লিনিক', description: 'সরকারি ও বেসরকারি হাসপাতাল, ক্লিনিক ও ডেন্টাল সেন্টার।', icon: 'hospital', tone: 'brand', addable: true },
  office: { title: 'গুরুত্বপূর্ণ অফিস', description: 'সরকারি ও বেসরকারি অফিসের ঠিকানা, সময় ও ম্যাপ।', icon: 'office', tone: 'info', addable: true },
  kazi: { title: 'কাজী অফিস', description: 'নিকাহ রেজিস্ট্রারদের তালিকা।', icon: 'document', tone: 'brand', addable: true },
  bank: { title: 'ব্যাংক', description: 'ব্যাংকের শাখা, ঠিকানা ও সময়।', icon: 'bank', tone: 'brand' },
  courier: { title: 'কুরিয়ার সার্ভিস', description: 'কুরিয়ার অফিসের ঠিকানা ও নম্বর।', icon: 'courier', tone: 'brand', addable: true },
  isp: { title: 'ইন্টারনেট সেবাদাতা', description: 'ব্রডব্যান্ড ও ফাইবার ইন্টারনেট।', icon: 'wifi', tone: 'brand', addable: true },
  journalist: { title: 'সাংবাদিক', description: 'স্থানীয় ও জাতীয় গণমাধ্যমের প্রতিনিধি।', icon: 'newspaper', tone: 'info', countLabel: 'জন' },
  lawyer: { title: 'আইনজীবী', description: 'জজ কোর্ট ও জেলা আদালতের আইনজীবী।', icon: 'scale', tone: 'brand', addable: true, countLabel: 'জন' },
  cleaner: { title: 'পরিচ্ছন্নতা কর্মী', description: 'বাসা ও অফিস পরিষ্কারের লোক।', icon: 'broom', tone: 'brand', addable: true, countLabel: 'জন' },
  gym: { title: 'জিম ও ফিটনেস', description: 'জিম, সময় ও যোগাযোগ।', icon: 'gym', tone: 'accent', addable: true },
  'parlour-ladies': { title: 'লেডিস পার্লার', description: 'বিউটি পার্লার ও ব্রাইডাল সাজ।', icon: 'scissors', tone: 'accent', addable: true },
  'parlour-gents': { title: 'জেন্টস পার্লার ও সেলুন', description: 'সেলুন ও জেন্টস পার্লার।', icon: 'scissors', tone: 'accent', addable: true },
  market: { title: 'হাট-বাজার', description: 'হাটের দিন ও বাজারের অবস্থান।', icon: 'market', tone: 'gold' },
  'air-travel': { title: 'এয়ার ট্রাভেলস', description: 'বিমান টিকিট, ভিসা, হজ ও ওমরাহ।', icon: 'plane', tone: 'gold', addable: true },
  'it-expert': { title: 'আইটি বিশেষজ্ঞ', description: 'ওয়েবসাইট, সফটওয়্যার ও কম্পিউটার সার্ভিসিং।', icon: 'laptop', tone: 'info', addable: true, countLabel: 'জন' },
  matchmaker: { title: 'ঘটক', description: 'পাত্র-পাত্রী সন্ধান ও ম্যারেজ মিডিয়া।', icon: 'rings', tone: 'accent', addable: true },
  restaurant: { title: 'রেস্টুরেন্ট', description: 'বগুড়ার খাবার — দই থেকে চাইনিজ।', icon: 'restaurant', tone: 'gold', ratable: true, addable: true },
  hotel: { title: 'আবাসিক হোটেল', description: 'হোটেল, গেস্ট হাউস ও মোটেল।', icon: 'bed', tone: 'gold', addable: true },
  'tourist-spot': { title: 'দর্শনীয় স্থান', description: 'মহাস্থানগড়, পার্ক আর নদীর পাড় — ঘুরে আসুন।', icon: 'tree', tone: 'gold' },
  cook: { title: 'বাবুর্চি ও কসাই', description: 'বিয়ে ও অনুষ্ঠানের রান্না, কসাই।', icon: 'pot', tone: 'accent', addable: true, countLabel: 'জন' },
  'band-party': { title: 'ব্যান্ড পার্টি ও সাউন্ড সিস্টেম', description: 'অনুষ্ঠানের ব্যান্ড পার্টি ও সাউন্ড ভাড়া।', icon: 'music', tone: 'accent', addable: true },
  graphics: { title: 'গ্রাফিক্স ডিজাইনার ও প্রিন্টিং প্রেস', description: 'ডিজাইন, ব্যানার ও ছাপার কাজ। কাজ করিয়ে রেটিং দিন।', icon: 'printer', tone: 'info', ratable: true, addable: true },
};

export const addEntrySchema = z.object({
  name: z.string().trim().min(2, 'নাম লিখুন'),
  role: z.string().trim().max(80).optional().or(z.literal('')),
  phone: z
    .string()
    .transform((v) => latin(v).replace(/[^0-9]/g, ''))
    .refine((v) => BD_MOBILE.test(v), '১১ সংখ্যার মোবাইল নম্বর লিখুন (০১…)'),
  whatsapp: z.boolean(),
  address: z.string().trim().min(3, 'ঠিকানা লিখুন'),
  description: z.string().trim().max(300).optional().or(z.literal('')),
  website: z.string().max(0).optional(), // honeypot: bots fill it, people never see it
});
export type AddEntryInput = z.infer<typeof addEntrySchema>;
