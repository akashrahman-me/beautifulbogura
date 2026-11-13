import type { IconName } from '@/components/ui/Icon';

export type ServiceTone = 'brand' | 'accent' | 'gold' | 'info' | 'emergency';
export type ServiceCategory =
  | 'intro' | 'emergency' | 'health' | 'public' | 'lists' | 'travel' | 'courier-bank'
  | 'customer' | 'beauty' | 'office-market' | 'mechanics' | 'it' | 'rent' | 'marriage' | 'blood-buysell';

export interface Service {
  slug: string;
  label: string;
  icon: IconName;
  tone: ServiceTone;
  href: string;
  category: ServiceCategory;
  keywords?: string;
  /** Not built yet: shown in the grid, opens a “coming soon” page. */
  soon?: boolean;
}

export const CATEGORIES: { value: 'all' | ServiceCategory; label: string }[] = [
  { value: 'all', label: 'সব' },
  { value: 'intro', label: 'পরিচিতি' },
  { value: 'emergency', label: 'জরুরি' },
  { value: 'health', label: 'স্বাস্থ্য' },
  { value: 'public', label: 'সরকারি সেবা' },
  { value: 'lists', label: 'তালিকা' },
  { value: 'travel', label: 'ভ্রমণ ও থাকা' },
  { value: 'courier-bank', label: 'কুরিয়ার ও ব্যাংক' },
  { value: 'customer', label: 'গ্রাহক সেবা' },
  { value: 'beauty', label: 'রূপচর্চা ও ফিটনেস' },
  { value: 'office-market', label: 'অফিস ও বাজার' },
  { value: 'mechanics', label: 'মিস্ত্রি ও যানবাহন' },
  { value: 'it', label: 'আইটি' },
  { value: 'rent', label: 'ভাড়া' },
  { value: 'marriage', label: 'বিয়ে' },
  { value: 'blood-buysell', label: 'রক্ত ও কেনাবেচা' },
];

const dir = (type: string) => `/directory/${type}`;

