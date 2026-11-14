import { contentService, publicList } from '@/utils/content';
import { searchFilter } from '@/utils/pagination';
import { omit } from '@/utils/serialize';
import { FreedomFighterModel } from './freedomFighter.model';

const SEARCH = ['name', 'fatherName', 'idNo', 'village'];
export const listPublic = async (q: { page: number; limit: number; search?: string; union?: string }) => {
  const r = await publicList(FreedomFighterModel, { deletedAt: null, ...(q.union && { union: q.union }), ...searchFilter(q.search, SEARCH) }, q, { name: 1 });
  return { ...r, items: r.items.map((x) => omit(x, ['deletedAt', 'createdAt', 'updatedAt'] as const)) };
};
export const admin = contentService({ model: FreedomFighterModel, noun: 'মুক্তিযোদ্ধার তথ্য', label: (d) => String(d.name), searchFields: SEARCH, sortable: ['name', 'idNo', 'updatedAt'], defaultSort: { name: 1 }, filter: (q) => (q.union ? { union: q.union } : {}) });
