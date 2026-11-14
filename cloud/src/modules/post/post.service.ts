import type { ClientSession, PipelineStage } from 'mongoose';
import { Types } from 'mongoose';
import { MIN_MARRIAGE_AGE, POST_KINDS, type PostKind } from '@/config/catalog';
import { ApiError } from '@/errors/ApiError';
import * as audit from '@/modules/audit/audit.service';
import * as siteService from '@/modules/site/site.service';
import { pageMeta, toSort } from '@/utils/pagination';
import { daysAhead } from '@/utils/time';
import type { Model } from 'mongoose';
import { KIND_MODELS, PostModel } from './post.model';

/**
 * Posts are polymorphic (one discriminator per kind), so queries go through a loose alias: the base model's
 * types only know the shared fields. Inputs are already validated per kind by post.validator.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
const Posts = PostModel as unknown as Model<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
const Kinds = KIND_MODELS as unknown as Record<PostKind, Model<any>>;

type Row = Record<string, unknown> & { _id: unknown; postType: PostKind; status: string; owner: unknown; images?: string[]; expiresAt: Date };

/* ---------- shapes ---------- */

const SEARCH: Record<PostKind, string[]> = {
  job: ['company', 'title', 'address'],
  listing: ['title', 'address', 'description'],
  rental: ['title', 'address', 'description'],
  vehicle: ['ownerName', 'description'],
  tuition: ['subject', 'classLevel', 'address', 'name'],
  matrimony: ['profession', 'education', 'address', 'name'],
};
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const anyOf = (search: string | undefined, fields: string[]) => (search ? { $or: fields.map((f) => ({ [f]: new RegExp(escape(search), 'i') })) } : {});

/** “Done” is spelled per kind on the site: sold, rented, done. */
const publicStatus = (kind: PostKind, status: string) => (status === 'done' ? POST_KINDS[kind].done : status);

/** The site's shape for each kind (client/src/features/<kind>/schemas). */
export const toPublic = (d: Row) => {
  const { _id, postType, owner, images = [], status, removedReason: _r, reports: _rp, views: _v, updatedAt: _u, __v: _vv, expiresAt: _e, ...rest } = d as Row & Record<string, unknown>;
  const base = { id: String(_id), ownerId: String(owner), status: publicStatus(postType, status), ...rest };
  if (postType === 'job') return { ...base, image: images[0] ?? null };
  if (postType === 'tuition' || postType === 'matrimony') return { ...base, photo: images[0] ?? null };
  if (postType === 'vehicle') return base;
  return { ...base, images };
};

/** One-line title and body for the console and reports. */
const titleOf = (d: Record<string, unknown>) => {
  switch (d.postType) {
    case 'job':
      return `${d.title} — ${d.company}`;
    case 'vehicle':
      return `${d.ownerName} — গাড়ি ভাড়া`;
    case 'tuition':
      return `${d.subject} — ${d.classLevel}`;
    case 'matrimony':
      return `${d.gender === 'bride' ? 'পাত্রী' : 'পাত্র'}: ${d.name}`;
    default:
      return String(d.title);
  }
};
const bodyOf = (d: Record<string, unknown>) => String(d.details ?? d.description ?? (d.postType === 'tuition' ? d.note || d.qualification : d.preference) ?? '');

/** Is this post on the site right now? */
const liveFilter = (kind: PostKind) => ({
  postType: kind,
  expiresAt: { $gt: new Date() },
  status: POST_KINDS[kind].keepDone ? { $in: ['active', 'done'] } : 'active',
});

/* ---------- public ---------- */

