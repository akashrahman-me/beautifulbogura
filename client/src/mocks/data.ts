/**
 * Sample data for NEXT_PUBLIC_DATA_MODE=demo. Every person, number and business here is fictional
 * (numbers follow the 01700-000xxx pattern). Places are real Bogura areas.
 */
const now = Date.now();
const DAY = 864e5;
const ago = (d: number, h = 0) => new Date(now - d * DAY - h * 36e5).toISOString();
const ahead = (d: number) => new Date(now + d * DAY).toISOString();
let seq = 100;
export const nextId = (p: string) => `${p}_${++seq}`;
const phone = (n: number) => `01700000${String(n).padStart(3, '0')}`;

export const AREAS = ['সাতমাথা', 'মালতীনগর', 'জলেশ্বরীতলা', 'শেরপুর রোড', 'নামাজগড়', 'কলোনি', 'ঠনঠনিয়া', 'চকসূত্রাপুর', 'বনানী', 'খান্দার', 'সুত্রাপুর', 'কাটনারপাড়া'];
const area = (i: number) => `${AREAS[i % AREAS.length]}, বগুড়া`;

/* ---------- weather ---------- */
export const weather = {
  place: 'বগুড়া', temp: 24, condition: 'আংশিক মেঘলা', icon: 'cloud-sun', rain: 10, humidity: 68, wind: 8, updatedAt: ago(0, 0),
  forecast: [
    { day: 'শনি', icon: 'sun', hi: 27, lo: 16 },
    { day: 'রবি', icon: 'cloud-sun', hi: 26, lo: 17 },
    { day: 'সোম', icon: 'rain', hi: 23, lo: 18 },
  ],
};

/* ---------- doctors ---------- */
const SPEC = ['মেডিসিন', 'শিশু', 'গাইনি', 'হৃদরোগ', 'নাক-কান-গলা', 'দন্ত', 'অর্থোপেডিক', 'চর্ম ও যৌন', 'মানসিক', 'চক্ষু', 'নিউরোলজি', 'হোমিওপ্যাথি'];
const DOC_NAMES = ['ডা. সাবরিনা ইয়াসমিন', 'ডা. মো. রফিকুল ইসলাম', 'ডা. তানভীর আহমেদ', 'ডা. নুসরাত জাহান', 'ডা. মাহমুদুল হাসান', 'ডা. ফারহানা আক্তার', 'ডা. শফিকুল আলম', 'ডা. রুমানা পারভীন', 'ডা. আরিফুর রহমান', 'ডা. সুমাইয়া খাতুন', 'ডা. কামরুল হাসান', 'ডা. ইশরাত জেরিন', 'ডা. জাহিদুল ইসলাম', 'ডা. নাজমুন নাহার', 'ডা. মো. আসাদুজ্জামান', 'ডা. তাহমিনা সুলতানা'];
const HOSP = ['সেবা ক্লিনিক, সাতমাথা', 'নিরাময় হাসপাতাল, শেরপুর রোড', 'করতোয়া ডায়াগনস্টিক, জলেশ্বরীতলা', 'আরোগ্য মেডিকেল সেন্টার, ঠনঠনিয়া', 'শান্তি হাসপাতাল, মালতীনগর'];
const DEG = [['MBBS', 'FCPS'], ['MBBS', 'MD'], ['MBBS', 'MS'], ['BDS'], ['MBBS', 'FCPS', 'FRCS'], ['MBBS', 'DCH'], ['DHMS']];
export const doctors = DOC_NAMES.map((name, i) => {
  const specialty = SPEC[i % SPEC.length];
  return {
    id: `doc_${i + 1}`,
    name,
    specialty,
    degrees: specialty === 'দন্ত' ? ['BDS'] : specialty === 'হোমিওপ্যাথি' ? ['DHMS'] : DEG[i % 5],
    phone: phone(400 + i),
    photo: null,
    about: `${specialty} বিষয়ে ${10 + i} বছরের অভিজ্ঞতা।`,
    chambers: [
      { hospital: HOSP[i % HOSP.length], days: i % 3 === 0 ? [6, 0, 1, 2, 3, 4] : i % 3 === 1 ? [0, 2, 4] : [1, 3, 5, 6], time: i % 2 ? 'সন্ধ্যা ৬টা – রাত ১০টা' : 'বিকেল ৪টা – রাত ৯টা', serial: phone(500 + i), fee: [500, 600, 800, 1000, 700][i % 5] },
      ...(i % 4 === 0 ? [{ hospital: HOSP[(i + 2) % HOSP.length], days: [5], time: 'সকাল ১০টা – দুপুর ১টা', serial: phone(520 + i), fee: 600 }] : []),
    ],
  };
});

