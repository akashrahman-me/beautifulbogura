/**
 * Fill a database with the demo sample data (all fictional), so the site and console have something to show.
 *   npm run seed              # refuses if data exists
 *   npm run seed -- --reset   # drops the database first (never in production)
 * Staff accounts for the development sign-in: admin@example.com, moderator@example.com, editor@example.com.
 */
import mongoose, { Types } from 'mongoose';
import { connectDB, disconnectDB } from '@/config/db';
import { isProd } from '@/config/env';
import { SlideModel } from '@/modules/announcement/slide.model';
import { UnionModel } from '@/modules/area/union.model';
import { AchieverModel } from '@/modules/achiever/achiever.model';
import { DirectoryModel } from '@/modules/directory/directory.model';
import { DoctorModel } from '@/modules/doctor/doctor.model';
import { DonorModel } from '@/modules/donor/donor.model';
import { FreedomFighterModel } from '@/modules/freedom-fighter/freedomFighter.model';
import { InstitutionModel, type Institution } from '@/modules/institution/institution.model';
import { NotableModel } from '@/modules/notable/notable.model';
import { NoticeModel } from '@/modules/notice/notice.model';
import { KIND_MODELS } from '@/modules/post/post.model';
import { ReportCaseModel } from '@/modules/report/report.model';
import * as siteService from '@/modules/site/site.service';
import { DEFAULTS } from '@/modules/site/site.defaults';
import { SubmissionModel } from '@/modules/submission/submission.model';
import { UserModel } from '@/modules/user/user.model';
import { VideoModel } from '@/modules/video/video.model';
import { VoterModel } from '@/modules/voter/voter.model';
import { WorkerModel } from '@/modules/worker/worker.model';
import * as db from './seed-data';

const DAY = 864e5;
const ago = (d: number, h = 0) => new Date(Date.now() - d * DAY - h * 36e5);
const ahead = (d: number) => new Date(Date.now() + d * DAY);

