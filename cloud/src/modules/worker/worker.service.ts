import { ApiError } from '@/errors/ApiError';
import { contentService, publicList } from '@/utils/content';
import { searchFilter } from '@/utils/pagination';
import { omit, withId } from '@/utils/serialize';
import { WorkerModel, type Worker } from './worker.model';

const PRIVATE = ['hidden', 'deletedAt', 'updatedAt'] as const;

export const listPublic = async (q: { page: number; limit: number; search?: string; trade?: string }) => {
  const r = await publicList(WorkerModel, { deletedAt: null, hidden: false, ...(q.trade && { trades: q.trade }), ...searchFilter(q.search, ['name', 'phone', 'address']) }, q, { createdAt: -1 });
  return { ...r, items: r.items.map((w) => omit(w, PRIVATE)) };
};

/** Self-registration publishes at once (a phone number and trades, nothing to review); staff can hide it. */
export const register = async (body: { name: string; phone: string; trades: string[]; address: string }) => {
  if (await WorkerModel.exists({ phone: body.phone, deletedAt: null })) throw ApiError.conflict('এই নম্বরে আগে নিবন্ধন করা হয়েছে', 'WORKER_EXISTS', [{ path: 'phone', message: 'এই নম্বরে আগে নিবন্ধন করা হয়েছে' }]);
  const w = await WorkerModel.create(body as Partial<Worker>);
  return omit(withId(w.toObject())!, PRIVATE);
};

export const admin = contentService({ model: WorkerModel, noun: 'কারিগরের তথ্য', label: (d) => String(d.name), searchFields: ['name', 'phone', 'address'], sortable: ['name', 'createdAt'], defaultSort: { createdAt: -1 }, filter: (q) => (q.trade ? { trades: q.trade } : {}) });