/* ---------- donors ---------- */
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const DONOR_NAMES = ['আবদুল্লাহ আল মামুন', 'তাসলিমা খাতুন', 'রাকিব হাসান', 'সাদিয়া ইসলাম', 'মেহেদী হাসান', 'নুসরাত জাহান', 'ইমরান হোসেন', 'ফারজানা আক্তার', 'সজীব আহমেদ', 'মারিয়া সুলতানা', 'তানজিল ইসলাম', 'রুবিনা পারভীন', 'আশিকুর রহমান', 'জান্নাতুল ফেরদৌস', 'নাঈম ইসলাম', 'শারমিন সুলতানা', 'মাসুদ রানা', 'সুমাইয়া আক্তার', 'হাসিবুল ইসলাম', 'লাবণী খাতুন', 'রিফাত হোসেন', 'তানিয়া আক্তার', 'আল আমিন', 'মিম আক্তার'];
const DONATION_AGO = [124, 54, 200, null, 95, 130, 18, 160, 300, 77, null, 140, 45, 122, 400, 10, 131, 88, null, 180, 121, 60, 250, 33];
export const donors = DONOR_NAMES.map((name, i) => ({
  id: `don_${i + 1}`,
  name,
  group: GROUPS[(i * 3) % 8],
  phone: phone(600 + i),
  address: area(i),
  lastDonation: DONATION_AGO[i] == null ? null : ago(DONATION_AGO[i] as number),
}));

/* ---------- directory ---------- */
type Entry = { id: string; type: string; name: string; role?: string; phone?: string; whatsapp?: boolean; address?: string; hours?: string; description?: string; verified?: boolean; rating?: number; ratingCount?: number; mapUrl?: string };
const D = (type: string, rows: Omit<Entry, 'id' | 'type'>[]): Entry[] => rows.map((r, i) => ({ id: `${type}_${i + 1}`, type, ...r }));
let pn = 100;
const p = () => phone(pn++);

