/**
 * Shared vocabularies — the same values the public site uses (each feature’s schemas in client/src/features).
 * Keep both in step until they move into a shared package.
 */
import type { Option } from '@/components/admin/SpecForm';

const pairs = (list: readonly (readonly [string, string])[]): Option[] => list.map(([value, label]) => ({ value, label }));
const same = (list: readonly string[]): Option[] => list.map((v) => ({ value: v, label: v }));
export const labelOf = (opts: readonly Option[], v: string | null | undefined) => opts.find((o) => o.value === v)?.label ?? v ?? '—';

export const DIRECTORY_TYPES: Option[] = [
  { value: 'police', label: 'থানা পুলিশ' },
  { value: 'fire-service', label: 'ফায়ার সার্ভিস' },
  { value: 'ambulance', label: 'অ্যাম্বুলেন্স ও লাশবাহী গাড়ি' },
  { value: 'electricity', label: 'বিদ্যুৎ অফিস' },
  { value: 'hospital', label: 'হাসপাতাল ও ক্লিনিক' },
  { value: 'office', label: 'গুরুত্বপূর্ণ অফিস' },
  { value: 'kazi', label: 'কাজী অফিস' },
  { value: 'bank', label: 'ব্যাংক' },
  { value: 'courier', label: 'কুরিয়ার সার্ভিস' },
  { value: 'isp', label: 'ইন্টারনেট সেবাদাতা' },
  { value: 'journalist', label: 'সাংবাদিক' },
  { value: 'lawyer', label: 'আইনজীবী' },
  { value: 'cleaner', label: 'পরিচ্ছন্নতা কর্মী' },
  { value: 'gym', label: 'জিম ও ফিটনেস' },
  { value: 'parlour-ladies', label: 'লেডিস পার্লার' },
  { value: 'parlour-gents', label: 'জেন্টস পার্লার ও সেলুন' },
  { value: 'market', label: 'হাট-বাজার' },
  { value: 'air-travel', label: 'এয়ার ট্রাভেলস' },
  { value: 'it-expert', label: 'আইটি বিশেষজ্ঞ' },
  { value: 'matchmaker', label: 'ঘটক' },
  { value: 'restaurant', label: 'রেস্টুরেন্ট' },
  { value: 'hotel', label: 'আবাসিক হোটেল' },
  { value: 'tourist-spot', label: 'দর্শনীয় স্থান' },
  { value: 'cook', label: 'বাবুর্চি ও কসাই' },
  { value: 'band-party', label: 'ব্যান্ড পার্টি ও সাউন্ড সিস্টেম' },
  { value: 'graphics', label: 'গ্রাফিক্স ডিজাইনার ও প্রিন্টিং প্রেস' },
];
/** Lists that show a star rating on the site. */
export const RATABLE_TYPES = ['restaurant', 'graphics'];

export const SPECIALTIES = same([
  'মেডিসিন', 'শিশু', 'গাইনি', 'হৃদরোগ', 'নাক-কান-গলা', 'দন্ত', 'অর্থোপেডিক', 'চর্ম ও যৌন', 'মানসিক', 'চক্ষু', 'নিউরোলজি', 'নিউরোসার্জারি',
  'কিডনি', 'ইউরোলজি', 'লিভার ও পরিপাকতন্ত্র', 'বক্ষব্যাধি', 'ডায়াবেটিস ও হরমোন', 'ক্যান্সার', 'জেনারেল সার্জারি', 'শিশু সার্জারি', 'প্লাস্টিক সার্জারি',
  'বাতজ্বর ও বাতব্যথা', 'ফিজিক্যাল মেডিসিন', 'পুষ্টি', 'রেডিওলজি', 'প্যাথলজি', 'অ্যানেসথেসিয়া', 'হেমাটোলজি', 'হোমিওপ্যাথি', 'ইউনানি', 'আয়ুর্বেদ',
  'ফিজিওথেরাপি', 'সাধারণ চিকিৎসক', 'অন্যান্য',
]);
export const DEGREES = same(['MBBS', 'BDS', 'FCPS', 'MD', 'MS', 'FRCS', 'MRCP', 'DCH', 'DGO', 'DDV', 'DO', 'MPH', 'BCS (স্বাস্থ্য)', 'DHMS']);
/** 0 = Sunday … 6 = Saturday, as the API stores chamber days. */
export const DAYS = pairs([['6', 'শনি'], ['0', 'রবি'], ['1', 'সোম'], ['2', 'মঙ্গল'], ['3', 'বুধ'], ['4', 'বৃহস্পতি'], ['5', 'শুক্র']]);

