/* eslint-disable @typescript-eslint/no-explicit-any -- an in-memory fake of many record shapes; the real types live in each feature */
/**
 * In-browser fake of the admin API, used only when NEXT_PUBLIC_DATA_MODE=demo.
 * Same contract as console/API_CONTRACT.md: envelope, pagination, sort, error codes, the role
 * matrix (403 FORBIDDEN) and an audit entry for every write. State lives in memory for the tab;
 * the demo session survives reloads through localStorage.
 */
import { can, type Permission } from '@/lib/permissions';
import type { StaffRole, StaffUser } from '@/types/api';
import * as db from './data';

type Row = Record<string, any>;
type Req = { method: string; params: Record<string, string>; query: URLSearchParams; body: Row; user: StaffUser | null };
type Handler = (req: Req) => Response | Promise<Response>;
type Route = [method: string, pattern: string, handler: Handler, permission?: Permission];

const LATENCY = 300;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
const ok = (data: unknown, message = 'OK') => json(200, { success: true, message, data });
const created = (data: unknown, message = 'Created') => json(201, { success: true, message, data });
const fail = (status: number, code: string, message: string, errors?: { path: string; message: string }[]) => json(status, { success: false, code, message, errors });
const notFound = () => fail(404, 'NOT_FOUND', 'তথ্য পাওয়া যায়নি');

const DAY = 864e5;
const now = () => new Date().toISOString();
const ago = (d: number, h = 0) => new Date(Date.now() - d * DAY - h * 36e5).toISOString();
let seq = 5000;
const nextId = (p: string) => `${p}_${++seq}`;
const norm = (s: unknown) => String(s ?? '').toLowerCase();
const matches = (q: string | null | undefined, ...fields: unknown[]) => !q || fields.some((f) => norm(f).includes(norm(q)));

/** Sort by `field` / `-field`, then page. */
function paginate(rows: Row[], q: URLSearchParams) {
  const sort = q.get('sort');
  let out = rows;
  if (sort) {
    const desc = sort.startsWith('-');
    const key = sort.replace(/^-/, '');
    out = [...rows].sort((a, b) => {
      const x = a[key];
      const y = b[key];
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'bn');
      return desc ? -c : c;
    });
  }
  const page = Math.max(1, Number(q.get('page') ?? 1));
  const limit = Math.min(500, Math.max(1, Number(q.get('limit') ?? 20)));
  return json(200, { success: true, message: 'OK', data: out.slice((page - 1) * limit, page * limit), meta: { page, limit, total: out.length, totalPages: Math.max(1, Math.ceil(out.length / limit)) } });
}

/* =====================================================================
 * Session (demo sign-in)
 * ===================================================================== */
const SESSION_KEY = 'bb-console-demo-session';
const store = () => (typeof localStorage === 'undefined' ? null : localStorage);
const readSession = (): StaffUser | null => {
  try {
    return JSON.parse(store()?.getItem(SESSION_KEY) ?? 'null') as StaffUser | null;
  } catch {
    return null;
  }
};
const writeSession = (u: StaffUser | null) => (u ? store()?.setItem(SESSION_KEY, JSON.stringify(u)) : store()?.removeItem(SESSION_KEY));
const session = (user: StaffUser) => ({ accessToken: `demo.${user.id}`, user });

/* =====================================================================
 * Seed data
 * ===================================================================== */
const staff: Row[] = [
  { id: 'stf_1', name: 'ডেমো প্রশাসক', email: 'admin@example.com', avatar: null, provider: 'google', role: 'admin', status: 'active', invitedBy: null, invitedAt: ago(400), lastActiveAt: now() },
  { id: 'stf_2', name: 'নাসরিন সুলতানা', email: 'nasrin@example.com', avatar: null, provider: 'facebook', role: 'moderator', status: 'active', invitedBy: 'ডেমো প্রশাসক', invitedAt: ago(200), lastActiveAt: ago(0, 2) },
  { id: 'stf_3', name: 'মাহমুদুল হাসান', email: 'mahmud@example.com', avatar: null, provider: 'google', role: 'editor', status: 'active', invitedBy: 'ডেমো প্রশাসক', invitedAt: ago(120), lastActiveAt: ago(1) },
  { id: 'stf_4', name: 'রুবিনা আক্তার', email: 'rubina@example.com', avatar: null, provider: 'apple', role: 'moderator', status: 'active', invitedBy: 'ডেমো প্রশাসক', invitedAt: ago(60), lastActiveAt: ago(3) },
  { id: 'stf_5', name: '', email: 'newstaff@example.com', avatar: null, provider: null, role: 'editor', status: 'invited', invitedBy: 'ডেমো প্রশাসক', invitedAt: ago(2), lastActiveAt: null },
];

const USER_NAMES = ['রাকিব হাসান', 'মো. সোহেল রানা', 'তানভীর আহমেদ', 'শাহীন আলম', 'নাসির উদ্দিন', 'রুমানা আক্তার', 'আবুল কালাম', 'ফয়সাল আহমেদ', 'মো. হাবিবুর রহমান', 'রেহানা বেগম', 'আজিজুল হক', 'সাইফুল ইসলাম', 'মোস্তফা কামাল', 'জাহানারা খাতুন', 'আলমগীর হোসেন', 'রাশেদুল ইসলাম', 'জুয়েল রানা', 'মো. বেলাল', 'সাদিয়া ইসলাম', 'মিসেস রহমান', 'আবুল হোসেন', 'জাহিদ সাহেব', 'মরিয়ম বেগম', 'শফিকুল আলম', 'নুরুল আমিন', 'ফাতেমা খাতুন', 'দেলোয়ার হোসেন', 'সালমা আক্তার'];
const PROVIDERS = ['google', 'facebook', 'apple'];
const users: Row[] = USER_NAMES.map((name, i) => ({
  id: `usr_${i + 1}`,
  name,
  email: i % 4 === 3 ? null : `user${i + 1}@example.com`,
  avatar: null,
  provider: PROVIDERS[i % 3],
  status: i === 6 || i === 17 ? 'banned' : 'active',
  joinedAt: ago(5 + i * 7),
  lastSeenAt: ago(i % 9, i),
  ban: i === 6 || i === 17 ? { reason: i === 6 ? 'ভুয়া বা প্রতারণামূলক পোস্ট' : 'বারবার নিয়ম ভঙ্গ', at: ago(4 + i), by: 'নাসরিন সুলতানা' } : null,
}));
const owner = (i: number) => users[i % users.length];