export const directory: Entry[] = [
  ...D('police', [
    { name: 'অফিসার ইনচার্জ (ওসি)', role: 'বগুড়া সদর থানা', phone: p(), address: 'থানা রোড, বগুড়া', hours: '২৪ ঘণ্টা খোলা' },
    { name: 'ওসি (তদন্ত)', role: 'বগুড়া সদর থানা', phone: p(), address: 'থানা রোড, বগুড়া' },
    { name: 'ওসি (হাইওয়ে)', role: 'বনানী হাইওয়ে থানা', phone: p(), address: 'বনানী মোড়, বগুড়া' },
    { name: 'ডিউটি অফিসার', role: 'বগুড়া সদর থানা', phone: p(), address: 'থানা রোড, বগুড়া', hours: '২৪ ঘণ্টা' },
  ]),
  ...D('fire-service', [
    { name: 'বগুড়া ফায়ার সার্ভিস ও সিভিল ডিফেন্স', role: 'স্টেশন অফিসার', phone: p(), address: 'ফায়ার সার্ভিস মোড়, বগুড়া', hours: '২৪ ঘণ্টা', description: 'আগুন লাগলে আগে ৯৯৯ নম্বরে কল করুন।' },
    { name: 'ফায়ার সার্ভিস কন্ট্রোল রুম', role: 'বিকল্প নম্বর', phone: p(), address: 'ফায়ার সার্ভিস মোড়, বগুড়া', hours: '২৪ ঘণ্টা' },
  ]),
  ...D('ambulance', [
    { name: 'সদর হাসপাতাল অ্যাম্বুলেন্স', role: 'সরকারি অ্যাম্বুলেন্স', phone: p(), address: 'সদর হাসপাতাল', hours: '২৪ ঘণ্টা' },
    { name: 'আল-মারকাজুল লাশবাহী সেবা', role: 'লাশবাহী গাড়ি', phone: p(), address: 'কলোনি, বগুড়া' },
    { name: 'জীবনসেবা অ্যাম্বুলেন্স', role: 'এসি অ্যাম্বুলেন্স', phone: p(), whatsapp: true, address: 'শেরপুর রোড, বগুড়া', hours: '২৪ ঘণ্টা' },
    { name: 'মানবতা অ্যাম্বুলেন্স সার্ভিস', role: 'আইসিইউ অ্যাম্বুলেন্স', phone: p(), whatsapp: true, address: 'ঠনঠনিয়া, বগুড়া' },
  ]),
  ...D('electricity', [
    { name: 'পল্লী বিদ্যুৎ সমিতি (পবিস)', role: 'অভিযোগ কেন্দ্র', phone: p(), address: 'বনানী, বগুড়া', hours: '২৪ ঘণ্টা' },
    { name: 'বিদ্যুৎ উন্নয়ন বোর্ড (পিডিবি)', role: 'বিতরণ বিভাগ', phone: p(), address: 'সাতমাথা, বগুড়া' },
  ]),
  ...D('hospital', [
    { name: 'সদর হাসপাতাল', role: 'সরকারি হাসপাতাল', phone: p(), address: 'সদর হাসপাতাল রোড', hours: '২৪ ঘণ্টা জরুরি বিভাগ', verified: true },
    { name: 'সেবা ক্লিনিক', role: 'বেসরকারি ক্লিনিক', phone: p(), address: area(0), verified: true },
    { name: 'নিরাময় হাসপাতাল', role: 'বেসরকারি হাসপাতাল', phone: p(), address: area(3) },
    { name: 'হাসি ডেন্টাল কেয়ার', role: 'ডেন্টাল ক্লিনিক', phone: p(), address: area(2) },
  ]),
  ...D('office', [
    { name: 'উপজেলা নির্বাহী অফিসারের কার্যালয়', role: 'সরকারি অফিস', phone: p(), address: 'উপজেলা পরিষদ, বগুড়া সদর', hours: 'রবি–বৃহস্পতি, সকাল ৯টা – বিকেল ৫টা', mapUrl: 'https://maps.google.com/?q=Bogura+Sadar+Upazila' },
    { name: 'উপজেলা ভূমি অফিস', role: 'সরকারি অফিস', phone: p(), address: 'উপজেলা পরিষদ, বগুড়া সদর', mapUrl: 'https://maps.google.com/?q=Bogura' },
    { name: 'পাসপোর্ট অফিস', role: 'আঞ্চলিক কার্যালয়', phone: p(), address: 'জলেশ্বরীতলা, বগুড়া', mapUrl: 'https://maps.google.com/?q=Bogura' },
    { name: 'উপজেলা স্বাস্থ্য কমপ্লেক্স', role: 'সরকারি অফিস', phone: p(), address: 'বগুড়া সদর', mapUrl: 'https://maps.google.com/?q=Bogura' },
  ]),
  ...D('kazi', [
    { name: 'কাজী মাওলানা আবদুর রশিদ', role: 'নিকাহ রেজিস্ট্রার, ১২ নং ওয়ার্ড', phone: p(), address: area(4) },
    { name: 'কাজী মো. হাবিবুর রহমান', role: 'নিকাহ রেজিস্ট্রার, নুনগোলা ইউনিয়ন', phone: p(), address: 'নুনগোলা, বগুড়া সদর' },
  ]),
  ...D('bank', [
    { name: 'সোনালী ব্যাংক, কর্পোরেট শাখা', role: 'সরকারি ব্যাংক', phone: p(), address: area(0), hours: 'রবি–বৃহস্পতি, সকাল ১০টা – বিকেল ৪টা' },
    { name: 'ইসলামী ব্যাংক, বগুড়া শাখা', role: 'বেসরকারি ব্যাংক', phone: p(), address: area(2) },
    { name: 'ব্র্যাক ব্যাংক, সাতমাথা শাখা', role: 'বেসরকারি ব্যাংক', phone: p(), address: area(0) },
    { name: 'ডাচ্‌-বাংলা ব্যাংক, শেরপুর রোড শাখা', role: 'বেসরকারি ব্যাংক', phone: p(), address: area(3) },
  ]),
  ...D('courier', [
    { name: 'সুন্দরবন কুরিয়ার সার্ভিস', role: 'বগুড়া শাখা', phone: p(), address: area(2) },
    { name: 'এস এ পরিবহন', role: 'বগুড়া শাখা', phone: p(), address: area(0) },
    { name: 'স্টেডফাস্ট কুরিয়ার', role: 'হাব', phone: p(), whatsapp: true, address: area(5) },
  ]),
  ...D('isp', [
    { name: 'করতোয়া নেট', role: 'ব্রডব্যান্ড ইন্টারনেট', phone: p(), whatsapp: true, address: area(1), description: '১০ এমবিপিএস থেকে প্যাকেজ শুরু' },
    { name: 'বগুড়া অনলাইন', role: 'ব্রডব্যান্ড ইন্টারনেট', phone: p(), whatsapp: true, address: area(6) },
    { name: 'স্পিডলিংক বিডি', role: 'ফাইবার ইন্টারনেট', phone: p(), address: area(8) },
  ]),
  ...D('journalist', [
    { name: 'মো. আতিকুর রহমান', role: 'দৈনিক করতোয়া', phone: p() },
    { name: 'শাহনাজ পারভীন', role: 'একাত্তর টিভি (জেলা প্রতিনিধি)', phone: p() },
    { name: 'রবিউল ইসলাম', role: 'দৈনিক সাতমাথা', phone: p() },
  ]),
  ...D('lawyer', [
    { name: 'অ্যাড. নাসরিন আক্তার', role: 'আইনজীবী · জজ কোর্ট, বগুড়া', phone: p(), whatsapp: true, address: 'আদালত পাড়া', verified: true },
    { name: 'অ্যাড. মো. শামীম হোসেন', role: 'আইনজীবী · জেলা জজ আদালত', phone: p(), address: 'আদালত পাড়া' },
    { name: 'অ্যাড. ফাহিম মুনতাসির', role: 'আইনজীবী · পারিবারিক আদালত', phone: p(), address: 'আদালত পাড়া' },
  ]),
  ...D('cleaner', [
    { name: 'পরিচ্ছন্ন সেবা', role: 'বাসা ও অফিস পরিষ্কার', phone: p(), whatsapp: true, address: area(7) },
    { name: 'মো. ছামাদ', role: 'পরিচ্ছন্নতা কর্মী', phone: p(), address: area(9) },
  ]),
  ...D('gym', [
    { name: 'ফিট লাইফ জিম', role: 'জিম ও ফিটনেস', phone: p(), address: area(0), hours: 'সকাল ৬টা – রাত ১০টা' },
    { name: 'পাওয়ার হাউস ফিটনেস', role: 'জিম (নারী ও পুরুষ আলাদা শিফট)', phone: p(), address: area(3) },
  ]),
  ...D('parlour-ladies', [
    { name: 'রূপসী বিউটি পার্লার', role: 'লেডিস পার্লার', phone: p(), whatsapp: true, address: area(1) },
    { name: 'সাজঘর', role: 'লেডিস পার্লার ও ব্রাইডাল', phone: p(), whatsapp: true, address: area(2) },
    { name: 'নন্দিনী বিউটি কেয়ার', role: 'লেডিস পার্লার', phone: p(), address: area(10) },
  ]),
  ...D('parlour-gents', [
    { name: 'স্টাইল জোন সেলুন', role: 'জেন্টস পার্লার', phone: p(), address: area(0) },
    { name: 'ক্লাসিক হেয়ার কাট', role: 'সেলুন', phone: p(), address: area(5) },
  ]),
  ...D('market', [
    { name: 'রাজাবাজার', role: 'প্রতিদিন · কাঁচাবাজার', address: area(2) },
    { name: 'মহাস্থান হাট', role: 'রবি ও বুধবার', address: 'মহাস্থান, শিবগঞ্জ' },
    { name: 'ফতেহ আলী বাজার', role: 'প্রতিদিন', address: area(0) },
  ]),
  ...D('air-travel', [
    { name: 'বগুড়া ট্রাভেলস', role: 'এয়ার টিকিট ও ভিসা', phone: p(), whatsapp: true, address: area(0) },
    { name: 'স্কাই ওয়ে ট্যুরস', role: 'এয়ার টিকিট, হজ ও ওমরাহ', phone: p(), whatsapp: true, address: area(2) },
  ]),
  ...D('it-expert', [
    { name: 'রাকিবুল হাসান', role: 'ওয়েব ডেভেলপার ও আইটি পরামর্শক', phone: p(), whatsapp: true, address: area(1), description: 'ওয়েবসাইট, সফটওয়্যার ও কম্পিউটার সার্ভিসিং' },
  ]),
  ...D('matchmaker', [
    { name: 'ঘটক আবুল কাশেম', role: 'পাত্র-পাত্রী সন্ধান', phone: p(), address: area(6) },
    { name: 'বন্ধন ম্যারেজ মিডিয়া', role: 'ম্যারেজ মিডিয়া', phone: p(), whatsapp: true, address: area(0) },
  ]),
  ...D('restaurant', [
    { name: 'আকবরিয়া হোটেল', role: 'বাংলা খাবার · দই', phone: p(), address: area(0), rating: 4.6, ratingCount: 210 },
    { name: 'করতোয়া রেস্তোরাঁ', role: 'চাইনিজ ও থাই', phone: p(), address: area(2), rating: 4.2, ratingCount: 84 },
    { name: 'দই ঘর', role: 'বগুড়ার দই ও মিষ্টি', phone: p(), address: area(0), rating: 4.8, ratingCount: 312 },
  ]),
  ...D('hotel', [
    { name: 'হোটেল নাজ গার্ডেন', role: 'আবাসিক হোটেল', phone: p(), address: 'সিলিমপুর, বগুড়া', verified: true },
    { name: 'হোটেল সেফওয়ে', role: 'আবাসিক হোটেল', phone: p(), address: area(0) },
    { name: 'পর্যটন মোটেল', role: 'সরকারি মোটেল', phone: p(), address: 'মহাস্থান' },
  ]),
  ...D('tourist-spot', [
    { name: 'মহাস্থানগড়', role: 'প্রত্নতাত্ত্বিক স্থান', address: 'শিবগঞ্জ, বগুড়া', description: 'প্রাচীন পুণ্ড্রনগরের ধ্বংসাবশেষ, বাংলার অন্যতম প্রাচীন নগর।' },
    { name: 'বেহুলার বাসর ঘর (গোকুল মেধ)', role: 'প্রত্নতাত্ত্বিক স্থান', address: 'গোকুল, বগুড়া সদর' },
    { name: 'ওয়ান্ডারল্যান্ড শিশু পার্ক', role: 'পার্ক', address: area(1) },
    { name: 'করতোয়া নদীর পাড়', role: 'প্রকৃতি', address: 'বগুড়া শহর' },
  ]),
  ...D('cook', [
    { name: 'বাবুর্চি মো. জামাল', role: 'বিয়ে ও অনুষ্ঠানের রান্না', phone: p(), address: area(4) },
    { name: 'কসাই হাফিজুর', role: 'কসাই', phone: p(), address: area(2) },
  ]),
  ...D('band-party', [
    { name: 'সুর তরঙ্গ ব্যান্ড পার্টি', role: 'ব্যান্ড পার্টি', phone: p(), address: area(7) },
    { name: 'সাউন্ড অ্যান্ড লাইট', role: 'সাউন্ড সিস্টেম ভাড়া', phone: p(), whatsapp: true, address: area(3) },
  ]),
  ...D('graphics', [
    { name: 'ক্রিয়েটিভ পয়েন্ট', role: 'গ্রাফিক্স ডিজাইন', phone: p(), whatsapp: true, address: area(0), rating: 4.5, ratingCount: 128 },
    { name: 'মুদ্রণ প্রিন্টিং প্রেস', role: 'প্রিন্টিং প্রেস', phone: p(), address: area(2), rating: 4.1, ratingCount: 46 },
    { name: 'ডিজাইন হাব', role: 'গ্রাফিক্স ও ব্যানার', phone: p(), address: area(5), rating: 3.8, ratingCount: 19 },
  ]),
];

