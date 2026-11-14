import { ApiError } from '@/errors/ApiError';
import { contentService, publicList } from '@/utils/content';
import { searchFilter } from '@/utils/pagination';
import { omit, withId } from '@/utils/serialize';
import { NotableModel } from './notable.model';

const visible = { deletedAt: null, published: true };
const PRIVATE = ['deletedAt', 'createdAt', 'updatedAt', 'published'] as const;

/** Lists carry the summary; the biography comes with the single person. */
export const listPublic = async (q: { page: number; limit: number; search?: string; field?: string }) => {
  const r = await publicList(NotableModel, { ...visible, ...(q.field && { field: q.field }), ...searchFilter(q.search, ['name', 'title']) }, q, { name: 1 }, '-body');
  return { ...r, items: r.items.map((x) => omit(x, PRIVATE)) };
};
export const getPublic = async (id: string) => {
  const p = await NotableModel.findOne({ _id: id, ...visible }).lean();
  if (!p) throw ApiError.notFound('তথ্য পাওয়া যায়নি');
  return omit(withId(p)!, PRIVATE);
};
export const admin = contentService({ model: NotableModel, noun: 'জীবনী', label: (d) => String(d.name), searchFields: ['name', 'title'], sortable: ['name', 'updatedAt'], defaultSort: { updatedAt: -1 }, filter: (q) => (q.field ? { field: q.field } : {}) });