const posts: Row[] = [];
const addPost = (kind: string, src: Row, i: number, p: Partial<Row>) => {
  const o = owner(i * 3 + kind.length);
  posts.push({
    id: src.id,
    kind,
    title: p.title,
    body: p.body ?? '',
    phone: src.phone,
    address: src.address ?? '',
    images: src.images ?? [],
    ownerId: o.id,
    status: src.status === 'active' ? 'active' : 'done',
    featured: !!src.featured,
    verified: !!src.verified,
    reports: 0,
    views: 40 + ((i * 37 + kind.length * 11) % 400),
    createdAt: src.createdAt,
    expiresAt: p.expiresAt ?? new Date(new Date(src.createdAt).getTime() + (p.days ?? 30) * DAY).toISOString(),
    removedReason: null,
  });
};
db.jobs.forEach((j, i) => addPost('job', j, i, { title: `${j.title} — ${j.company}`, body: j.details, days: 15 }));
db.listings.forEach((l, i) => addPost('listing', l, i, { title: l.title, body: l.description }));
db.rentals.forEach((r, i) => addPost('rental', r, i, { title: r.title, body: r.description }));
db.vehicles.forEach((v, i) => addPost('vehicle', { ...v, address: '' }, i, { title: `${v.ownerName} — গাড়ি ভাড়া`, body: v.description, days: 60 }));
db.tuitions.forEach((t, i) => addPost('tuition', t, i, { title: `${t.subject} — ${t.classLevel}`, body: t.note || t.qualification || 'টিউশন', days: 30 }));
db.matrimony.forEach((m, i) => addPost('matrimony', m, i, { title: `${m.gender === 'bride' ? 'পাত্রী' : 'পাত্র'}: ${m.name}`, body: m.preference, days: 90 }));
// A few older posts in other states, so every filter has something to show.
posts[2].status = 'expired';
posts[2].expiresAt = ago(2);
posts[9].status = 'removed';
posts[9].removedReason = 'ভুয়া বা প্রতারণা';
posts.filter((p) => p.ownerId === 'usr_7' || p.ownerId === 'usr_18').forEach((p) => p.status === 'active' && (p.status = 'removed', (p.removedReason = 'পোস্টদাতা নিষিদ্ধ')));

const REPORT_NOTES = ['অগ্রিম টাকা চাইছে', 'ছবি অন্য জায়গা থেকে নেওয়া', 'ফোন বন্ধ', null, 'একই পোস্ট আগেও দেখেছি', null];
const reports: Row[] = [
  [11, { fake: 4, 'wrong-info': 1 }, 'open', true],
  [4, { sold: 2 }, 'open', false],
  [20, { fake: 2, other: 1 }, 'open', false],
  [27, { 'wrong-info': 1 }, 'open', false],
  [15, { fake: 1 }, 'dismissed', false],
  [9, { fake: 5 }, 'resolved', false],
].map(([pi, reasons, status, autoHidden], i) => {
  const p = posts[pi as number];
  const count = Object.values(reasons as Row).reduce((a: number, b) => a + (b as number), 0) as number;
  p.reports = count;
  if (autoHidden) p.status = 'hidden';
  return {
    id: `rep_${i + 1}`,
    postId: p.id,
    status,
    reasons,
    count,
    notes: Array.from({ length: count }, (_, k) => ({ at: ago(k, i * 2 + 1), reason: Object.keys(reasons as Row)[k % Object.keys(reasons as Row).length], note: REPORT_NOTES[(i + k) % REPORT_NOTES.length] })),
    firstAt: ago(count, i),
    lastAt: ago(0, i * 3 + 1),
    autoHidden,
    decidedBy: status === 'open' ? null : 'নাসরিন সুলতানা',
    decisionReason: status === 'dismissed' ? 'তথ্য সঠিক পাওয়া গেছে' : status === 'resolved' ? 'ভুয়া বা প্রতারণা' : null,
  };
});

const submissions: Row[] = [
  { kind: 'doctor', title: 'ডা. মাহফুজা খাতুন', summary: 'শিশু বিশেষজ্ঞ · ১টি চেম্বার', submitter: { name: 'মাহফুজা খাতুন', phone: '01700000901', userId: null }, data: { name: 'ডা. মাহফুজা খাতুন', specialty: 'শিশু', degrees: ['MBBS', 'DCH'], phone: '01700000901', chambers: [{ hospital: 'সেবা ক্লিনিক, সাতমাথা', days: [0, 2, 4], time: 'বিকেল ৪টা – রাত ৮টা', serial: '01700000902', fee: 600 }] }, h: 50 },
  { kind: 'directory', directoryType: 'restaurant', title: 'আকবরিয়া হোটেল', summary: 'রেস্টুরেন্ট · সাতমাথা', submitter: { name: 'মো. কাশেম', phone: '01700000911', userId: null }, data: { name: 'আকবরিয়া হোটেল', role: 'রেস্টুরেন্ট', phone: '01700000911', address: 'সাতমাথা, বগুড়া', hours: 'সকাল ৭টা – রাত ১১টা', description: 'বগুড়ার দই আর কাচ্চি বিরিয়ানির জন্য পরিচিত।' }, h: 30 },
  { kind: 'institution', title: 'সুলতানগঞ্জ উচ্চ বিদ্যালয়', summary: 'মাধ্যমিক বিদ্যালয় · নুনগোলা', submitter: { name: 'আব্দুর রশিদ', phone: '01700000921', userId: null }, data: { name: 'সুলতানগঞ্জ উচ্চ বিদ্যালয়', type: 'secondary', eiin: '119990', established: '১৯৬৮', union: 'নুনগোলা', phone: '01700000921', address: 'সুলতানগঞ্জ, নুনগোলা', about: 'এলাকার একমাত্র উচ্চ বিদ্যালয়।' }, h: 26 },
  { kind: 'claim', title: 'বগুড়া জিলা স্কুল — দাবি', summary: 'সহকারী প্রধান শিক্ষক · প্রমাণ সংযুক্ত', submitter: { name: 'মো. জাকির হোসেন', phone: '01700000931', userId: 'usr_24' }, data: { institution: 'বগুড়া জিলা স্কুল', name: 'মো. জাকির হোসেন', role: 'সহকারী প্রধান শিক্ষক', phone: '01700000931', email: 'zakir@example.com', proof: 'https://example.com/id-card.jpg' }, h: 20 },
  { kind: 'directory', directoryType: 'ambulance', title: 'জীবন রক্ষা অ্যাম্বুলেন্স', summary: 'অ্যাম্বুলেন্স · ২৪ ঘণ্টা', submitter: { name: 'রাসেল আহমেদ', phone: '01700000941', userId: null }, data: { name: 'জীবন রক্ষা অ্যাম্বুলেন্স', role: 'এসি অ্যাম্বুলেন্স', phone: '01700000941', address: 'শেরপুর রোড, বগুড়া', hours: '২৪ ঘণ্টা' }, h: 9, priorRejections: 2 },
  { kind: 'doctor', title: 'ডা. ইমরান কবির', summary: 'হৃদরোগ বিশেষজ্ঞ · ২টি চেম্বার', submitter: { name: 'ইমরান কবির', phone: '01700000951', userId: null }, data: { name: 'ডা. ইমরান কবির', specialty: 'হৃদরোগ', degrees: ['MBBS', 'MD'], phone: '01700000951', chambers: [{ hospital: 'নিরাময় হাসপাতাল, শেরপুর রোড', days: [6, 1, 3], time: 'সন্ধ্যা ৬টা – রাত ১০টা', serial: '01700000952', fee: 1000 }, { hospital: 'শান্তি হাসপাতাল, মালতীনগর', days: [5], time: 'সকাল ১০টা – দুপুর ১টা', serial: '01700000953', fee: 800 }] }, h: 5 },
  { kind: 'directory', directoryType: 'graphics', title: 'রঙধনু প্রিন্টার্স', summary: 'গ্রাফিক্স ও প্রেস · কলোনি', submitter: { name: 'সুমন', phone: '01700000961', userId: null }, data: { name: 'রঙধনু প্রিন্টার্স', role: 'প্রিন্টিং প্রেস', phone: '01700000961', address: 'কলোনি, বগুড়া', description: 'ব্যানার, ভিজিটিং কার্ড, বিয়ের কার্ড।' }, h: 2 },
  { kind: 'claim', title: 'নামাজগড় সরকারি প্রাথমিক বিদ্যালয় — দাবি', summary: 'প্রধান শিক্ষক', submitter: { name: 'শাহানা পারভীন', phone: '01700000971', userId: 'usr_26' }, data: { institution: 'নামাজগড় সরকারি প্রাথমিক বিদ্যালয়', name: 'শাহানা পারভীন', role: 'প্রধান শিক্ষক', phone: '01700000971', email: null, proof: 'যোগদানপত্রের ছবি' }, h: 1 },
  { kind: 'directory', directoryType: 'hotel', title: 'হোটেল নাজ গার্ডেন', summary: 'আবাসিক হোটেল', status: 'approved', submitter: { name: 'হোটেল কর্তৃপক্ষ', phone: '01700000981', userId: null }, data: { name: 'হোটেল নাজ গার্ডেন', phone: '01700000981', address: 'ছিলিমপুর, বগুড়া' }, h: 90, decidedBy: 'মাহমুদুল হাসান' },
  { kind: 'doctor', title: 'ডা. অজানা', summary: 'অন্যান্য', status: 'rejected', submitter: { name: 'অজানা', phone: '01700000991', userId: null }, data: { name: 'ডা. অজানা', specialty: 'অন্যান্য', phone: '01700000991' }, h: 120, decidedBy: 'মাহমুদুল হাসান', reason: 'ভুল বা যাচাই করা যায়নি' },
].map((s, i) => ({
  id: `sub_${i + 1}`,
  kind: s.kind,
  status: s.status ?? 'pending',
  title: s.title,
  summary: s.summary,
  submittedAt: ago(0, s.h),
  submitter: s.submitter,
  data: s.data,
  directoryType: (s as Row).directoryType ?? null,
  decidedAt: s.status ? ago(0, s.h - 6) : null,
  decidedBy: (s as Row).decidedBy ?? null,
  reason: (s as Row).reason ?? null,
  priorRejections: (s as Row).priorRejections ?? 0,
}));