/* ---------- jobs ---------- */
const JOBS: [string, string, number, string, string][] = [
  ['নিউ মার্কেট ইলেকট্রনিক্স', 'সেলস এক্সিকিউটিভ', 3, '৳ ১৫,০০০ – ২০,০০০', 'এইচএসসি'],
  ['করতোয়া কোচিং', 'গণিত শিক্ষক (খণ্ডকালীন)', 1, 'আলোচনা সাপেক্ষে', 'স্নাতক'],
  ['সেবা ক্লিনিক', 'রিসেপশনিস্ট', 2, '৳ ১২,০০০', 'এইচএসসি'],
  ['বগুড়া ফুডস লিমিটেড', 'ডেলিভারি ম্যান', 5, '৳ ১০,০০০ + কমিশন', 'এসএসসি'],
  ['দই ঘর', 'ক্যাশিয়ার', 1, '৳ ১৩,০০০', 'এইচএসসি'],
  ['করতোয়া নেট', 'নেটওয়ার্ক টেকনিশিয়ান', 2, '৳ ১৬,০০০ – ১৮,০০০', 'ডিপ্লোমা'],
  ['মুদ্রণ প্রিন্টিং প্রেস', 'গ্রাফিক ডিজাইনার', 1, '৳ ২০,০০০ – ২৫,০০০', 'যেকোনো'],
];
export const jobs = JOBS.map(([company, title, vacancies, salary, education], i) => ({
  id: `job_${i + 1}`, company, title, vacancies, salary, education,
  details: 'কম্পিউটার চালানোয় দক্ষতা থাকতে হবে। অভিজ্ঞদের অগ্রাধিকার দেওয়া হবে। আগ্রহীরা সিভিসহ যোগাযোগ করুন।',
  phone: phone(800 + i), whatsapp: i % 2 === 0, address: area(i), image: null as string | null,
  createdAt: ago(i + 1), deadline: i === 1 ? ago(2) : ahead([2, 0, 6, 12, 3, 20, 9][i]), status: 'active',
}));