export const BLOOD_GROUPS = same(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']);
export const DONATION_GAP_DAYS = 120;

export const INSTITUTION_TYPES = pairs([
  ['primary', 'প্রাথমিক বিদ্যালয়'], ['secondary', 'মাধ্যমিক বিদ্যালয়'], ['college', 'কলেজ'], ['madrasa', 'মাদ্রাসা'],
  ['university', 'বিশ্ববিদ্যালয়'], ['technical', 'কারিগরি'], ['kindergarten', 'কিন্ডারগার্টেন'],
]);

export const TRADES = pairs([
  ['mason', 'রাজমিস্ত্রি'], ['carpenter', 'কাঠমিস্ত্রি'], ['electrician', 'ইলেকট্রিশিয়ান'], ['tiles', 'টাইলস মিস্ত্রি'], ['paint', 'রং মিস্ত্রি'],
  ['car', 'গাড়ির মেকানিক'], ['ac', 'এসি মেকানিক'], ['fridge', 'ফ্রিজ মেকানিক'], ['gas', 'গ্যাসের চুলা'], ['thai-glass', 'থাই গ্লাস'],
  ['sanitary', 'স্যানিটারি'], ['quilt', 'লেপ-তোশক'], ['interior', 'ইন্টেরিয়র'], ['cctv', 'সিসিটিভি'], ['computer', 'কম্পিউটার'],
  ['tv', 'টিভি মেকানিক'], ['sewing', 'দর্জি'],
]);

export const UNIONS = same(['নুনগোলা', 'শাখারিয়া', 'এরুলিয়া', 'গোকুল', 'লাহিড়ীপাড়া', 'নামুজা', 'রাজাপুর', 'শেখেরকোলা', 'সাবগ্রাম', 'ফাঁপোর', 'নিশিন্দারা', 'পৌরসভা']);

export const CADRES = pairs([
  ['admin', 'প্রশাসন'], ['police', 'পুলিশ'], ['foreign', 'পররাষ্ট্র'], ['health', 'স্বাস্থ্য'], ['education', 'শিক্ষা'],
  ['customs', 'শুল্ক ও আবগারি'], ['tax', 'কর'], ['engineering', 'প্রকৌশল'], ['agriculture', 'কৃষি'], ['judicial', 'বিচার'], ['other', 'অন্যান্য'],
]);
export const NOTABLE_FIELDS = pairs([['politics', 'রাজনীতি'], ['literature', 'সাহিত্য ও সংস্কৃতি'], ['education', 'শিক্ষা'], ['liberation', 'মুক্তিযুদ্ধ'], ['sports', 'খেলাধুলা'], ['social', 'সমাজসেবা']]);
export const VIDEO_CATEGORIES = pairs([['tourism', 'ঘুরে দেখা'], ['history', 'ইতিহাস'], ['food', 'খাবার'], ['news', 'খবর'], ['culture', 'সংস্কৃতি']]);
export const SECTORS = same(['১ নম্বর সেক্টর', '২ নম্বর সেক্টর', '৩ নম্বর সেক্টর', '৪ নম্বর সেক্টর', '৫ নম্বর সেক্টর', '৬ নম্বর সেক্টর', '৭ নম্বর সেক্টর', '৮ নম্বর সেক্টর', '৯ নম্বর সেক্টর', '১০ নম্বর সেক্টর', '১১ নম্বর সেক্টর']);
