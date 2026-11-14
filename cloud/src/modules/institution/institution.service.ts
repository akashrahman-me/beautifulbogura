import { ApiError } from '@/errors/ApiError';
import * as submissionService from '@/modules/submission/submission.service';
import { contentService, publicList } from '@/utils/content';
import { searchFilter } from '@/utils/pagination';
import { withId } from '@/utils/serialize';
import { InstitutionModel, type Institution } from './institution.model';

const visible = { deletedAt: null, hidden: false };

/** The notice module registers its counter (it depends on this module, not the other way round). */
let countNotices: (institutionId: string) => Promise<number> = async () => 0;
export const setNoticeCounter = (fn: typeof countNotices) => void (countNotices = fn);
type Row = Record<string, unknown> & { id: string; photo?: string | null; address?: string; claimedBy?: string | null };

/** The site's shape: `image`, `area`, `claimed` (who claimed it stays private). */
const toPublic = ({ photo, claimedBy, claimedById: _c, hidden: _h, deletedAt: _d, createdAt: _cr, updatedAt: _u, ...rest }: Row) => ({ ...rest, image: photo ?? null, area: rest.address ?? '', claimed: !!claimedBy });

export const listPublic = async (q: { page: number; limit: number; search?: string; type?: string }) => {
  const r = await publicList(InstitutionModel, { ...visible, ...(q.type && { type: q.type }), ...searchFilter(q.search, ['name', 'eiin', 'address', 'union']) }, q, { name: 1 });
  return { ...r, items: r.items.map((i) => toPublic(i as Row)) };
};

export const getPublic = async (id: string) => {
  const i = await InstitutionModel.findOne({ _id: id, ...visible }).lean();
  if (!i) throw ApiError.notFound('প্রতিষ্ঠানটি পাওয়া যায়নি');
  return toPublic(withId(i) as Row);
};

export const submitInstitution = (body: Record<string, string> & { name: string; submitter: string; phone: string; type: string; union: string }, userId?: string) => {
  const { submitter, ...data } = body;
  return submissionService.submit({ kind: 'institution', title: data.name, summary: [data.union, data.address].filter(Boolean).join(' · '), data, submitter: { name: submitter, phone: data.phone, userId } });
};

export const submitClaim = async (id: string, body: { name: string; role: string; phone: string; email: string; proof: string }, userId?: string) => {
  const i = await InstitutionModel.findOne({ _id: id, ...visible }).lean();
  if (!i) throw ApiError.notFound('প্রতিষ্ঠানটি পাওয়া যায়নি');
  const { ...data } = body;
  return submissionService.submit({ kind: 'claim', targetId: id, title: `${i.name} — দাবি`, summary: body.role, data: { institution: i.name, ...data }, submitter: { name: body.name, phone: body.phone, userId } });
};

submissionService.registerPublisher('institution', async (data, _sub, session) => {
  const [i] = await InstitutionModel.create([{ ...data, eiin: data.eiin ?? '' } as Partial<Institution>], { session });
  return String(i._id);
});
submissionService.registerPublisher('claim', async (data, sub, session) => {
  const i = await InstitutionModel.findOneAndUpdate({ _id: sub.targetId, deletedAt: null }, { $set: { claimedBy: data.name, claimedById: sub.submitterUserId } }, { returnDocument: 'after', session });
  if (!i) throw ApiError.notFound('প্রতিষ্ঠানটি আর নেই');
  return String(i._id);
});

export const admin = contentService({
  model: InstitutionModel,
  noun: 'প্রতিষ্ঠানের তথ্য',
  label: (d) => String(d.name),
  searchFields: ['name', 'eiin', 'address'],
  sortable: ['name', 'updatedAt'],
  defaultSort: { name: 1 },
  filter: (q) => ({ ...(q.type ? { type: q.type } : {}), ...(q.union ? { union: q.union } : {}) }),
  toAdmin: async (d) => ({ ...withId(d)!, notices: await countNotices(String(d._id)) }),
});

export const nameOf = async (id: string) => (await InstitutionModel.findOne({ _id: id, deletedAt: null }).select('name').lean())?.name ?? null;
export const searchPublic = (q: string, limit: number) => InstitutionModel.find({ ...visible, ...searchFilter(q, ['name', 'eiin']) }).limit(limit).lean();
export const searchAdmin = (q: string, limit: number) => InstitutionModel.find({ deletedAt: null, ...searchFilter(q, ['name', 'eiin']) }).limit(limit).lean();