export const listPublic = async (kind: PostKind, q: Record<string, unknown> & { page: number; limit: number; search?: string }) => {
  const { page, limit, search, sort: _s, ...filters } = q;
  const filter = { ...liveFilter(kind), ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined)), ...anyOf(search, SEARCH[kind]) };
  const [docs, total] = await Promise.all([
    Posts.find(filter).sort({ status: 1, featured: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Posts.countDocuments(filter),
  ]);
  return { items: (docs as unknown as Row[]).map(toPublic), meta: pageMeta(page, limit, total) };
};

export const getPublic = async (kind: PostKind, id: string) => {
  const d = await Posts.findOneAndUpdate({ _id: id, ...liveFilter(kind) }, { $inc: { views: 1 } }, { returnDocument: 'after' }).lean();
  if (!d) throw ApiError.notFound('পোস্টটি পাওয়া যায়নি');
  return toPublic(d as unknown as Row);
};

interface Poster {
  id: string;
  banned: boolean;
}

/** Posting rules: signed in, not banned, not in maintenance, within the daily limit and the kind's own rules. */
export const createPost = async (kind: PostKind, input: Record<string, unknown>, user: Poster) => {
  if (user.banned) throw ApiError.forbidden('আপনার অ্যাকাউন্ট থেকে পোস্ট দেওয়া বন্ধ আছে', 'BANNED');
  const settings = await siteService.getSettings();
  if (settings.maintenance.enabled) throw new ApiError(503, settings.maintenance.message || 'রক্ষণাবেক্ষণ চলছে, একটু পরে চেষ্টা করুন', 'MAINTENANCE');
  const today = await Posts.countDocuments({ owner: user.id, createdAt: { $gt: new Date(Date.now() - 864e5) } });
  if (today >= settings.posting.postsPerDay) throw new ApiError(429, 'আজকের পোস্টের সীমা শেষ। কাল আবার চেষ্টা করুন।', 'POST_LIMIT');

  const { website: _hp, durationDays, photo, ...data } = input as Record<string, unknown> & { durationDays?: number; photo?: string | null };
  const images = (photo ? [photo] : ((data.images as string[]) ?? [])).slice(0, settings.posting.maxPhotos);
  let days: number;
  switch (kind) {
    case 'job': {
      if (!settings.posting.jobDurations.includes(Number(durationDays))) throw ApiError.field('durationDays', 'মেয়াদ বেছে নিন');
      if (new Date(String(data.deadline)).getTime() < new Date().setHours(0, 0, 0, 0)) throw ApiError.field('deadline', 'আজ বা পরের তারিখ দিন');
      days = Number(durationDays);
      break;
    }
    case 'rental':
      days = settings.posting.rentalDays;
      break;
    case 'tuition':
      days = settings.posting.tuitionDays;
      break;
    case 'vehicle':
      days = settings.posting.vehicleDays;
      break;
    case 'matrimony': {
      const age = new Date().getFullYear() - Number(data.birthYear);
      const min = MIN_MARRIAGE_AGE[data.gender as 'bride' | 'groom'];
      if (age < min) throw ApiError.field('birthYear', `${data.gender === 'bride' ? 'পাত্রীর' : 'পাত্রের'} বয়স অন্তত ${min === 18 ? '১৮' : '২১'} বছর হতে হবে`);
      days = settings.posting.matrimonyDays;
      break;
    }
    default:
      days = 30;
  }
  const doc = await Kinds[kind].create({ ...data, images, owner: user.id, expiresAt: daysAhead(days) });
  return { id: String(doc._id), status: 'published' as const };
};

const ownPost = async (kind: PostKind, id: string, userId: string) => {
  const p = await Posts.findOne({ _id: id, postType: kind, status: { $nin: ['deleted'] } });
  if (!p) throw ApiError.notFound('পোস্টটি পাওয়া যায়নি');
  if (String(p.owner) !== userId) throw ApiError.forbidden('শুধু পোস্টদাতা নিজে এই পোস্ট পরিবর্তন করতে পারেন', 'NOT_OWNER');
  if (p.status === 'removed') throw ApiError.forbidden('অ্যাডমিন পোস্টটি সরিয়েছেন', 'REMOVED');
  return p;
};

export const updateOwn = async (kind: PostKind, id: string, input: Record<string, unknown>, user: Poster) => {
  if (user.banned) throw ApiError.forbidden('আপনার অ্যাকাউন্ট থেকে পোস্ট দেওয়া বন্ধ আছে', 'BANNED');
  const p = await ownPost(kind, id, user.id);
  const { website: _hp, durationDays: _d, photo, ...data } = input as Record<string, unknown> & { photo?: string | null };
  if (photo !== undefined) data.images = photo ? [photo] : [];
  p.set(data);
  await p.save();
  return toPublic(p.toObject() as unknown as Row);
};

export const manageOwn = async (kind: PostKind, id: string, action: 'delete' | 'mark-done', userId: string) => {
  const p = await ownPost(kind, id, userId);
  p.status = action === 'delete' ? 'deleted' : 'done';
  await p.save();
  return { ok: true as const };
};

/** “আমার পোস্ট” on the account page. */
export const myPosts = async (userId: string) => {
  const docs = (await Posts.find({ owner: userId, status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).limit(200).lean()) as unknown as Row[];
  return docs.map((d) => ({
    kind: d.postType,
    id: String(d._id),
    title: titleOf(d),
    status: d.status === 'done' ? POST_KINDS[d.postType].done : d.status,
    createdAt: d.createdAt,
    href: POST_KINDS[d.postType].site(String(d._id)),
  }));
};

/* ---------- reports (called by the report module) ---------- */

/** Can this post be reported (is it publicly visible)? */
export const assertReportable = async (id: string) => {
  const p = await Posts.findOne({ _id: id, status: { $in: ['active', 'done', 'hidden'] } }).select('postType status').lean();
  if (!p) throw ApiError.notFound('পোস্টটি পাওয়া যায়নি');
  return p;
};
export const bumpReports = (id: string) => Posts.updateOne({ _id: id }, { $inc: { reports: 1 } });
export const hideForReports = (id: string) => Posts.updateOne({ _id: id, status: 'active' }, { $set: { status: 'hidden' } });
export const unhide = (id: string) => Posts.updateOne({ _id: id, status: 'hidden' }, { $set: { status: 'active' } });

/** Summary used in report cases and admin search. */
export const summary = async (id: string) => {
  const d = (await Posts.findById(id).populate<{ owner: { _id: Types.ObjectId; name: string; status: string } }>('owner', 'name status').lean()) as unknown as Row & { owner: { _id: Types.ObjectId; name: string; status: string } };
  if (!d) return null;
  const priorRemovals = await Posts.countDocuments({ owner: d.owner._id, status: 'removed', _id: { $ne: d._id } });
  return {
    post: { id: String(d._id), kind: d.postType, title: titleOf(d), body: bodyOf(d), phone: d.phone, status: adminStatus(d) },
    owner: { id: String(d.owner._id), name: d.owner.name, banned: d.owner.status === 'banned', priorRemovals },
  };
};

/* ---------- console ---------- */

const adminStatus = (d: { status: string; expiresAt: Date }) => (d.status === 'active' && d.expiresAt <= new Date() ? 'expired' : d.status);

const adminView = (d: Row & { ownerDoc?: { _id: unknown; name: string; status: string } }) => ({
  id: String(d._id),
  kind: d.postType,
  title: titleOf(d),
  body: bodyOf(d),
  phone: d.phone,
  address: d.address ?? '',
  images: d.images ?? [],
  owner: { id: String(d.owner), name: d.ownerDoc?.name ?? 'অজানা', banned: d.ownerDoc?.status === 'banned' },
  status: adminStatus(d),
  featured: d.featured,
  verified: d.verified,
  reports: d.reports,
  views: d.views,
  createdAt: d.createdAt,
  expiresAt: d.expiresAt,
  removedReason: d.removedReason ?? null,
});

const ADMIN_SEARCH = ['title', 'company', 'ownerName', 'sellerName', 'name', 'subject', 'phone', 'ownerDoc.name'];

export const adminList = async (q: { page: number; limit: number; search?: string; sort?: string; kind?: PostKind; status?: string; featured?: boolean; owner?: string }) => {
  const now = new Date();
  const statusMatch =
    q.status === 'active' ? { status: 'active', expiresAt: { $gt: now } } : q.status === 'expired' ? { status: 'active', expiresAt: { $lte: now } } : q.status ? { status: q.status } : { status: { $ne: 'deleted' } };
  const pipeline: PipelineStage[] = [
    { $match: { ...statusMatch, ...(q.kind && { postType: q.kind }), ...(q.featured && { featured: true }), ...(q.owner && { owner: new Types.ObjectId(q.owner) }) } },
    { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'ownerDoc', pipeline: [{ $project: { name: 1, status: 1 } }] } },
    { $set: { ownerDoc: { $first: '$ownerDoc' } } },
    ...(q.search ? [{ $match: anyOf(q.search, ADMIN_SEARCH) } as PipelineStage] : []),
    { $sort: toSort(q.sort, ['createdAt', 'reports', 'expiresAt', 'views'], { createdAt: -1 }) },
    { $facet: { items: [{ $skip: (q.page - 1) * q.limit }, { $limit: q.limit }], total: [{ $count: 'n' }] } },
  ];
  const [r] = await Posts.aggregate<{ items: Row[]; total: { n: number }[] }>(pipeline);
  return { items: r.items.map(adminView), meta: pageMeta(q.page, q.limit, r.total[0]?.n ?? 0) };
};

export const adminGet = async (id: string) => {
  const [d] = await Posts.aggregate<Row>([
    { $match: { _id: new Types.ObjectId(id), status: { $ne: 'deleted' } } },
    { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'ownerDoc', pipeline: [{ $project: { name: 1, status: 1 } }] } },
    { $set: { ownerDoc: { $first: '$ownerDoc' } } },
  ]);
  if (!d) throw ApiError.notFound('পোস্টটি পাওয়া যায়নি');
  return adminView(d);
};