/** Everything on the portal, ordered by everyday use with emergencies first. */
export const SERVICES: Service[] = [
  { slug: 'emergency', label: 'জরুরি সেবা', icon: 'siren', tone: 'emergency', href: '/emergency', category: 'emergency', keywords: '999 জরুরি' },
  { slug: 'fire-service', label: 'ফায়ার সার্ভিস', icon: 'flame', tone: 'emergency', href: dir('fire-service'), category: 'emergency', keywords: 'আগুন fire' },
  { slug: 'police', label: 'থানা পুলিশ', icon: 'police', tone: 'emergency', href: dir('police'), category: 'emergency', keywords: 'পুলিশ থানা ওসি police' },
  { slug: 'ambulance', label: 'অ্যাম্বুলেন্স', icon: 'ambulance', tone: 'emergency', href: dir('ambulance'), category: 'emergency', keywords: 'লাশবাহী ambulance' },
  { slug: 'doctors', label: 'ডাক্তার', icon: 'stethoscope', tone: 'brand', href: '/doctors', category: 'health', keywords: 'ডাক্তার চিকিৎসক doctor বিশেষজ্ঞ' },
  { slug: 'hospital', label: 'হাসপাতাল', icon: 'hospital', tone: 'brand', href: dir('hospital'), category: 'health', keywords: 'ক্লিনিক hospital' },
  { slug: 'blood-bank', label: 'রক্ত ব্যাংক', icon: 'drop', tone: 'emergency', href: '/blood-bank', category: 'blood-buysell', keywords: 'রক্ত দাতা blood donor' },
  { slug: 'electricity', label: 'বিদ্যুৎ অফিস', icon: 'bolt', tone: 'brand', href: dir('electricity'), category: 'emergency', keywords: 'বিদ্যুৎ পল্লী বিদ্যুৎ পিডিবি' },
  { slug: 'area', label: 'উপজেলা পরিচিতি', icon: 'landmark', tone: 'gold', href: '/area', category: 'intro' },
  { slug: 'municipality', label: 'পৌরসভা', icon: 'office', tone: 'gold', href: '/area/municipality', category: 'intro' },
  { slug: 'unions', label: 'ইউনিয়ন', icon: 'map', tone: 'gold', href: '/area/unions', category: 'intro' },
  { slug: 'administration', label: 'প্রশাসন', icon: 'users', tone: 'gold', href: '/area/administration', category: 'intro', keywords: 'ইউএনও এসি ল্যান্ড' },
  { slug: 'office', label: 'গুরুত্বপূর্ণ অফিস', icon: 'office', tone: 'brand', href: dir('office'), category: 'office-market' },
  { slug: 'education', label: 'শিক্ষা প্রতিষ্ঠান', icon: 'school', tone: 'info', href: '/education', category: 'public', keywords: 'স্কুল কলেজ মাদ্রাসা school' },
  { slug: 'jobs', label: 'চাকরি', icon: 'briefcase', tone: 'accent', href: '/jobs', category: 'blood-buysell', keywords: 'চাকরি job নিয়োগ' },
  { slug: 'buy-sell', label: 'কেনাবেচা', icon: 'tag', tone: 'accent', href: '/buy-sell', category: 'blood-buysell', keywords: 'বিক্রি কিনুন sell' },
  { slug: 'to-let', label: 'বাসা ভাড়া', icon: 'house', tone: 'accent', href: '/to-let', category: 'rent', keywords: 'টু-লেট ফ্ল্যাট মেস সাবলেট' },
  { slug: 'car-rent', label: 'গাড়ি ভাড়া', icon: 'car', tone: 'accent', href: '/car-rent', category: 'rent', keywords: 'মাইক্রো বাস ট্রাক' },
  { slug: 'tuition', label: 'টিউশন', icon: 'book', tone: 'info', href: '/tuition', category: 'public', keywords: 'শিক্ষক টিউটর' },
  { slug: 'workers', label: 'মিস্ত্রি', icon: 'wrench', tone: 'accent', href: '/workers', category: 'mechanics', keywords: 'রাজমিস্ত্রি ইলেকট্রিশিয়ান মেকানিক' },
  { slug: 'bank', label: 'ব্যাংক', icon: 'bank', tone: 'brand', href: dir('bank'), category: 'courier-bank' },
  { slug: 'courier', label: 'কুরিয়ার', icon: 'courier', tone: 'brand', href: dir('courier'), category: 'courier-bank' },
  { slug: 'isp', label: 'ইন্টারনেট', icon: 'wifi', tone: 'brand', href: dir('isp'), category: 'customer', keywords: 'ব্রডব্যান্ড wifi' },
  { slug: 'lawyer', label: 'আইনজীবী', icon: 'scale', tone: 'brand', href: dir('lawyer'), category: 'lists', keywords: 'উকিল' },
  { slug: 'journalist', label: 'সাংবাদিক', icon: 'newspaper', tone: 'brand', href: dir('journalist'), category: 'lists' },
  { slug: 'kazi', label: 'কাজী অফিস', icon: 'document', tone: 'brand', href: dir('kazi'), category: 'marriage', keywords: 'বিয়ে নিকাহ' },
  { slug: 'matchmaker', label: 'ঘটক', icon: 'rings', tone: 'accent', href: dir('matchmaker'), category: 'marriage' },
  { slug: 'tourist-spot', label: 'দর্শনীয় স্থান', icon: 'tree', tone: 'gold', href: dir('tourist-spot'), category: 'travel', keywords: 'মহাস্থানগড় পার্ক' },
  { slug: 'restaurant', label: 'রেস্টুরেন্ট', icon: 'restaurant', tone: 'gold', href: dir('restaurant'), category: 'travel', keywords: 'খাবার দই' },
  { slug: 'hotel', label: 'আবাসিক হোটেল', icon: 'bed', tone: 'gold', href: dir('hotel'), category: 'travel' },
  { slug: 'air-travel', label: 'এয়ার ট্রাভেলস', icon: 'plane', tone: 'gold', href: dir('air-travel'), category: 'travel', keywords: 'টিকিট ভিসা' },
  { slug: 'market', label: 'হাট-বাজার', icon: 'market', tone: 'gold', href: dir('market'), category: 'office-market' },
  { slug: 'parlour-ladies', label: 'লেডিস পার্লার', icon: 'scissors', tone: 'accent', href: dir('parlour-ladies'), category: 'beauty' },
  { slug: 'parlour-gents', label: 'জেন্টস পার্লার', icon: 'scissors', tone: 'accent', href: dir('parlour-gents'), category: 'beauty', keywords: 'সেলুন' },
  { slug: 'gym', label: 'জিম', icon: 'gym', tone: 'accent', href: dir('gym'), category: 'beauty' },
  { slug: 'cleaner', label: 'পরিচ্ছন্নতা কর্মী', icon: 'broom', tone: 'brand', href: dir('cleaner'), category: 'customer' },
  { slug: 'it-expert', label: 'আইটি বিশেষজ্ঞ', icon: 'laptop', tone: 'info', href: dir('it-expert'), category: 'it' },
  { slug: 'graphics', label: 'গ্রাফিক্স ও প্রেস', icon: 'printer', tone: 'info', href: dir('graphics'), category: 'it', keywords: 'ডিজাইন প্রিন্টিং' },
  { slug: 'cook', label: 'বাবুর্চি ও কসাই', icon: 'pot', tone: 'accent', href: dir('cook'), category: 'customer' },
  { slug: 'band-party', label: 'ব্যান্ড পার্টি', icon: 'music', tone: 'accent', href: dir('band-party'), category: 'customer', keywords: 'সাউন্ড সিস্টেম' },
  { slug: 'weather', label: 'আবহাওয়া', icon: 'cloud-sun', tone: 'info', href: '/weather', category: 'intro' },
  { slug: 'voter-info', label: 'ভোটার তথ্য', icon: 'vote', tone: 'brand', href: '/soon/voter-info', category: 'public', soon: true },
  { slug: 'freedom-fighters', label: 'মুক্তিযোদ্ধা', icon: 'medal', tone: 'gold', href: '/soon/freedom-fighters', category: 'lists', soon: true },
  { slug: 'notable-persons', label: 'বিশিষ্ট ব্যক্তি', icon: 'user', tone: 'gold', href: '/soon/notable-persons', category: 'lists', soon: true },
  { slug: 'bcs-cadres', label: 'কৃতি সন্তান', icon: 'medal', tone: 'info', href: '/soon/bcs-cadres', category: 'lists', soon: true },
  { slug: 'marriage', label: 'পাত্র-পাত্রী', icon: 'rings', tone: 'accent', href: '/soon/marriage', category: 'marriage', soon: true },
  { slug: 'videos', label: 'ভিডিও', icon: 'video', tone: 'info', href: '/soon/videos', category: 'intro', soon: true },
];

export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);

export const QUICK_LINKS: { slug: string; tone?: 'emergency' | 'accent' | 'gold' }[] = [
  { slug: 'blood-bank', tone: 'emergency' },
  { slug: 'jobs' },
  { slug: 'tuition', tone: 'gold' },
  { slug: 'ambulance', tone: 'emergency' },
  { slug: 'car-rent', tone: 'accent' },
  { slug: 'to-let', tone: 'accent' },
  { slug: 'police', tone: 'emergency' },
];

export const SOCIAL = [
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'WhatsApp', href: 'https://whatsapp.com' },
  { label: 'Telegram', href: 'https://telegram.org' },
  { label: 'TikTok', href: 'https://tiktok.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
];

/** Admin contact used by “add your info / correct / remove” notices. */
export const ADMIN_PHONE = '01700000001';
