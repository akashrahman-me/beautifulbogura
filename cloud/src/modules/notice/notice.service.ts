import { ApiError } from '@/errors/ApiError';
import { contentService, publicList } from '@/utils/content';
import { withId } from '@/utils/serialize';
import * as institutionService from '@/modules/institution/institution.service';
import { NoticeModel } from './notice.model';

type Row = Record<string, unknown> & { _id: unknown; institution?: unknown };
/** API shape: `institutionId` rather than the stored reference. */
const view = (d: Row) => {
  const { institution, deletedAt: _d, updatedAt: _u, ...rest } = withId(d)! as Row & { id: string };
  return { ...rest, institutionId: String(institution) };
};

export const listPublic = async (q: { page: number; limit: number; institution?: string }) => {
  const r = await publicList(NoticeModel, { deletedAt: null, ...(q.institution && { institution: q.institution }) }, q, { pinned: -1, createdAt: -1 });
  return { ...r, items: r.items.map((n) => view({ ...n, _id: n.id } as Row)) };
};

export const countFor = (institutionId: string) => NoticeModel.countDocuments({ institution: institutionId, deletedAt: null });

export const admin = contentService({
  model: NoticeModel,
  noun: 'নোটিশ',
  label: (d) => String(d.title),
  searchFields: ['title', 'institutionName'],
  sortable: ['createdAt', 'title'],
  defaultSort: { pinned: -1, createdAt: -1 },
  filter: (q) => (q.institution ? { institution: q.institution } : {}),
  toAdmin: (d) => view(d as Row),
  // The form sends `institutionId`; store the reference and the current name.
  prepare: async ({ institutionId, ...rest }) => {
    if (!institutionId) return rest;
    const name = await institutionService.nameOf(String(institutionId));
    if (!name) throw ApiError.field('institutionId', 'প্রতিষ্ঠান পাওয়া যায়নি');
    return { ...rest, institution: institutionId, institutionName: name };
  },
});

institutionService.setNoticeCounter(countFor);