/* ---------- buy & sell ---------- */
export const LISTING_CATEGORIES = [
  ['mobile', 'মোবাইল'], ['laptop', 'ল্যাপটপ'], ['computer', 'কম্পিউটার'], ['motorcycle', 'মোটরসাইকেল'], ['tv', 'টিভি'], ['fridge', 'ফ্রিজ'], ['sound', 'সাউন্ড সিস্টেম'], ['furniture', 'ফার্নিচার'], ['car', 'গাড়ি'], ['cycle', 'সাইকেল'], ['animal', 'পশু-পাখি'], ['land', 'জমি'], ['flat', 'ফ্ল্যাট'], ['other', 'অন্যান্য'],
] as const;
const SELL: [string, string, string, number, string][] = [
  ['mobile', 'Samsung Galaxy A54 (৮/২৫৬)', 'used', 28500, '৮ মাস ব্যবহার, বক্স ও চার্জার আছে, কোনো দাগ নেই।'],
  ['motorcycle', 'Bajaj Pulsar 150 (২০২২)', 'used', 165000, 'কাগজপত্র আপডেট, ১৮,০০০ কিমি চলেছে।'],
  ['laptop', 'HP ProBook 440 G8, Core i5', 'used', 42000, '১৬ জিবি র‍্যাম, ৫১২ জিবি এসএসডি, ব্যাটারি ভালো।'],
  ['furniture', 'সেগুন কাঠের খাট (৫ × ৭ ফুট)', 'used', 18000, 'ভালো অবস্থায় আছে, বাসা বদলের কারণে বিক্রি।'],
  ['fridge', 'Walton ফ্রিজ ২৫২ লিটার', 'new', 31500, 'নতুন, বক্স খোলা হয়নি, ওয়ারেন্টি কার্ড আছে।'],
  ['cycle', 'Phoenix সাইকেল', 'used', 6500, 'ছোটদের জন্য, ২৬ ইঞ্চি।'],
  ['animal', 'দেশি গাভী', 'new', 85000, 'দৈনিক ৮ লিটার দুধ দেয়।'],
  ['tv', 'Sony Bravia ৪৩ ইঞ্চি স্মার্ট টিভি', 'refurbished', 29000, 'সার্ভিস করা, ৬ মাস ওয়ারেন্টি।'],
];
export const listings = SELL.map(([category, title, condition, price, description], i) => ({
  id: `lst_${i + 1}`, category, title, condition, price, description, images: [] as string[],
  sellerName: ['রাকিব হাসান', 'মো. সোহেল রানা', 'তানভীর আহমেদ', 'শাহীন আলম', 'নাসির উদ্দিন', 'রুমানা আক্তার', 'আবুল কালাম', 'ফয়সাল আহমেদ'][i],
  phone: phone(300 + i), whatsapp: i % 3 !== 2, address: area(i + 2), createdAt: ago(0, (i + 1) * 5), status: 'active',
}));