const directory: Row[] = db.directory.map((e, i) => ({ role: '', phone: '', whatsapp: false, address: '', hours: '', description: '', mapUrl: '', photo: null, verified: false, rating: null, ratingCount: 0, ...e, hidden: i % 23 === 7, updatedAt: ago(i % 40) }));
const doctors: Row[] = db.doctors.map((d, i) => ({ ...d, verified: i % 3 !== 2, hidden: false, updatedAt: ago(i * 2) }));
const donors: Row[] = db.donors.map((d, i) => ({ ...d, hidden: i === 9, createdAt: ago(30 + i * 9) }));
const workers: Row[] = db.workers.map((w) => ({ ...w, hidden: false }));
const institutions: Row[] = db.institutions.map(({ image, area: _a, claimed, ...x }, i) => ({ ...x, photo: image, union: ['', 'পৌরসভা', 'নুনগোলা'][i % 3], claimedBy: claimed ? ['প্রফেসর আব্দুল হালিম', 'মো. জাকির হোসেন', 'শাহানা পারভীন'][i] : null, hidden: false, lat: i === 7 ? null : x.lat, lng: i === 7 ? null : x.lng, updatedAt: ago(i * 5) }));
const notices: Row[] = db.notices.map((n, i) => ({ ...n, pinned: i === 0 }));
const unions: Row[] = db.unions.map((u, i) => ({ ...u, updatedAt: ago(10 + i) }));
const freedomFighters: Row[] = db.freedomFighters.map((f, i) => ({ ...f, updatedAt: ago(i) }));
const notablePersons: Row[] = db.notablePersons.map((p, i) => ({ ...p, published: i !== 5, updatedAt: ago(i * 4) }));
const achievers: Row[] = db.achievers.map((a, i) => ({ ...a, updatedAt: ago(i) }));
const videos: Row[] = db.videos.map((v, i) => ({ ...v, published: i !== 8 }));
const slides: Row[] = [
  { tone: 'brand', icon: 'grid', eyebrow: 'স্বাগতম', title: 'এক জায়গায় বগুড়ার সব সেবা', body: 'ডাক্তার, পুলিশ, স্কুল, ব্যাংক — সব তথ্য আর ফোন নম্বর হাতের কাছে।', cta: { label: 'সেবাগুলো দেখুন', href: '/services' } },
  { tone: 'emergency', icon: 'drop', eyebrow: 'রক্ত ব্যাংক', title: 'রক্ত লাগবে? দাতা খুঁজুন', body: 'গ্রুপ বেছে নিন, প্রস্তুত দাতাকে সরাসরি কল করুন।', cta: { label: 'দাতার তালিকা', href: '/blood-bank' } },
  { tone: 'accent', icon: 'briefcase', eyebrow: 'চাকরি ও কেনাবেচা', title: 'স্থানীয় চাকরি আর বিজ্ঞাপন', body: 'Google, Facebook বা Apple দিয়ে এক ক্লিকে সাইন ইন — নিজের সব পোস্ট এক জায়গা থেকে সামলান।', cta: { label: 'চাকরি দেখুন', href: '/jobs' } },
  { tone: 'gold', icon: 'tree', eyebrow: 'ভ্রমণ', title: 'মহাস্থানগড় থেকে করতোয়ার পাড়', body: '', cta: { label: 'দর্শনীয় স্থান', href: '/directory/tourist-spot' } },
].map((s, i) => ({ ...s, id: `sld_${i + 1}`, order: i + 1, startsAt: null, endsAt: null, active: true, updatedAt: ago(20) }));
const pushes: Row[] = [
  { title: 'জরুরি: O- রক্ত প্রয়োজন', body: 'শহীদ জিয়াউর রহমান মেডিকেল কলেজ হাসপাতালে আজ রাতে ২ ব্যাগ O- রক্ত দরকার।', url: '/blood-bank', audience: 'donors', bloodGroup: 'O-', sentAt: ago(1, 3), sentBy: 'ডেমো প্রশাসক', recipients: 37 },
  { title: 'নতুন সেবা: পাত্র-পাত্রী', body: 'এখন বিউটিফুল বগুড়ায় বায়োডাটা দিতে ও খুঁজতে পারবেন।', url: '/marriage', audience: 'all', bloodGroup: null, sentAt: ago(9), sentBy: 'মাহমুদুল হাসান', recipients: 1240 },
].map((p, i) => ({ ...p, id: `psh_${i + 1}`, status: 'sent' }));
const voters: Row[] = db.voters;
const voterImports: Row[] = [{ id: 'imp_1', at: ago(45), by: 'ডেমো প্রশাসক', file: 'voter-roll-2026.csv', imported: voters.length, updated: 0, skipped: 3, errors: [{ row: 58, message: 'জন্ম তারিখ বোঝা যায়নি' }, { row: 211, message: 'ভোটার নম্বর ফাঁকা' }, { row: 340, message: 'ইউনিয়নের নাম মেলেনি' }] }];

