/**
 * Shared vocabularies — the same values the client and console use (their feature schemas and
 * console/src/config/catalog.ts). Keep all three in step.
 */
export const DIRECTORY_TYPES = [
  'police', 'fire-service', 'ambulance', 'electricity', 'hospital', 'office', 'kazi', 'bank', 'courier', 'isp', 'journalist', 'lawyer', 'cleaner',
  'gym', 'parlour-ladies', 'parlour-gents', 'market', 'air-travel', 'it-expert', 'matchmaker', 'restaurant', 'hotel', 'tourist-spot', 'cook',
  'band-party', 'graphics',
] as const;
/** Lists where the public may submit their own entry (reviewed before publishing). */
export const ADDABLE_DIRECTORY_TYPES = [
  'ambulance', 'hospital', 'office', 'kazi', 'courier', 'isp', 'lawyer', 'cleaner', 'gym', 'parlour-ladies', 'parlour-gents', 'air-travel',
  'it-expert', 'matchmaker', 'restaurant', 'hotel', 'cook', 'band-party', 'graphics',
] as const;
/** Lists that carry a public 1–5 star rating. */
export const RATABLE_DIRECTORY_TYPES = ['restaurant', 'graphics'] as const;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
export const DONATION_GAP_DAYS = 120;

export const INSTITUTION_TYPES = ['primary', 'secondary', 'college', 'madrasa', 'university', 'technical', 'kindergarten'] as const;
export const TRADES = ['mason', 'carpenter', 'electrician', 'tiles', 'paint', 'car', 'ac', 'fridge', 'gas', 'thai-glass', 'sanitary', 'quilt', 'interior', 'cctv', 'computer', 'tv', 'sewing'] as const;
export const CADRES = ['admin', 'police', 'foreign', 'health', 'education', 'customs', 'tax', 'engineering', 'agriculture', 'judicial', 'other'] as const;
export const NOTABLE_FIELDS = ['politics', 'literature', 'education', 'liberation', 'sports', 'social'] as const;
export const VIDEO_CATEGORIES = ['tourism', 'history', 'food', 'news', 'culture'] as const;
export const GENDERS_VOTER = ['male', 'female', 'third'] as const;

export const LISTING_CATEGORIES = ['mobile', 'laptop', 'computer', 'motorcycle', 'tv', 'fridge', 'sound', 'furniture', 'car', 'cycle', 'animal', 'land', 'flat', 'other'] as const;
export const LISTING_CONDITIONS = ['new', 'used', 'refurbished', 'parts'] as const;
export const RENTAL_TYPES = ['flat', 'tin-shed', 'sublet', 'mess', 'hostel', 'office', 'shop'] as const;
export const VEHICLE_TYPES = ['private-car', 'bus', 'hiace', 'truck', 'other'] as const;
export const TUITION_KINDS = ['need-teacher', 'want-to-teach'] as const;
export const MATRIMONY_GENDERS = ['bride', 'groom'] as const;
export const RELIGIONS = ['islam', 'hindu', 'buddhist', 'christian', 'other'] as const;
export const MARITAL_STATUSES = ['unmarried', 'divorced', 'widowed'] as const;
/** Legal minimum marriage age in Bangladesh (Child Marriage Restraint Act 2017). */
export const MIN_MARRIAGE_AGE = { bride: 18, groom: 21 } as const;

export const REPORT_REASONS = ['fake', 'sold', 'wrong-info', 'other'] as const;
export const SUBMISSION_KINDS = ['doctor', 'directory', 'institution', 'claim'] as const;

/** Community post kinds: where they live publicly and what “done” is called there. */
export const POST_KINDS = {
  job: { base: '/jobs', site: (id: string) => `/jobs/${id}`, done: 'done', label: 'চাকরি', keepDone: false },
  listing: { base: '/listings', site: () => '/buy-sell', done: 'sold', label: 'কেনাবেচা', keepDone: true },
  rental: { base: '/rentals', site: () => '/to-let', done: 'rented', label: 'বাসা ভাড়া', keepDone: true },
  vehicle: { base: '/vehicles', site: () => '/car-rent', done: 'done', label: 'গাড়ি ভাড়া', keepDone: false },
  tuition: { base: '/tuitions', site: () => '/tuition', done: 'done', label: 'টিউশন', keepDone: false },
  matrimony: { base: '/matrimony', site: () => '/marriage', done: 'done', label: 'পাত্র-পাত্রী', keepDone: false },
} as const;
export type PostKind = keyof typeof POST_KINDS;
export const POST_KIND_KEYS = Object.keys(POST_KINDS) as PostKind[];
