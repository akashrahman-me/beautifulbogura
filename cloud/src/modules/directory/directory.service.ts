import { Types } from 'mongoose';
import { ADDABLE_DIRECTORY_TYPES, RATABLE_DIRECTORY_TYPES, type DIRECTORY_TYPES } from '@/config/catalog';
import { ApiError } from '@/errors/ApiError';
import * as submissionService from '@/modules/submission/submission.service';
import { contentService, publicList } from '@/utils/content';
import { searchFilter } from '@/utils/pagination';
import { omit, withId } from '@/utils/serialize';
import { DirectoryModel } from './directory.model';

const PRIVATE = ['hidden', 'deletedAt', 'createdAt', 'updatedAt'] as const;

export const admin = contentService({
  model: DirectoryModel,
  noun: 'তথ্য',
  label: (d) => String(d.name),
  searchFields: ['name', 'role', 'address', 'phone'],
  sortable: ['name', 'updatedAt', 'type'],
  defaultSort: { updatedAt: -1 },
  filter: (q) => ({ ...(q.type ? { type: q.type } : {}), ...(q.verified !== undefined ? { verified: q.verified } : {}), ...(q.hidden !== undefined ? { hidden: q.hidden } : {}) }),
});

export const listPublic = async (type: string, q: { page: number; limit: number; search?: string }) => {
  const r = await publicList(DirectoryModel, { type, deletedAt: null, hidden: false, ...searchFilter(q.search, ['name', 'role', 'address', 'phone']) }, q, { verified: -1, name: 1 });
  return { ...r, items: r.items.map((d) => omit(d, PRIVATE)) };
};

/** “Add your info” on an addable list → review queue. */
export const submitEntry = async (type: string, body: { name: string; role: string; phone: string; whatsapp: boolean; address: string; description: string }, userId?: string) => {
  if (!(ADDABLE_DIRECTORY_TYPES as readonly string[]).includes(type)) throw ApiError.forbidden('এই তালিকায় সরাসরি তথ্য যুক্ত করা যায় না। অ্যাডমিনকে জানান।', 'NOT_ADDABLE');
  return submissionService.submit({
    kind: 'directory',
    directoryType: type,
    title: body.name,
    summary: [body.role, body.address].filter(Boolean).join(' · '),
    data: body,
    submitter: { name: body.name, phone: body.phone, userId },
  });
};

/** Running average, updated atomically. */
export const rate = async (type: string, id: string, stars: number) => {
  if (!(RATABLE_DIRECTORY_TYPES as readonly string[]).includes(type)) throw ApiError.forbidden('এই তালিকায় রেটিং দেওয়া যায় না', 'NOT_RATABLE');
  // One atomic pipeline update on the driver: new average = (old average × count + stars) / (count + 1).
  const e = await DirectoryModel.collection.findOneAndUpdate(
    { _id: new Types.ObjectId(id), type, deletedAt: null, hidden: false },
    [{ $set: { rating: { $divide: [{ $add: [{ $multiply: [{ $ifNull: ['$rating', 0] }, '$ratingCount'] }, stars] }, { $add: ['$ratingCount', 1] }] }, ratingCount: { $add: ['$ratingCount', 1] } } }],
    { returnDocument: 'after' },
  );
  if (!e) throw ApiError.notFound('তথ্য পাওয়া যায়নি');
  return omit(withId(e)!, PRIVATE);
};

submissionService.registerPublisher('directory', async (data, sub, session) => {
  const [e] = await DirectoryModel.create([{ ...data, type: sub.directoryType as (typeof DIRECTORY_TYPES)[number], verified: true }], { session });
  return String(e._id);
});

export const searchPublic = (q: string, limit: number) => DirectoryModel.find({ deletedAt: null, hidden: false, ...searchFilter(q, ['name', 'role']) }).limit(limit).lean();
export const searchAdmin = (q: string, limit: number) => DirectoryModel.find({ deletedAt: null, ...searchFilter(q, ['name', 'role', 'phone']) }).limit(limit).lean();