const docs: Record<string, Row> = {
  '/admin/area/profile': { ...db.areaProfile, updatedAt: ago(14), updatedBy: 'মাহমুদুল হাসান' },
  '/admin/area/administration': { ...db.administration, updatedAt: ago(30), updatedBy: 'ডেমো প্রশাসক' },
  '/admin/area/municipality': { ...db.municipality, updatedAt: ago(30), updatedBy: 'ডেমো প্রশাসক' },
  '/admin/site-notice': { enabled: false, severity: 'warning', title: '', body: '', linkLabel: '', linkHref: '', expiresAt: null, updatedAt: ago(60), updatedBy: 'ডেমো প্রশাসক' },
  '/admin/settings': {
    contact: { adminPhone: '01700000001', email: 'info@example.com' },
    social: { facebook: 'https://facebook.com/', whatsapp: 'https://wa.me/8801700000001', telegram: 'https://t.me/', tiktok: 'https://tiktok.com/', youtube: 'https://youtube.com/' },
    posting: { jobDurations: [7, 15, 20, 30], rentalDays: 30, tuitionDays: 30, vehicleDays: 60, matrimonyDays: 90, maxPhotos: 5, postsPerDay: 5 },
    moderation: { autoHideAfterReports: 5, reviewSlaHours: 24 },
    maintenance: { enabled: false, message: '' },
    updatedAt: ago(90),
    updatedBy: 'ডেমো প্রশাসক',
  },
};

/* =====================================================================
 * Audit log
 * ===================================================================== */
const audit: Row[] = [];
function log(actor: StaffUser | Row, action: string, type: string, id: string, label: string, reason: string | null = null, changes: Row | null = null, at = now()) {
  audit.unshift({ id: nextId('aud'), at, actor: { id: actor.id, name: actor.name, role: actor.role }, action, resource: { type, id, label }, reason, changes });
}
// History so the log and the dashboard have something on day one.
const SEED_LOG: [number, string, string, string, string, string | null][] = [
  [1, 'review.approve', 'submission', 'sub_9', 'হোটেল নাজ গার্ডেন', null],
  [1, 'review.reject', 'submission', 'sub_10', 'ডা. অজানা', 'ভুল বা যাচাই করা যায়নি'],
  [3, 'report.resolve', 'report', 'rep_6', posts[9].title, 'ভুয়া বা প্রতারণা'],
  [3, 'post.remove', 'post', posts[9].id, posts[9].title, 'ভুয়া বা প্রতারণা'],
  [2, 'report.dismiss', 'report', 'rep_5', posts[15].title, 'তথ্য সঠিক পাওয়া গেছে'],
  [1, 'post.feature', 'post', posts[16].id, posts[16].title, null],
  [2, 'content.update', 'content', 'doc_3', db.doctors[2].name, null],
  [3, 'content.create', 'content', 'police_2', 'ওসি (তদন্ত)', null],
  [2, 'user.ban', 'user', 'usr_7', users[6].name, users[6].ban.reason],
  [1, 'push.send', 'announcement', 'psh_1', 'জরুরি: O- রক্ত প্রয়োজন', null],
  [3, 'content.update', 'content', 'area', 'উপজেলা পরিচিতি', null],
  [4, 'staff.invite', 'staff', 'stf_5', 'newstaff@example.com', null],
];
SEED_LOG.forEach(([s, action, type, id, label, reason], i) => log(staff[s - 1], action, type, id, label, reason, action === 'content.update' ? { phone: ['01700000402', '01700000412'] } : null, ago(Math.floor(i / 2), i * 3)));
audit.sort((a, b) => b.at.localeCompare(a.at));

/** Shallow diff of the fields a write touched, for the audit entry. */
const diff = (before: Row, after: Row) => {
  const out: Row = {};
  Object.keys(after).forEach((k) => {
    if (k === 'updatedAt' || k === 'updatedBy') return;
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) out[k] = [before[k], after[k]];
  });
  return Object.keys(out).length ? out : null;
};

/* =====================================================================
 * Generic CRUD collection
 * ===================================================================== */
function crud(
  base: string,
  rows: Row[],
  opts: {
    prefix: string;
    permission: Permission;
    label: (r: Row) => string;
    search: (r: Row) => unknown[];
    filters?: Record<string, (r: Row, v: string) => boolean>;
    defaults?: (body: Row) => Row;
  },
): Route[] {
  const live = (r: Row) => !r.deletedAt;
  const find = (id: string) => rows.find((r) => r.id === id && live(r));
  return [
    ['GET', base, ({ query }) => {
      const f = opts.filters ?? {};
      return paginate(rows.filter((r) => live(r) && matches(query.get('search'), ...opts.search(r)) && Object.entries(f).every(([k, fn]) => !query.get(k) || fn(r, query.get(k)!))), query);
    }, opts.permission],
    ['GET', `${base}/:id`, ({ params }) => (find(params.id) ? ok(find(params.id)) : notFound()), opts.permission],
    ['POST', base, ({ body, user }) => {
      const row = { ...(opts.defaults?.(body) ?? {}), ...body, id: nextId(opts.prefix), updatedAt: now(), createdAt: now() };
      rows.unshift(row);
      log(user!, 'content.create', 'content', row.id, opts.label(row));
      return created(row);
    }, opts.permission],
    ['PATCH', `${base}/:id`, ({ params, body, user }) => {
      const row = find(params.id);
      if (!row) return notFound();
      const before = { ...row };
      Object.assign(row, body, { updatedAt: now() });
      log(user!, 'content.update', 'content', row.id, opts.label(row), null, diff(before, body));
      return ok(row);
    }, opts.permission],
    ['DELETE', `${base}/:id`, ({ params, body, user }) => {
      const row = find(params.id);
      if (!row) return notFound();
      row.deletedAt = now();
      log(user!, 'content.delete', 'content', row.id, opts.label(row), body.reason ?? null);
      return ok({ ok: true });
    }, opts.permission],
    ['POST', `${base}/:id/restore`, ({ params, user }) => {
      const row = rows.find((r) => r.id === params.id);
      if (!row) return notFound();
      delete row.deletedAt;
      log(user!, 'content.restore', 'content', row.id, opts.label(row));
      return ok(row);
    }, opts.permission],
  ];
}

/* =====================================================================
 * Views (joins the API does server-side)
 * ===================================================================== */