const main = async () => {
  await connectDB();
  if (process.argv.includes('--reset')) {
    if (isProd) throw new Error('Refusing to reset a production database');
    await mongoose.connection.dropDatabase();
    await mongoose.connection.syncIndexes();
    console.log('Database dropped');
  } else if (await UserModel.exists({})) {
    console.log('Data already present — run with --reset to start over.');
    return;
  }

  /* ---------- people ---------- */
  const staffDefs = [
    { name: 'ডেমো প্রশাসক', email: 'admin@example.com', role: 'admin' },
    { name: 'নাসরিন সুলতানা', email: 'moderator@example.com', role: 'moderator' },
    { name: 'মাহমুদুল হাসান', email: 'editor@example.com', role: 'editor' },
  ] as const;
  await UserModel.insertMany(staffDefs.map((s) => ({ ...s, emailVerified: true, identities: [{ provider: 'dev', providerId: s.email }], staffSince: ago(200), invitedBy: 'seed' })));

  const NAMES = ['রাকিব হাসান', 'মো. সোহেল রানা', 'তানভীর আহমেদ', 'শাহীন আলম', 'নাসির উদ্দিন', 'রুমানা আক্তার', 'আবুল কালাম', 'ফয়সাল আহমেদ', 'মো. হাবিবুর রহমান', 'রেহানা বেগম', 'আজিজুল হক', 'সাইফুল ইসলাম', 'মোস্তফা কামাল', 'জাহানারা খাতুন', 'আলমগীর হোসেন', 'রাশেদুল ইসলাম', 'জুয়েল রানা', 'মো. বেলাল', 'সাদিয়া ইসলাম', 'মিসেস রহমান'];
  const users = await UserModel.insertMany(
    NAMES.map((name, i) => ({
      name,
      email: `user${i + 1}@example.com`,
      emailVerified: true,
      identities: [{ provider: 'dev', providerId: `user${i + 1}@example.com` }],
      provider: (['google', 'facebook', 'apple'] as const)[i % 3],
      status: i === 6 ? 'banned' : 'active',
      ban: i === 6 ? { reason: 'ভুয়া বা প্রতারণামূলক পোস্ট', at: ago(4), by: 'নাসরিন সুলতানা' } : null,
      lastSeenAt: ago(i % 9, i),
      createdAt: ago(5 + i * 7),
    })),
  );
  const owner = (i: number) => users[i % users.length]._id;

  /* ---------- community posts ---------- */
  const status = (s: string) => (s === 'active' ? 'active' : 'done');
  const posts = [
    ...db.jobs.map((j, i) => ({ kind: 'job' as const, doc: { company: j.company, title: j.title, vacancies: j.vacancies, salary: j.salary, education: j.education, details: j.details, deadline: new Date(j.deadline), phone: j.phone, whatsapp: j.whatsapp, address: j.address, images: [], owner: owner(i), status: status(j.status), createdAt: new Date(j.createdAt), expiresAt: ahead(15 - i) } })),
    ...db.listings.map((l, i) => ({ kind: 'listing' as const, doc: { category: l.category, title: l.title, condition: l.condition, price: l.price, description: l.description, sellerName: l.sellerName, phone: l.phone, whatsapp: l.whatsapp, address: l.address, images: [], owner: owner(i + 3), status: status(l.status), createdAt: new Date(l.createdAt), expiresAt: ahead(25) } })),
    ...db.rentals.map((r, i) => ({ kind: 'rental' as const, doc: { type: r.type, title: r.title, rent: r.rent, rooms: r.rooms, gas: r.gas, attachedBath: r.attachedBath, description: r.description, ownerName: r.ownerName, mapUrl: r.mapUrl, phone: r.phone, whatsapp: r.whatsapp, address: r.address, images: [], featured: r.featured, verified: r.verified, owner: owner(i + 5), status: status(r.status), createdAt: new Date(r.createdAt), expiresAt: ahead(28 - i) } })),
    ...db.vehicles.map((v, i) => ({ kind: 'vehicle' as const, doc: { type: v.type, ownerName: v.ownerName, description: v.description, phone: v.phone, whatsapp: v.whatsapp, featured: v.featured, verified: v.verified, owner: owner(i + 9), status: 'active', createdAt: new Date(v.createdAt), expiresAt: ahead(50) } })),
    ...db.tuitions.map((t, i) => ({ kind: 'tuition' as const, doc: { kind: t.kind, name: t.name, classLevel: t.classLevel, subject: t.subject, qualification: t.qualification, experience: t.experience, note: t.note, phone: t.phone, address: t.address, images: [], owner: owner(i + 12), status: 'active', createdAt: new Date(t.createdAt), expiresAt: ahead(27) } })),
    ...db.matrimony.map((m, i) => ({ kind: 'matrimony' as const, doc: { gender: m.gender, name: m.name, birthYear: m.birthYear, religion: m.religion, maritalStatus: m.maritalStatus, education: m.education, profession: m.profession, familyMembers: m.familyMembers, preference: m.preference, phone: m.phone, whatsapp: m.whatsapp, address: m.address, images: [], owner: owner(i + 14), status: 'active', createdAt: new Date(m.createdAt), expiresAt: ahead(80) } })),
  ];
  const created: { _id: Types.ObjectId; kind: string }[] = [];
  for (const p of posts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- one discriminator per kind
    const [d] = await (KIND_MODELS[p.kind] as any).create([p.doc], { timestamps: false });
    created.push({ _id: d._id, kind: p.kind });
  }
  // One expired, one removed, the banned user's posts removed.
  await KIND_MODELS.job.updateOne({ _id: created[2]._id }, { expiresAt: ago(2) });
  await KIND_MODELS.listing.updateOne({ _id: created[9]._id }, { status: 'removed', removedReason: 'ভুয়া বা প্রতারণা' });
  await mongoose.model('Post').updateMany({ owner: users[6]._id, status: 'active' }, { status: 'removed', removedReason: 'পোস্টদাতা নিষিদ্ধ' });

  /* ---------- report cases ---------- */
  const cases: [number, Record<string, number>, 'open' | 'dismissed' | 'resolved', boolean][] = [
    [11, { fake: 4, 'wrong-info': 1 }, 'open', true],
    [4, { sold: 2 }, 'open', false],
    [20, { fake: 2, other: 1 }, 'open', false],
    [15, { fake: 1 }, 'dismissed', false],
  ];
  for (const [i, reasons, st, hidden] of cases) {
    const count = Object.values(reasons).reduce((a, b) => a + b, 0);
    const post = created[i];
    await ReportCaseModel.create({ post: post._id, status: st, reasons, count, notes: Object.keys(reasons).map((r, k) => ({ at: ago(k, 3), reason: r, note: k === 0 ? 'অগ্রিম টাকা চাইছে' : null })), firstAt: ago(count), lastAt: ago(0, 2), autoHidden: hidden, decidedBy: st === 'open' ? null : 'নাসরিন সুলতানা', decisionReason: st === 'dismissed' ? 'তথ্য সঠিক পাওয়া গেছে' : null });
    await mongoose.model('Post').updateOne({ _id: post._id }, { $set: { reports: count, ...(hidden && { status: 'hidden' }) } });
  }

  /* ---------- directories & data ---------- */
  await DirectoryModel.insertMany(db.directory.map(({ id: _id, ...e }) => ({ ...e, hidden: false })));
  await DoctorModel.insertMany(db.doctors.map(({ id: _id, ...d }, i) => ({ ...d, verified: i % 3 !== 2 })));
  await DonorModel.insertMany(db.donors.map(({ id: _id, lastDonation, ...d }) => ({ ...d, lastDonation: lastDonation ? new Date(lastDonation) : null })));
  await WorkerModel.insertMany(db.workers.map(({ id: _id, createdAt, ...w }) => ({ ...w, createdAt: new Date(createdAt) })));
  const instIds = new Map<string, Types.ObjectId>();
  for (const [i, x] of db.institutions.entries()) {
    const { id, image, area: _a, claimed, ...rest } = x;
    const d = await InstitutionModel.create({ ...rest, photo: image, union: ['', 'পৌরসভা', 'নুনগোলা'][i % 3], claimedBy: claimed ? ['প্রফেসর আব্দুল হালিম', 'মো. জাকির হোসেন', 'শাহানা পারভীন'][i] : null } as Partial<Institution>);
    instIds.set(id, d._id);
  }
  await NoticeModel.insertMany(db.notices.map(({ id: _id, institutionId, createdAt, ...n }, i) => ({ ...n, institution: instIds.get(institutionId), pinned: i === 0, createdAt: new Date(createdAt) })));
  await UnionModel.insertMany(db.unions.map(({ id: _id, ...u }) => u));
  await FreedomFighterModel.insertMany(db.freedomFighters.map(({ id: _id, ...f }) => f));
  await NotableModel.insertMany(db.notablePersons.map(({ id: _id, ...p }, i) => ({ ...p, published: i !== 5 })));
  await AchieverModel.insertMany(db.achievers.map(({ id: _id, ...a }) => a));
  // Placeholder ids in the YouTube format; replace with real videos from the console.
  await VideoModel.insertMany(db.videos.map(({ id: _id, youtubeId: _y, publishedAt, ...v }, i) => ({ ...v, youtubeId: `demoVideo${String(i + 1).padStart(2, '0')}`, publishedAt: new Date(publishedAt), published: i !== 8 })));
  await VoterModel.insertMany(db.voters.map(({ id: _id, ...v }) => v));

  /* ---------- review queue ---------- */
  await SubmissionModel.insertMany([
    { kind: 'doctor', title: 'ডা. মাহফুজা খাতুন', summary: 'শিশু বিশেষজ্ঞ · ১টি চেম্বার', submitter: { name: 'মাহফুজা খাতুন', phone: '01700000901' }, data: { name: 'ডা. মাহফুজা খাতুন', specialty: 'শিশু', degrees: ['MBBS', 'DCH'], phone: '01700000901', chambers: [{ hospital: 'সেবা ক্লিনিক, সাতমাথা', days: [0, 2, 4], time: 'বিকেল ৪টা – রাত ৮টা', serial: '01700000902', fee: 600 }] }, submittedAt: ago(2) },
    { kind: 'directory', directoryType: 'restaurant', title: 'আকবরিয়া হোটেল', summary: 'রেস্টুরেন্ট · সাতমাথা', submitter: { name: 'মো. কাশেম', phone: '01700000911' }, data: { name: 'আকবরিয়া হোটেল', role: 'রেস্টুরেন্ট', phone: '01700000911', whatsapp: false, address: 'সাতমাথা, বগুড়া', description: 'বগুড়ার দই আর কাচ্চি বিরিয়ানির জন্য পরিচিত।' }, submittedAt: ago(1, 6) },
    { kind: 'institution', title: 'সুলতানগঞ্জ উচ্চ বিদ্যালয়', summary: 'নুনগোলা', submitter: { name: 'আব্দুর রশিদ', phone: '01700000921' }, data: { name: 'সুলতানগঞ্জ উচ্চ বিদ্যালয়', type: 'secondary', eiin: '119990', established: '১৯৬৮', union: 'নুনগোলা', phone: '01700000921', address: 'সুলতানগঞ্জ, নুনগোলা', about: 'এলাকার একমাত্র উচ্চ বিদ্যালয়।' }, submittedAt: ago(1) },
    { kind: 'claim', targetId: instIds.get('ins_2'), title: 'বগুড়া জিলা স্কুল — দাবি', summary: 'সহকারী প্রধান শিক্ষক', submitter: { name: 'মো. জাকির হোসেন', phone: '01700000931' }, data: { institution: 'বগুড়া জিলা স্কুল', name: 'মো. জাকির হোসেন', role: 'সহকারী প্রধান শিক্ষক', phone: '01700000931', email: 'zakir@example.com', proof: 'স্কুলের পরিচয়পত্রের ছবি পাঠাতে পারব' }, submittedAt: ago(0, 20) },
    { kind: 'directory', directoryType: 'ambulance', title: 'জীবন রক্ষা অ্যাম্বুলেন্স', summary: 'অ্যাম্বুলেন্স · ২৪ ঘণ্টা', submitter: { name: 'রাসেল আহমেদ', phone: '01700000941' }, data: { name: 'জীবন রক্ষা অ্যাম্বুলেন্স', role: 'এসি অ্যাম্বুলেন্স', phone: '01700000941', whatsapp: true, address: 'শেরপুর রোড, বগুড়া', description: '' }, submittedAt: ago(0, 9) },
    { kind: 'doctor', status: 'rejected', title: 'ডা. অজানা', summary: 'অন্যান্য', submitter: { name: 'অজানা', phone: '01700000941' }, data: { name: 'ডা. অজানা', specialty: 'অন্যান্য', phone: '01700000941', chambers: [] }, submittedAt: ago(10), decidedAt: ago(9), decidedBy: 'মাহমুদুল হাসান', reason: 'ভুল বা যাচাই করা যায়নি' },
  ]);

  /* ---------- documents & slides ---------- */
  await siteService.seedDoc('area.profile', db.areaProfile);
  await siteService.seedDoc('area.administration', db.administration);
  await siteService.seedDoc('area.municipality', db.municipality);
  await siteService.seedDoc('site.settings', { ...DEFAULTS['site.settings'], social: { facebook: 'https://facebook.com/', whatsapp: 'https://wa.me/8801700000001', telegram: 'https://t.me/', tiktok: 'https://tiktok.com/', youtube: 'https://youtube.com/' } });
  await siteService.seedDoc('site.notice', DEFAULTS['site.notice']);
  await SlideModel.insertMany([
    { order: 1, tone: 'brand', icon: 'grid', eyebrow: 'স্বাগতম', title: 'এক জায়গায় বগুড়ার সব সেবা', body: 'ডাক্তার, পুলিশ, স্কুল, ব্যাংক — সব তথ্য আর ফোন নম্বর হাতের কাছে।', cta: { label: 'সেবাগুলো দেখুন', href: '/services' } },
    { order: 2, tone: 'emergency', icon: 'drop', eyebrow: 'রক্ত ব্যাংক', title: 'রক্ত লাগবে? দাতা খুঁজুন', body: 'গ্রুপ বেছে নিন, প্রস্তুত দাতাকে সরাসরি কল করুন।', cta: { label: 'দাতার তালিকা', href: '/blood-bank' } },
    { order: 3, tone: 'accent', icon: 'briefcase', eyebrow: 'চাকরি ও কেনাবেচা', title: 'স্থানীয় চাকরি আর বিজ্ঞাপন', body: 'Google, Facebook বা Apple দিয়ে এক ক্লিকে সাইন ইন।', cta: { label: 'চাকরি দেখুন', href: '/jobs' } },
    { order: 4, tone: 'gold', icon: 'tree', eyebrow: 'ভ্রমণ', title: 'মহাস্থানগড় থেকে করতোয়ার পাড়', body: '', cta: { label: 'দর্শনীয় স্থান', href: '/directory/tourist-spot' } },
  ]);

  console.log(`Seeded: ${users.length} users, ${created.length} posts, ${db.doctors.length} doctors, ${db.directory.length} directory entries, ${db.voters.length} voters.`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