const staffPost = async (id: string, session?: ClientSession) => {
  const p = await Posts.findOne({ _id: id, status: { $ne: 'deleted' } }).session(session ?? null);
  if (!p) throw ApiError.notFound('পোস্টটি পাওয়া যায়নি');
  return p;
};

/** feature / verify / extend / remove / restore, each audited. */
export const moderate = async (id: string, action: 'feature' | 'verify' | 'extend' | 'remove' | 'restore', body: { value?: boolean; days?: number; reason?: string }, actor: audit.Actor, session?: ClientSession) => {
  const p = await staffPost(id, session);
  let auditAction: string;
  switch (action) {
    case 'feature':
      p.featured = !!body.value;
      auditAction = body.value ? 'post.feature' : 'post.unfeature';
      break;
    case 'verify':
      p.verified = !!body.value;
      auditAction = body.value ? 'post.verify' : 'post.unverify';
      break;
    case 'extend': {
      const from = Math.max(Date.now(), p.expiresAt.getTime());
      p.expiresAt = new Date(from + Number(body.days) * 864e5);
      auditAction = 'post.extend';
      break;
    }
    case 'remove':
      p.status = 'removed';
      p.removedReason = body.reason ?? null;
      auditAction = 'post.remove';
      break;
    case 'restore':
      p.status = 'active';
      p.removedReason = null;
      auditAction = 'post.restore';
      break;
  }
  await p.save({ session });
  await audit.record(actor, { action: auditAction, type: 'post', id, label: titleOf(p.toObject() as Record<string, unknown>), reason: body.reason ?? null }, session);
  return adminGet(id);
};