const userView = (u: Row): Row => {
  const mine = posts.filter((p) => p.ownerId === u.id);
  return { ...u, posts: mine.length, activePosts: mine.filter((p) => p.status === 'active').length, removedPosts: mine.filter((p) => p.status === 'removed').length, reportsAgainst: mine.reduce((a, p) => a + p.reports, 0) };
};
const postView = (p: Row): Row => {
  const o = users.find((u) => u.id === p.ownerId)!;
  return { ...p, owner: { id: o.id, name: o.name, banned: o.status === 'banned' } };
};
const reportView = (r: Row): Row => {
  const p = posts.find((x) => x.id === r.postId)!;
  const o = users.find((u) => u.id === p.ownerId)!;
  return { ...r, post: { id: p.id, kind: p.kind, title: p.title, body: p.body, phone: p.phone, status: p.status }, owner: { id: o.id, name: o.name, banned: o.status === 'banned', priorRemovals: posts.filter((x) => x.ownerId === o.id && x.status === 'removed').length } };
};
const pendingCount = () => submissions.filter((s) => s.status === 'pending').length;
const openReports = () => reports.filter((r) => r.status === 'open').length;

/* =====================================================================
 * Routes
 * ===================================================================== */
const routes: Route[] = [
  /* ---- auth ---- */
  ['POST', '/auth/demo/sign-in', ({ body }) => {
    const s = staff[0];
    const user: StaffUser = { id: s.id, name: s.name, email: s.email, avatar: null, provider: body.provider ?? 'google', role: 'admin' };
    writeSession(user);
    return ok(session(user));
  }],
  ['POST', '/auth/demo/role', ({ body, user }) => {
    if (!user) return fail(401, 'UNAUTHENTICATED', 'সাইন ইন করুন');
    const next = { ...user, role: body.role as StaffRole };
    staff[0].role = next.role;
    writeSession(next);
    return ok(session(next));
  }],
  ['POST', '/auth/refresh', () => {
    const user = readSession();
    return user ? ok(session(user)) : fail(401, 'NO_SESSION', 'সাইন ইন করা নেই');
  }],
  ['POST', '/auth/logout', () => {
    writeSession(null);
    return ok({ ok: true });
  }],

  /* ---- shell ---- */
  ['GET', '/admin/counts', () => ok({ review: pendingCount(), reports: openReports() }), 'dashboard.view'],
  ['GET', '/admin/dashboard', () => {
    const active = posts.filter((p) => p.status === 'active');
    const today = new Date().toDateString();
    const kinds: [string, string][] = [['job', 'চাকরি'], ['listing', 'কেনাবেচা'], ['rental', 'বাসা ভাড়া'], ['vehicle', 'গাড়ি ভাড়া'], ['tuition', 'টিউশন'], ['matrimony', 'পাত্র-পাত্রী']];
    const ready = donors.filter((d) => d.lastDonation && (Date.now() - new Date(d.lastDonation).getTime()) / DAY >= 120).length;
    return ok({
      kpis: {
        review: pendingCount(),
        reports: openReports(),
        postsToday: posts.filter((p) => new Date(p.createdAt).toDateString() === today).length,
        activePosts: active.length,
        newUsers7d: users.filter((u) => Date.now() - new Date(u.joinedAt).getTime() < 7 * DAY).length,
        bannedUsers: users.filter((u) => u.status === 'banned').length,
        donorsReady: ready,
        donorsTotal: donors.length,
      },
      activity: Array.from({ length: 30 }, (_, i) => {
        const d = new Date(Date.now() - (29 - i) * DAY);
        const real = posts.filter((p) => new Date(p.createdAt).toDateString() === d.toDateString()).length;
        return { date: d.toISOString(), posts: real + ((i * 7 + 3) % 5) + (d.getDay() === 5 ? 1 : 3) };
      }),
      postsByKind: kinds.map(([kind, label]) => ({ kind, label, count: active.filter((p) => p.kind === kind).length })),
      attention: [
        ...submissions.filter((s) => s.status === 'pending').sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)).slice(0, 3).map((s) => ({ id: s.id, type: 'review', title: s.title, sub: `যাচাইয়ের অপেক্ষায় · ${s.summary}`, href: `/review?id=${s.id}`, at: s.submittedAt })),
        ...reports.filter((r) => r.status === 'open').sort((a, b) => b.count - a.count).slice(0, 3).map((r) => {
          const p = posts.find((x) => x.id === r.postId)!;
          return { id: r.id, type: r.autoHidden ? 'hidden' : 'report', title: p.title, sub: r.autoHidden ? 'রিপোর্টে স্বয়ংক্রিয়ভাবে লুকানো' : `${r.count}টি রিপোর্ট`.replace(/\d/g, (x) => '০১২৩৪৫৬৭৮৯'[Number(x)]), href: `/reports?open=${r.id}`, at: r.lastAt };
        }),
      ],
      recent: audit.slice(0, 8),
    });
  }, 'dashboard.view'],
  ['GET', '/admin/search', ({ query, user }) => {
    const q = query.get('q') ?? '';
    const role = user!.role;
    const hits: Row[] = [];
    if (can(role, 'posts.manage')) posts.filter((p) => matches(q, p.title, p.phone)).slice(0, 5).forEach((p) => hits.push({ kind: 'post', id: p.id, label: p.title, sub: 'পোস্ট', href: `/posts?open=${p.id}` }));
    if (can(role, 'users.manage')) users.filter((u) => matches(q, u.name, u.email)).slice(0, 5).forEach((u) => hits.push({ kind: 'user', id: u.id, label: u.name, sub: 'ব্যবহারকারী', href: `/users?open=${u.id}` }));
    if (can(role, 'content.manage')) {
      doctors.filter((d) => !d.deletedAt && matches(q, d.name, d.specialty, d.phone)).slice(0, 5).forEach((d) => hits.push({ kind: 'doctor', id: d.id, label: d.name, sub: d.specialty, href: `/doctors?edit=${d.id}` }));
      directory.filter((e) => !e.deletedAt && matches(q, e.name, e.role, e.phone)).slice(0, 5).forEach((e) => hits.push({ kind: 'directory', id: e.id, label: e.name, sub: e.role || 'তালিকা', href: `/directory?edit=${e.id}` }));
      institutions.filter((i) => !i.deletedAt && matches(q, i.name, i.eiin)).slice(0, 3).forEach((i) => hits.push({ kind: 'institution', id: i.id, label: i.name, sub: 'শিক্ষা প্রতিষ্ঠান', href: `/institutions?edit=${i.id}` }));
      donors.filter((d) => !d.deletedAt && matches(q, d.name, d.phone)).slice(0, 3).forEach((d) => hits.push({ kind: 'donor', id: d.id, label: d.name, sub: `রক্তদাতা · ${d.group}`, href: `/donors?edit=${d.id}` }));
    }
    return ok(hits);
  }, 'dashboard.view'],

  /* ---- review queue ---- */
  ['GET', '/admin/submissions', ({ query }) => paginate(submissions.filter((s) => (!query.get('status') || s.status === query.get('status')) && (!query.get('kind') || s.kind === query.get('kind')) && matches(query.get('search'), s.title, s.summary)), query), 'review.manage'],
  ['GET', '/admin/submissions/:id', ({ params }) => { const s = submissions.find((x) => x.id === params.id); return s ? ok(s) : notFound(); }, 'review.manage'],
  ['POST', '/admin/submissions/:id/approve', ({ params, body, user }) => {
    const s = submissions.find((x) => x.id === params.id);
    if (!s) return notFound();
    if (s.status !== 'pending') return fail(409, 'ALREADY_DECIDED', 'এটি আগেই সিদ্ধান্ত হয়ে গেছে');
    const data = { ...s.data, ...(body.data ?? {}) };
    const before = s.data;
    Object.assign(s, { status: 'approved', data, decidedAt: now(), decidedBy: user!.name });
    // Publish into the right collection, as the API would.
    if (s.kind === 'doctor') doctors.unshift({ id: nextId('doc'), photo: null, about: '', degrees: [], chambers: [], ...data, verified: true, hidden: false, updatedAt: now() });
    if (s.kind === 'directory') directory.unshift({ id: nextId('dir'), type: s.directoryType, role: '', phone: '', whatsapp: false, address: '', hours: '', description: '', mapUrl: '', photo: null, rating: null, ratingCount: 0, ...data, verified: true, hidden: false, updatedAt: now() });
    if (s.kind === 'institution') institutions.unshift({ id: nextId('ins'), founder: '', website: '', photo: null, lat: null, lng: null, claimedBy: null, ...data, hidden: false, updatedAt: now() });
    if (s.kind === 'claim') {
      const inst = institutions.find((i) => i.name === data.institution);
      if (inst) inst.claimedBy = data.name;
    }
    log(user!, 'review.approve', 'submission', s.id, s.title, null, body.data ? diff(before, data) : null);
    return ok(s);
  }, 'review.manage'],
  ['POST', '/admin/submissions/:id/reject', ({ params, body, user }) => {
    const s = submissions.find((x) => x.id === params.id);
    if (!s) return notFound();
    if (s.status !== 'pending') return fail(409, 'ALREADY_DECIDED', 'এটি আগেই সিদ্ধান্ত হয়ে গেছে');
    if (!body.reason) return fail(422, 'VALIDATION', 'কারণ লিখুন', [{ path: 'reason', message: 'কারণ লিখুন' }]);
    Object.assign(s, { status: 'rejected', decidedAt: now(), decidedBy: user!.name, reason: body.reason });
    log(user!, 'review.reject', 'submission', s.id, s.title, body.reason);
    return ok(s);
  }, 'review.manage'],

  /* ---- reports ---- */
  ['GET', '/admin/reports', ({ query }) => paginate(reports.map(reportView).filter((r) => (!query.get('status') || r.status === query.get('status')) && (!query.get('kind') || r.post.kind === query.get('kind')) && matches(query.get('search'), r.post.title, r.owner.name)), query), 'reports.manage'],
  ['GET', '/admin/reports/:id', ({ params }) => { const r = reports.find((x) => x.id === params.id); return r ? ok(reportView(r)) : notFound(); }, 'reports.manage'],
  ['POST', '/admin/reports/:id/dismiss', ({ params, body, user }) => {
    const r = reports.find((x) => x.id === params.id);
    if (!r) return notFound();
    const p = posts.find((x) => x.id === r.postId)!;
    if (p.status === 'hidden') p.status = 'active';
    Object.assign(r, { status: 'dismissed', decidedBy: user!.name, decisionReason: body.reason ?? 'পোস্ট নিয়ম মেনে চলছে' });
    log(user!, 'report.dismiss', 'report', r.id, p.title, body.reason ?? null);
    return ok(reportView(r));
  }, 'reports.manage'],
  ['POST', '/admin/reports/:id/resolve', ({ params, body, user }) => {
    const r = reports.find((x) => x.id === params.id);
    if (!r) return notFound();
    const p = posts.find((x) => x.id === r.postId)!;
    Object.assign(p, { status: 'removed', removedReason: body.reason });
    Object.assign(r, { status: 'resolved', decidedBy: user!.name, decisionReason: body.reason });
    log(user!, 'report.resolve', 'report', r.id, p.title, body.reason);
    log(user!, 'post.remove', 'post', p.id, p.title, body.reason);
    if (body.ban) {
      const u = users.find((x) => x.id === p.ownerId)!;
      Object.assign(u, { status: 'banned', ban: { reason: body.reason, at: now(), by: user!.name } });
      posts.filter((x) => x.ownerId === u.id && x.status === 'active').forEach((x) => Object.assign(x, { status: 'removed', removedReason: 'পোস্টদাতা নিষিদ্ধ' }));
      log(user!, 'user.ban', 'user', u.id, u.name, body.reason);
    }
    return ok(reportView(r));
  }, 'reports.manage'],

  /* ---- posts ---- */
  ['GET', '/admin/posts', ({ query }) => paginate(posts.map(postView).filter((p) => (!query.get('kind') || p.kind === query.get('kind')) && (!query.get('status') || p.status === query.get('status')) && (!query.get('featured') || p.featured) && (!query.get('owner') || p.ownerId === query.get('owner')) && matches(query.get('search'), p.title, p.phone, p.owner.name)), query), 'posts.manage'],
  ['GET', '/admin/posts/:id', ({ params }) => { const p = posts.find((x) => x.id === params.id); return p ? ok(postView(p)) : notFound(); }, 'posts.manage'],
  ...(
    [
      ['feature', (p: Row, b: Row) => { p.featured = !!b.value; return b.value ? 'post.feature' : 'post.unfeature'; }],
      ['verify', (p: Row, b: Row) => { p.verified = !!b.value; return b.value ? 'post.verify' : 'post.unverify'; }],
      ['extend', (p: Row, b: Row) => { const from = Math.max(Date.now(), new Date(p.expiresAt ?? Date.now()).getTime()); p.expiresAt = new Date(from + Number(b.days) * DAY).toISOString(); if (p.status === 'expired') p.status = 'active'; return 'post.extend'; }],
      ['remove', (p: Row, b: Row) => { if (!b.reason) throw new Error('reason'); Object.assign(p, { status: 'removed', removedReason: b.reason }); return 'post.remove'; }],
      ['restore', (p: Row) => { Object.assign(p, { status: new Date(p.expiresAt) < new Date() ? 'expired' : 'active', removedReason: null }); return 'post.restore'; }],
    ] as [string, (p: Row, b: Row) => string][]
  ).map(([name, fn]): Route => ['POST', `/admin/posts/:id/${name}`, ({ params, body, user }) => {
    const p = posts.find((x) => x.id === params.id);
    if (!p) return notFound();
    try {
      const action = fn(p, body);
      log(user!, action, 'post', p.id, p.title, body.reason ?? null);
    } catch {
      return fail(422, 'VALIDATION', 'কারণ লিখুন', [{ path: 'reason', message: 'কারণ লিখুন' }]);
    }
    return ok(postView(p));
  }, 'posts.manage']),

  /* ---- users ---- */
  ['GET', '/admin/users', ({ query }) => paginate(users.map(userView).filter((u) => (!query.get('status') || u.status === query.get('status')) && (!query.get('provider') || u.provider === query.get('provider')) && matches(query.get('search'), u.name, u.email)), query), 'users.manage'],
  ['GET', '/admin/users/:id', ({ params }) => { const u = users.find((x) => x.id === params.id); return u ? ok(userView(u)) : notFound(); }, 'users.manage'],
  ['POST', '/admin/users/:id/ban', ({ params, body, user }) => {
    const u = users.find((x) => x.id === params.id);
    if (!u) return notFound();
    if (!body.reason) return fail(422, 'VALIDATION', 'কারণ লিখুন');
    Object.assign(u, { status: 'banned', ban: { reason: body.reason, at: now(), by: user!.name } });
    posts.filter((p) => p.ownerId === u.id && p.status === 'active').forEach((p) => Object.assign(p, { status: 'removed', removedReason: 'পোস্টদাতা নিষিদ্ধ' }));
    log(user!, 'user.ban', 'user', u.id, u.name, body.reason);
    return ok(userView(u));
  }, 'users.manage'],
  ['POST', '/admin/users/:id/unban', ({ params, user }) => {
    const u = users.find((x) => x.id === params.id);
    if (!u) return notFound();
    Object.assign(u, { status: 'active', ban: null });
    log(user!, 'user.unban', 'user', u.id, u.name);
    return ok(userView(u));
  }, 'users.manage'],

  /* ---- content ---- */
  ...crud('/admin/directory', directory, { prefix: 'dir', permission: 'content.manage', label: (r) => r.name, search: (r) => [r.name, r.role, r.address, r.phone], filters: { type: (r, v) => r.type === v, verified: (r, v) => String(!!r.verified) === v, hidden: (r, v) => String(!!r.hidden) === v }, defaults: () => ({ rating: null, ratingCount: 0 }) }),
  ...crud('/admin/doctors', doctors, { prefix: 'doc', permission: 'content.manage', label: (r) => r.name, search: (r) => [r.name, r.specialty, r.phone, ...r.chambers.map((c: Row) => c.hospital)], filters: { specialty: (r, v) => r.specialty === v } }),
  ...crud('/admin/donors', donors, {
    prefix: 'don', permission: 'content.manage', label: (r) => r.name, search: (r) => [r.name, r.phone, r.address],
    filters: { group: (r, v) => r.group === v, status: (r, v) => (v === 'unknown' ? !r.lastDonation : !!r.lastDonation && ((Date.now() - new Date(r.lastDonation).getTime()) / DAY >= 120) === (v === 'ready')) },
  }),
  ...crud('/admin/workers', workers, { prefix: 'wrk', permission: 'content.manage', label: (r) => r.name, search: (r) => [r.name, r.phone, r.address], filters: { trade: (r, v) => r.trades.includes(v) } }),
  ...crud('/admin/institutions', institutions, { prefix: 'ins', permission: 'content.manage', label: (r) => r.name, search: (r) => [r.name, r.eiin, r.address], filters: { type: (r, v) => r.type === v, union: (r, v) => r.union === v } }),
  ...crud('/admin/notices', notices, { prefix: 'ntc', permission: 'content.manage', label: (r) => r.title, search: (r) => [r.title, r.institutionName], filters: { institution: (r, v) => r.institutionId === v }, defaults: (b) => ({ institutionName: institutions.find((i) => i.id === b.institutionId)?.name ?? '' }) }),
  ...crud('/admin/area/unions', unions, { prefix: 'uni', permission: 'content.manage', label: (r) => r.name, search: (r) => [r.name, ...r.villages, ...r.contacts.map((c: Row) => c.name)] }),
  ...crud('/admin/freedom-fighters', freedomFighters, { prefix: 'ff', permission: 'content.manage', label: (r) => r.name, search: (r) => [r.name, r.fatherName, r.idNo, r.village], filters: { union: (r, v) => r.union === v } }),
  ...crud('/admin/notable-persons', notablePersons, { prefix: 'np', permission: 'content.manage', label: (r) => r.name, search: (r) => [r.name, r.title], filters: { field: (r, v) => r.field === v } }),
  ...crud('/admin/achievers', achievers, { prefix: 'ach', permission: 'content.manage', label: (r) => r.name, search: (r) => [r.name, r.post, r.workplace], filters: { cadre: (r, v) => r.cadre === v } }),
  ...crud('/admin/videos', videos, { prefix: 'vid', permission: 'content.manage', label: (r) => r.title, search: (r) => [r.title], filters: { category: (r, v) => r.category === v }, defaults: () => ({ publishedAt: now() }) }),
  ...crud('/admin/slides', slides, { prefix: 'sld', permission: 'announcements.manage', label: (r) => r.title, search: (r) => [r.title, r.eyebrow] }),

  /* ---- documents ---- */
  ...Object.keys(docs).flatMap((path): Route[] => {
    const permission: Permission = path === '/admin/settings' ? 'settings.manage' : path === '/admin/site-notice' ? 'announcements.manage' : 'content.manage';
    const label: Record<string, string> = { '/admin/area/profile': 'উপজেলা পরিচিতি', '/admin/area/administration': 'প্রশাসন', '/admin/area/municipality': 'পৌরসভা', '/admin/site-notice': 'সাইট নোটিশ', '/admin/settings': 'সেটিংস' };
    return [
      ['GET', path, () => ok(docs[path]), permission],
      ['PUT', path, ({ body, user }) => {
        const before = docs[path];
        docs[path] = { ...before, ...body, updatedAt: now(), updatedBy: user!.name };
        if (path === '/admin/area/profile') docs[path].sections = docs[path].sections.map((s: Row, i: number) => ({ ...s, id: s.id || `sec_${i + 1}` }));
        log(user!, path === '/admin/settings' ? 'settings.update' : path === '/admin/site-notice' ? 'announcement.publish' : 'content.update', path === '/admin/settings' ? 'settings' : path === '/admin/site-notice' ? 'announcement' : 'content', path, label[path], null, diff(before, body));
        return ok(docs[path]);
      }, permission],
    ];
  }),

  /* ---- push ---- */
  ['GET', '/admin/push', ({ query }) => paginate(pushes, query), 'announcements.manage'],
  ['POST', '/admin/push', ({ body, user }) => {
    const recipients = body.audience === 'donors' ? donors.filter((d) => !body.bloodGroup || d.group === body.bloodGroup).length * 3 : 1300;
    const row: Row = { ...body, id: nextId('psh'), sentAt: now(), sentBy: user!.name, recipients, status: 'sent' };
    pushes.unshift(row);
    log(user!, 'push.send', 'announcement', row.id, row.title);
    return created(row, 'নোটিফিকেশন পাঠানো হয়েছে');
  }, 'announcements.manage'],

  /* ---- voters ---- */
  ['GET', '/admin/voters/stats', () => {
    const byUnion = [...new Set(voters.map((v) => v.union))].map((union) => {
      const rows = voters.filter((v) => v.union === union);
      return { union, total: rows.length, male: rows.filter((v) => v.gender === 'male').length, female: rows.filter((v) => v.gender === 'female').length, third: rows.filter((v) => v.gender === 'third').length };
    });
    return ok({ total: voters.length, byUnion, lastImport: voterImports[0] ?? null });
  }, 'voters.manage'],
  ['GET', '/admin/voters/imports', () => ok(voterImports), 'voters.manage'],
  ['GET', '/admin/voters', ({ query, user }) => {
    const q = query.get('search') ?? '';
    if (q.trim().length < 3) return fail(422, 'FILTER_REQUIRED', 'অন্তত ৩ অক্ষর লিখুন');
    log(user!, 'voters.search', 'voters', 'search', `“${q}”`);
    const u = query.get('union');
    return paginate(voters.filter((v) => (!u || v.union === u) && matches(q, v.name, v.voterNo, v.fatherName)), query);
  }, 'voters.manage'],
  ['POST', '/admin/voters/import', async ({ body, user }) => {
    const file = body.file as File | undefined;
    if (!file) return fail(422, 'VALIDATION', 'CSV ফাইল দিন');
    const lines = (await file.text()).split(/\r?\n/).filter((l) => l.trim());
    const head = (lines.shift() ?? '').split(',').map((h) => h.trim());
    const need = ['voterNo', 'name', 'fatherName', 'motherName', 'dob', 'gender', 'union', 'village', 'centre'];
    const missing = need.filter((c) => !head.includes(c));
    if (missing.length) return fail(422, 'BAD_CSV', `এই কলামগুলো নেই: ${missing.join(', ')}`);
    let imported = 0;
    let updated = 0;
    const errors: Row[] = [];
    lines.forEach((line, i) => {
      const cells = line.split(',');
      const row = Object.fromEntries(head.map((h, k) => [h, (cells[k] ?? '').trim()]));
      if (!row.voterNo) return errors.push({ row: i + 2, message: 'ভোটার নম্বর ফাঁকা' });
      if (Number.isNaN(Date.parse(row.dob))) return errors.push({ row: i + 2, message: 'জন্ম তারিখ বোঝা যায়নি' });
      const existing = voters.find((v) => v.voterNo === row.voterNo);
      if (existing) {
        Object.assign(existing, row);
        updated++;
      } else {
        voters.push({ ...row, id: nextId('vtr') });
        imported++;
      }
    });
    const report = { id: nextId('imp'), at: now(), by: user!.name, file: file.name, imported, updated, skipped: errors.length, errors: errors.slice(0, 20) };
    voterImports.unshift(report);
    log(user!, 'voters.import', 'voters', report.id, file.name);
    return created(report);
  }, 'voters.manage'],

  /* ---- staff ---- */
  ['GET', '/admin/staff', ({ query }) => paginate(staff.filter((s) => !s.deletedAt), query), 'staff.manage'],
  ['POST', '/admin/staff', ({ body, user }) => {
    if (staff.some((s) => !s.deletedAt && s.email === body.email)) return fail(409, 'STAFF_EXISTS', 'এই ইমেইল আগেই স্টাফ তালিকায় আছে', [{ path: 'email', message: 'এই ইমেইল আগেই স্টাফ তালিকায় আছে' }]);
    const row = { id: nextId('stf'), name: '', email: body.email, avatar: null, provider: null, role: body.role, status: 'invited', invitedBy: user!.name, invitedAt: now(), lastActiveAt: null };
    staff.push(row);
    log(user!, 'staff.invite', 'staff', row.id, row.email);
    return created(row);
  }, 'staff.manage'],
  ['POST', '/admin/staff/:id/role', ({ params, body, user }) => {
    const s = staff.find((x) => x.id === params.id && !x.deletedAt);
    if (!s) return notFound();
    if (s.id === user!.id) return fail(409, 'SELF', 'নিজের ভূমিকা নিজে বদলানো যায় না');
    if (s.role === 'admin' && body.role !== 'admin' && staff.filter((x) => !x.deletedAt && x.role === 'admin' && x.status === 'active').length <= 1) return fail(409, 'LAST_ADMIN', 'অন্তত একজন প্রশাসক থাকতে হবে');
    const before = s.role;
    s.role = body.role;
    log(user!, 'staff.role', 'staff', s.id, s.name || s.email, null, { role: [before, body.role] });
    return ok(s);
  }, 'staff.manage'],
  ['POST', '/admin/staff/:id/resend', ({ params, user }) => {
    const s = staff.find((x) => x.id === params.id && !x.deletedAt);
    if (!s) return notFound();
    s.invitedAt = now();
    log(user!, 'staff.invite', 'staff', s.id, s.email);
    return ok(s);
  }, 'staff.manage'],
  ['DELETE', '/admin/staff/:id', ({ params, user }) => {
    const s = staff.find((x) => x.id === params.id && !x.deletedAt);
    if (!s) return notFound();
    if (s.id === user!.id) return fail(409, 'SELF', 'নিজেকে সরানো যায় না');
    s.deletedAt = now();
    log(user!, 'staff.remove', 'staff', s.id, s.name || s.email);
    return ok({ ok: true });
  }, 'staff.manage'],
  ['POST', '/admin/staff/:id/restore', ({ params }) => {
    const s = staff.find((x) => x.id === params.id);
    if (!s) return notFound();
    delete s.deletedAt;
    return ok(s);
  }, 'staff.manage'],

  /* ---- audit ---- */
  ['GET', '/admin/audit', ({ query }) => {
    const from = query.get('from');
    const to = query.get('to');
    return paginate(
      audit.filter(
        (e) =>
          (!query.get('actor') || e.actor.id === query.get('actor')) &&
          (!query.get('action') || e.action === query.get('action')) &&
          (!query.get('type') || e.resource.type === query.get('type')) &&
          (!from || e.at >= from) &&
          (!to || e.at <= `${to}T23:59:59`) &&
          matches(query.get('search'), e.actor.name, e.resource.label, e.reason),
      ),
      query,
    );
  }, 'audit.view'],

  /* ---- uploads: object URLs stand in for stored files ---- */
  ['POST', '/uploads', ({ body }) => created({ urls: ((body.files as File[]) ?? []).map((f) => URL.createObjectURL(f)) })],
];

