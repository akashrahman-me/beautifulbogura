import { contentService, publicList } from '@/utils/content';
import { searchFilter } from '@/utils/pagination';
import { omit } from '@/utils/serialize';
import { AchieverModel } from './achiever.model';

const SEARCH = ['name', 'post', 'village', 'workplace'];
export const listPublic = async (q: { page: number; limit: number; search?: string; cadre?: string }) => {
  const r = await publicList(AchieverModel, { deletedAt: null, ...(q.cadre && { cadre: q.cadre }), ...searchFilter(q.search, SEARCH) }, q, { name: 1 });
  return { ...r, items: r.items.map((x) => omit(x, ['deletedAt', 'createdAt', 'updatedAt'] as const)) };
};
export const admin = contentService({ model: AchieverModel, noun: 'কৃতি সন্তানের তথ্য', label: (d) => String(d.name), searchFields: SEARCH, sortable: ['name', 'updatedAt'], defaultSort: { name: 1 }, filter: (q) => (q.cadre ? { cadre: q.cadre } : {}) });