/** A ban takes the person's live posts off the site. Returns how many. */
export const removeAllForOwner = async (ownerId: string, reason: string, session?: ClientSession) =>
  (await Posts.updateMany({ owner: ownerId, status: { $in: ['active', 'hidden'] } }, { $set: { status: 'removed', removedReason: reason } }, { session })).modifiedCount;

/** Per-owner counts for the console's user list. */
export const countsByOwners = async (ids: string[]) => {
  const rows = await Posts.aggregate<{ _id: Types.ObjectId; posts: number; active: number; removed: number; reports: number }>([
    { $match: { owner: { $in: ids.map((i) => new Types.ObjectId(i)) }, status: { $ne: 'deleted' } } },
    { $group: { _id: '$owner', posts: { $sum: 1 }, active: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'active'] }, { $gt: ['$expiresAt', new Date()] }] }, 1, 0] } }, removed: { $sum: { $cond: [{ $eq: ['$status', 'removed'] }, 1, 0] } }, reports: { $sum: '$reports' } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r]));
};

/* ---------- dashboard & search ---------- */

export const dashboardCounts = async () => {
  const now = new Date();
  const start = new Date(now.getTime() - 864e5);
  const [byKind, postsToday, activePosts] = await Promise.all([
    Posts.aggregate<{ _id: PostKind; n: number }>([{ $match: { status: 'active', expiresAt: { $gt: now } } }, { $group: { _id: '$postType', n: { $sum: 1 } } }]),
    Posts.countDocuments({ createdAt: { $gt: start } }),
    Posts.countDocuments({ status: 'active', expiresAt: { $gt: now } }),
  ]);
  return { byKind: new Map(byKind.map((k) => [k._id, k.n])), postsToday, activePosts };
};

/** New posts per day for the last `days` days, in Bangladesh time, oldest first. */
export const activity = async (days: number) => {
  const since = new Date(Date.now() - days * 864e5);
  const rows = await Posts.aggregate<{ _id: string; n: number }>([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Dhaka' } }, n: { $sum: 1 } } },
  ]);
  const map = new Map(rows.map((r) => [r._id, r.n]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 864e5);
    const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(d);
    return { date: new Date(`${key}T00:00:00+06:00`).toISOString(), posts: map.get(key) ?? 0 };
  });
};

export const hiddenPosts = async (n: number) => (await Posts.find({ status: 'hidden' }).sort({ updatedAt: -1 }).limit(n).lean()).map((d) => ({ id: String(d._id), title: titleOf(d as Record<string, unknown>), at: d.updatedAt }));

export const searchAdmin = async (q: string, limit: number) => (await adminList({ page: 1, limit, search: q })).items;
export const searchPublicJobs = async (q: string, limit: number) => (await Posts.find({ ...liveFilter('job'), ...anyOf(q, ['title', 'company']) }).limit(limit).lean()) as unknown as (Row & { title: string; company: string })[];
export const reportTitle = (d: Record<string, unknown>) => titleOf(d);