/* ---------- to-let ---------- */
export const RENTAL_TYPES = [['flat', 'ফ্ল্যাট'], ['tin-shed', 'টিনশেড বাড়ি'], ['sublet', 'সাবলেট'], ['mess', 'মেস'], ['hostel', 'হোস্টেল'], ['office', 'অফিস'], ['shop', 'দোকান']] as const;
const RENT: [string, number, number, boolean, boolean, string][] = [
  ['flat', 9000, 2, true, true, 'তৃতীয় তলা, দক্ষিণমুখী, ছোট পরিবারের জন্য উপযুক্ত।'],
  ['sublet', 3500, 1, true, false, 'ছাত্রী বা চাকরিজীবী নারীর জন্য একটি রুম।'],
  ['flat', 14000, 3, true, true, 'লিফট, জেনারেটর ও পার্কিং আছে।'],
  ['mess', 2200, 1, false, false, 'ছাত্রদের মেস, সিট খালি আছে।'],
  ['shop', 12000, 1, false, false, 'মেইন রোডের পাশে দোকান, ২০০ বর্গফুট।'],
  ['tin-shed', 4500, 2, false, true, 'নিরিবিলি পরিবেশ, পানি ২৪ ঘণ্টা।'],
  ['office', 18000, 4, true, true, 'দ্বিতীয় তলা, অফিসের জন্য উপযুক্ত।'],
  ['hostel', 3000, 1, true, false, 'মেয়েদের হোস্টেল, খাবারের ব্যবস্থা আছে।'],
];
export const rentals = RENT.map(([type, rent, rooms, gas, attachedBath, description], i) => ({
  id: `rnt_${i + 1}`, type, rent, rooms, gas, attachedBath, description,
  title: `${['২', '১', '৩', '১', '১', '২', '৪', '১'][i]} রুমের ${RENTAL_TYPES.find((t) => t[0] === type)![1]}, ${AREAS[(i + 1) % AREAS.length]}`,
  ownerName: ['মো. হাবিবুর রহমান', 'রেহানা বেগম', 'আজিজুল হক', 'সাইফুল ইসলাম', 'মোস্তফা কামাল', 'জাহানারা খাতুন', 'আনিসুর রহমান', 'শিরিন আক্তার'][i],
  phone: phone(200 + i), whatsapp: i % 2 === 0, address: area(i + 1), mapUrl: 'https://maps.google.com/?q=Bogura',
  images: [] as string[], createdAt: ago(i, 3), status: i === 5 ? 'rented' : 'active', featured: i === 0 || i === 2, verified: i === 0,
}));

/* ---------- car rent ---------- */
export const VEHICLE_TYPES = [['private-car', 'প্রাইভেট কার'], ['bus', 'বাস'], ['hiace', 'হায়েস'], ['truck', 'ট্রাক'], ['other', 'অন্যান্য']] as const;
export const vehicles = [
  ['private-car', 'আলমগীর হোসেন', 'টয়োটা এক্সিও, এসি। বিয়ে, পিকনিক ও ঢাকা ট্রিপ।'],
  ['hiace', 'রাশেদুল ইসলাম', '১৪ সিটের হায়েস মাইক্রো, এসি।'],
  ['bus', 'শাহ সুলতান পরিবহন', '৪০ সিটের বাস, শিক্ষা সফর ও পিকনিক।'],
  ['truck', 'মো. বেলাল', '৫ টন ট্রাক, মালামাল পরিবহন।'],
  ['private-car', 'জুয়েল রানা', 'নোয়া মাইক্রো, ৭ সিট।'],
  ['other', 'মো. রুবেল', 'পিকআপ ভ্যান ভাড়া, বাসা বদল।'],
].map(([type, ownerName, description], i) => ({
  id: `veh_${i + 1}`, type, ownerName, description, phone: phone(700 + i), whatsapp: i % 2 === 0,
  featured: i === 0, verified: i < 3, createdAt: ago(i * 2), status: 'active',
}));

/* ---------- tuition ---------- */
export const tuitions = [
  ['need-teacher', 'মিসেস রহমান', 'অষ্টম শ্রেণি', 'গণিত ও ইংরেজি', '', '', 'সপ্তাহে ৪ দিন, সন্ধ্যায়।'],
  ['want-to-teach', 'তানভীর আহমেদ', 'নবম–দশম', 'পদার্থ ও রসায়ন', 'বিএসসি (চলমান), সরকারি আজিজুল হক কলেজ', '৩ বছর', ''],
  ['need-teacher', 'আবুল হোসেন', 'পঞ্চম শ্রেণি', 'সব বিষয়', '', '', 'মহিলা শিক্ষক প্রয়োজন।'],
  ['want-to-teach', 'সাদিয়া ইসলাম', 'প্রথম–অষ্টম', 'বাংলা ও ইংরেজি', 'বিএ (অনার্স)', '২ বছর', ''],
  ['need-teacher', 'জাহিদ সাহেব', 'এইচএসসি', 'হিসাববিজ্ঞান', '', '', ''],
].map(([kind, name, classLevel, subject, qualification, experience, note], i) => ({
  id: `tui_${i + 1}`, kind, name, classLevel, subject, qualification, experience, note,
  phone: phone(900 + i), address: area(i + 3), photo: null as string | null, createdAt: ago(i + 1), status: 'active',
}));

/* ---------- skilled workers ---------- */
export const TRADES = [['mason', 'রাজমিস্ত্রি'], ['carpenter', 'কাঠমিস্ত্রি'], ['electrician', 'ইলেকট্রিশিয়ান'], ['tiles', 'টাইলস মিস্ত্রি'], ['paint', 'রং মিস্ত্রি'], ['car', 'গাড়ির মেকানিক'], ['ac', 'এসি মেকানিক'], ['fridge', 'ফ্রিজ মেকানিক'], ['gas', 'গ্যাসের চুলা'], ['thai-glass', 'থাই গ্লাস'], ['sanitary', 'স্যানিটারি'], ['quilt', 'লেপ-তোশক'], ['interior', 'ইন্টেরিয়র'], ['cctv', 'সিসিটিভি'], ['computer', 'কম্পিউটার'], ['tv', 'টিভি মেকানিক'], ['sewing', 'দর্জি']] as const;
export const workers = [
  ['মো. আব্দুল মালেক', ['mason', 'tiles']], ['রফিক মিস্ত্রি', ['carpenter']], ['সাইফুল ইসলাম', ['electrician', 'cctv']], ['জাহাঙ্গীর আলম', ['paint']],
  ['মো. সেলিম', ['ac', 'fridge']], ['কামাল হোসেন', ['car']], ['শহিদুল ইসলাম', ['sanitary', 'gas']], ['নুর মোহাম্মদ', ['thai-glass', 'interior']],
  ['মো. জসিম', ['computer', 'tv']], ['রহিমা খাতুন', ['sewing']], ['আলাউদ্দিন', ['quilt']], ['বাবুল মিয়া', ['electrician']],
].map(([name, trades], i) => ({ id: `wrk_${i + 1}`, name: name as string, trades: trades as string[], phone: phone(150 + i), address: area(i), createdAt: ago(i * 3) }));

