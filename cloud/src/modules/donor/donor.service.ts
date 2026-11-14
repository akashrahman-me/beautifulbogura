import { DONATION_GAP_DAYS } from '@/config/catalog';
import { ApiError } from '@/errors/ApiError';
import { contentService } from '@/utils/content';
import { pageMeta, searchFilter } from '@/utils/pagination';
import { omit, withId } from '@/utils/serialize';
import { daysAgo } from '@/utils/time';
import type { QueryFilter } from 'mongoose';
import { DonorModel, type Donor } from './donor.model';

type F = QueryFilter<Donor>;

const PRIVATE = ['hidden', 'deletedAt', 'createdAt', 'updatedAt'] as const;
const visible = { deletedAt: null, hidden: false };

/** ready = 120+ days since the last donation; unknown = never recorded. */
const statusFilter = (status?: string): F => {
  const cutoff = daysAgo(DONATION_GAP_DAYS);
  if (status === 'ready') return { lastDonation: { $ne: null, $lte: cutoff } };
  if (status === 'not-yet') return { lastDonation: { $gt: cutoff } };
  if (status === 'unknown') return { lastDonation: null };
  return {};
};

/** Ready donors first, then by name — the person searching needs someone who can give today. */
export const listPublic = async (q: { page: number; limit: number; search?: string; group?: string; status?: string }) => {
  const match = { ...visible, ...(q.group && { group: q.group }), ...statusFilter(q.status), ...searchFilter(q.search, ['name', 'phone', 'address']) } as F;
  const cutoff = daysAgo(DONATION_GAP_DAYS);
  const [docs, total] = await Promise.all([
    DonorModel.aggregate([
      { $match: match },
      { $addFields: { _ready: { $cond: [{ $and: [{ $ne: ['$lastDonation', null] }, { $lte: ['$lastDonation', cutoff] }] }, 1, 0] } } },
      { $sort: { _ready: -1, name: 1, _id: 1 } },
      { $skip: (q.page - 1) * q.limit },
      { $limit: q.limit },
      { $project: { _ready: 0 } },
    ]),
    DonorModel.countDocuments(match),
  ]);
  return { items: docs.map((d) => omit(withId(d)!, PRIVATE)), meta: pageMeta(q.page, q.limit, total) };
};

export const stats = async () => {
  const [byGroup, total, ready, notYet, unknown] = await Promise.all([
    DonorModel.aggregate<{ _id: string; n: number }>([{ $match: visible }, { $group: { _id: '$group', n: { $sum: 1 } } }]),
    DonorModel.countDocuments(visible),
    DonorModel.countDocuments({ ...visible, ...statusFilter('ready') }),
    DonorModel.countDocuments({ ...visible, ...statusFilter('not-yet') }),
    DonorModel.countDocuments({ ...visible, ...statusFilter('unknown') }),
  ]);
  return { total, byGroup: Object.fromEntries(byGroup.map((g) => [g._id, g.n])), ready, notYet, unknown };
};

export const register = async (body: { name: string; group: string; phone: string; address: string; lastDonation: string | null }) => {
  if (await DonorModel.exists({ phone: body.phone, deletedAt: null })) {
    throw ApiError.conflict('এই নম্বরে আগে নিবন্ধন করা হয়েছে', 'DONOR_EXISTS', [{ path: 'phone', message: 'এই নম্বরে আগে নিবন্ধন করা হয়েছে' }]);
  }
  const d = await DonorModel.create({ ...body, lastDonation: body.lastDonation ? new Date(body.lastDonation) : null } as Partial<Donor>);
  return omit(withId(d.toObject())!, PRIVATE);
};

export const updateLastDonation = async (id: string, phone: string, lastDonation: string) => {
  const d = await DonorModel.findOne({ _id: id, ...visible });
  if (!d) throw ApiError.notFound('দাতার তথ্য পাওয়া যায়নি');
  if (d.phone !== phone) throw new ApiError(403, 'মোবাইল নম্বর মেলেনি', 'PHONE_MISMATCH', [{ path: 'phone', message: 'নিবন্ধিত মোবাইল নম্বর লিখুন' }]);
  d.lastDonation = new Date(lastDonation);
  await d.save();
  return omit(withId(d.toObject())!, PRIVATE);
};

export const admin = contentService({
  model: DonorModel,
  noun: 'রক্তদাতার তথ্য',
  label: (d) => String(d.name),
  searchFields: ['name', 'phone', 'address'],
  sortable: ['name', 'group', 'createdAt', 'lastDonation'],
  defaultSort: { createdAt: -1 },
  filter: (q) => ({ ...(q.group ? { group: q.group } : {}), ...statusFilter(q.status as string | undefined) }),
  prepare: (b) => ({ ...b, ...(b.lastDonation !== undefined && { lastDonation: b.lastDonation ? new Date(String(b.lastDonation)) : null }) }),
});

export const countReady = () => DonorModel.countDocuments({ ...visible, ...statusFilter('ready') });
export const countAll = () => DonorModel.countDocuments(visible);
/** Push audience: donors' numbers are not push targets; this is for counting a blood-group request. */
export const countByGroup = (group?: string | null) => DonorModel.countDocuments({ ...visible, ...(group && { group }) } as F);
export const searchAdmin = (q: string, limit: number) => DonorModel.find({ deletedAt: null, ...searchFilter(q, ['name', 'phone']) }).limit(limit).lean();