/** Compile "/a/:id/b" patterns once; literal routes win over `:param` ones. */
const compiled = routes
  .map(([method, pattern, handler, permission]) => {
    const keys: string[] = [];
    const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)'))}$`);
    return { method, re, keys, handler, permission, dynamic: keys.length };
  })
  .sort((a, b) => a.dynamic - b.dynamic);

export async function demoFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  const method = (init?.method ?? 'GET').toUpperCase();
  const path = url.pathname.replace(/^.*\/api\/v1/, '') || '/';

  await sleep(LATENCY);
  if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const auth = new Headers(init?.headers).get('Authorization') ?? '';
  const sessionUser = readSession();
  const user = auth.startsWith('Bearer demo.') && sessionUser && auth.slice('Bearer demo.'.length) === sessionUser.id ? sessionUser : null;

  for (const r of compiled) {
    if (r.method !== method) continue;
    const m = r.re.exec(path);
    if (!m) continue;
    if (r.permission) {
      if (!user) return fail(401, 'UNAUTHENTICATED', 'আবার সাইন ইন করুন');
      if (!can(user.role, r.permission)) return fail(403, 'FORBIDDEN', 'এই কাজের অনুমতি আপনার নেই');
    }
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    let body: Row = {};
    if (typeof init?.body === 'string') body = JSON.parse(init.body) as Row;
    else if (init?.body instanceof FormData) {
      body = { files: init.body.getAll('files') };
      const file = init.body.get('file');
      if (file) body.file = file;
    }
    return r.handler({ method, params, query: url.searchParams, body, user });
  }
  return fail(404, 'ROUTE_NOT_FOUND', `ডেমো সার্ভারে ${method} ${path} নেই`);
}