/* ---------- education ---------- */
export const INSTITUTION_TYPES = [['primary', 'প্রাথমিক বিদ্যালয়'], ['secondary', 'মাধ্যমিক বিদ্যালয়'], ['college', 'কলেজ'], ['madrasa', 'মাদ্রাসা'], ['university', 'বিশ্ববিদ্যালয়'], ['technical', 'কারিগরি'], ['kindergarten', 'কিন্ডারগার্টেন']] as const;
export const institutions = [
  ['সরকারি আজিজুল হক কলেজ', 'college', '119876', '১৯৩৯', 'বনানী'],
  ['বগুড়া জিলা স্কুল', 'secondary', '119845', '১৮৫৩', 'সাতমাথা'],
  ['সরকারি মুজিবুর রহমান মহিলা কলেজ', 'college', '119880', '১৯৬৪', 'কলোনি'],
  ['বগুড়া সরকারি বালিকা উচ্চ বিদ্যালয়', 'secondary', '119846', '১৯৫০', 'সুত্রাপুর'],
  ['বগুড়া পলিটেকনিক ইনস্টিটিউট', 'technical', '139210', '১৯৬৪', 'শেরপুর রোড'],
  ['নামাজগড় সরকারি প্রাথমিক বিদ্যালয়', 'primary', '', '১৯৭২', 'নামাজগড়'],
  ['বগুড়া আলিয়া কামিল মাদ্রাসা', 'madrasa', '119901', '১৯২৯', 'চকসূত্রাপুর'],
  ['সানফ্লাওয়ার কিন্ডারগার্টেন', 'kindergarten', '', '২০০৮', 'মালতীনগর'],
].map(([name, type, eiin, established, place], i) => ({
  id: `ins_${i + 1}`, name, type, eiin, established, founder: i % 3 === 0 ? '' : 'স্থানীয় শিক্ষানুরাগীবৃন্দ',
  area: `${place}, বগুড়া`, union: '', phone: phone(50 + i), address: `${place}, বগুড়া`, website: '', about: `${name} বগুড়ার একটি ঐতিহ্যবাহী শিক্ষা প্রতিষ্ঠান।`,
  image: null, lat: 24.85 + i * 0.004, lng: 89.37 + i * 0.003, claimed: i < 3,
}));
export const notices = [
  ['ins_1', 'একাদশ শ্রেণির ভর্তি বিজ্ঞপ্তি', 'অনলাইনে আবেদন শুরু হয়েছে। বিস্তারিত কলেজের ওয়েবসাইটে।', 1],
  ['ins_2', 'বার্ষিক ক্রীড়া প্রতিযোগিতা', 'আগামী সপ্তাহে বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত হবে।', 2],
  ['ins_3', 'পরীক্ষার সময়সূচি প্রকাশ', 'অর্ধবার্ষিক পরীক্ষার সময়সূচি নোটিশ বোর্ডে দেওয়া হয়েছে।', 4],
  ['ins_1', 'শীতকালীন ছুটির নোটিশ', 'ডিসেম্বরের শেষ সপ্তাহে কলেজ বন্ধ থাকবে।', 7],
].map(([institutionId, title, body, d], i) => ({
  id: `ntc_${i + 1}`, institutionId: institutionId as string, institutionName: institutions.find((x) => x.id === institutionId)!.name,
  title: title as string, body: body as string, link: '', createdAt: ago(d as number),
}));

/* ---------- area introduction ---------- */
export const areaProfile = {
  name: 'বগুড়া সদর',
  summary: 'বগুড়া সদর উপজেলা রাজশাহী বিভাগের বগুড়া জেলার প্রাণকেন্দ্র। উত্তরবঙ্গের প্রবেশদ্বার হিসেবে পরিচিত এই শহরের পাশ দিয়ে বয়ে গেছে করতোয়া নদী, আর কাছেই প্রাচীন পুণ্ড্রনগর মহাস্থানগড়।',
  stats: [
    { label: 'সাক্ষরতার হার', value: '৭২%' },
    { label: 'ইউনিয়ন', value: '১১টি' },
    { label: 'মৌজা', value: '১৭২টি' },
    { label: 'বেকারত্ব', value: '৪.৮%' },
  ],
  sections: [
    ['location', 'অবস্থান ও প্রশাসনিক এলাকা', 'উত্তরে শিবগঞ্জ, দক্ষিণে শাজাহানপুর, পূর্বে গাবতলী ও পশ্চিমে কাহালু উপজেলা। একটি পৌরসভা ও ১১টি ইউনিয়ন নিয়ে উপজেলাটি গঠিত।'],
    ['naming', 'নামকরণের ইতিহাস', 'প্রচলিত মত অনুযায়ী সুলতান গিয়াসউদ্দিন বলবনের পুত্র বগড়া খানের নাম থেকে বগুড়া নামের উৎপত্তি।'],
    ['liberation', 'মুক্তিযুদ্ধে ভূমিকা', 'মুক্তিযুদ্ধে বগুড়া ছিল ৭ নম্বর সেক্টরের অধীন। শহর ও আশপাশে একাধিক সম্মুখ যুদ্ধ হয়।'],
    ['population', 'জনসংখ্যা', 'জনশুমারি অনুযায়ী উপজেলার জনসংখ্যা প্রায় ৬ লাখ। পৌর এলাকায় জনঘনত্ব সবচেয়ে বেশি।'],
    ['education', 'শিক্ষা', 'সরকারি আজিজুল হক কলেজ, বগুড়া জিলা স্কুলসহ বহু ঐতিহ্যবাহী শিক্ষা প্রতিষ্ঠান রয়েছে।'],
    ['economy', 'অর্থনীতি', 'কৃষি, ক্ষুদ্র শিল্প ও ব্যবসা-বাণিজ্য প্রধান। বগুড়ার দই ও কৃষি যন্ত্রাংশ শিল্প দেশজুড়ে পরিচিত।'],
    ['rivers', 'নদ-নদী', 'করতোয়া নদী শহরের মাঝ দিয়ে প্রবাহিত।'],
    ['agriculture', 'কৃষি', 'ধান, আলু, সরিষা ও শাকসবজি প্রধান ফসল।'],
    ['health', 'স্বাস্থ্যকেন্দ্র', 'সদর হাসপাতাল, উপজেলা স্বাস্থ্য কমপ্লেক্স ও বহু বেসরকারি ক্লিনিক রয়েছে।'],
    ['sports', 'খেলাধুলা ও বিনোদন', 'শহীদ চান্দু স্টেডিয়াম, বিভিন্ন পার্ক ও খেলার মাঠ।'],
  ].map(([id, title, body]) => ({ id, title, body })),
};
const UNION_NAMES = ['নুনগোলা', 'শাখারিয়া', 'এরুলিয়া', 'গোকুল', 'লাহিড়ীপাড়া', 'নামুজা', 'রাজাপুর', 'শেখেরকোলা', 'সাবগ্রাম', 'ফাঁপোর', 'নিশিন্দারা'];
export const unions = UNION_NAMES.map((name, i) => ({
  id: `uni_${i + 1}`, name, number: i + 1,
  contacts: [
    { role: 'চেয়ারম্যান', name: ['মো. আব্দুল হামিদ', 'শাহিনুর রহমান', 'মো. জাকির হোসেন'][i % 3], phone: phone(30 + i) },
    { role: 'ইউনিয়ন পরিষদ সচিব', name: 'মো. মাহবুবুর রহমান', phone: phone(40 + i) },
  ],
  villages: ['উত্তরপাড়া', 'দক্ষিণপাড়া', 'মধ্যপাড়া', `${name} পূর্ব`, `${name} পশ্চিম`].slice(0, 3 + (i % 3)),
  markets: [`${name} হাট (সোম ও বৃহস্পতি)`],
  formerChairmen: ['মো. ইউনুস আলী (২০১১–২০১৬)', 'আলহাজ্ব আব্দুর রশিদ (২০০৩–২০১১)'],
}));
export const administration = {
  officials: [
    { role: 'উপজেলা নির্বাহী অফিসার (ইউএনও)', name: 'মোছা. সুরাইয়া জাহান', phone: phone(10), photo: null },
    { role: 'সহকারী কমিশনার (ভূমি)', name: 'মো. ফাহিম শাহরিয়ার', phone: phone(11), photo: null },
  ],
  formerUnos: [
    { name: 'মো. আতিকুর রহমান', term: '২০২২–২০২৪' },
    { name: 'নাসরিন সুলতানা', term: '২০২০–২০২২' },
    { name: 'মো. শামসুল আলম', term: '২০১৭–২০২০' },
  ],
};
export const municipality = {
  name: 'বগুড়া পৌরসভা',
  summary: 'বগুড়া পৌরসভা ১৮৭৬ সালে প্রতিষ্ঠিত দেশের অন্যতম প্রাচীন পৌরসভা। এটি প্রথম শ্রেণির পৌরসভা।',
  stats: [{ label: 'ওয়ার্ড', value: '২১টি' }, { label: 'আয়তন', value: '৬৯.৫৬ বর্গকিমি' }, { label: 'প্রতিষ্ঠা', value: '১৮৭৬' }],
  services: ['জন্ম ও মৃত্যু নিবন্ধন', 'ট্রেড লাইসেন্স', 'হোল্ডিং ট্যাক্স', 'পানি সরবরাহ', 'বর্জ্য ব্যবস্থাপনা'],
  wards: Array.from({ length: 21 }, (_, i) => ({ number: i + 1, councillor: ['মো. আলমগীর হোসেন', 'রফিকুল ইসলাম', 'শাহজাহান আলী'][i % 3], phone: phone(60 + i) })),
};

/* ---------- popularity ---------- */
export const popular = ['blood-bank', 'doctors', 'emergency', 'to-let', 'jobs', 'buy-sell', 'police', 'ambulance'];
