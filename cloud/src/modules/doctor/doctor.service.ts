import { ApiError } from '@/errors/ApiError';
import * as submissionService from '@/modules/submission/submission.service';
import { contentService, publicList } from '@/utils/content';
import { searchFilter } from '@/utils/pagination';
import { omit, withId } from '@/utils/serialize';
import { dhakaWeekday } from '@/utils/time';
import { DoctorModel, type Doctor } from './doctor.model';

const PRIVATE = ['hidden', 'deletedAt', 'createdAt', 'updatedAt', 'verified'] as const;
const SEARCH = ['name', 'specialty', 'phone', 'chambers.hospital'];
const visible = { deletedAt: null, hidden: false };

/** `sittingToday` is never stored: it is today's weekday (in Bangladesh) against the chamber days. */
const toPublic = (d: Record<string, unknown> & { chambers?: { days: number[] }[] }) => {
  const today = dhakaWeekday();
  return { ...omit(d, PRIVATE), sittingToday: (d.chambers ?? []).some((c) => c.days.includes(today)) };
};

export const listPublic = async (q: { page: number; limit: number; search?: string; specialty?: string; today?: boolean }) => {
  const filter = { ...visible, ...(q.specialty && { specialty: q.specialty }), ...(q.today && { 'chambers.days': dhakaWeekday() }), ...searchFilter(q.search, SEARCH) };
  const r = await publicList(DoctorModel, filter, q, { name: 1 });
  return { ...r, items: r.items.map((d) => toPublic(d as never)) };
};

export const getPublic = async (id: string) => {
  const d = await DoctorModel.findOne({ _id: id, ...visible }).lean();
  if (!d) throw ApiError.notFound('ডাক্তারের তথ্য পাওয়া যায়নি');
  return toPublic(withId(d) as never);
};

export const stats = async () => {
  const [total, sittingToday, specialties] = await Promise.all([
    DoctorModel.countDocuments(visible),
    DoctorModel.countDocuments({ ...visible, 'chambers.days': dhakaWeekday() }),
    DoctorModel.aggregate<{ _id: string; count: number }>([{ $match: visible }, { $group: { _id: '$specialty', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }]),
  ]);
  return { total, sittingToday, specialties: specialties.map((s) => ({ name: s._id, count: s.count })) };
};

export const submitDoctor = (body: { name: string; specialty: string; degrees: string[]; phone: string; chambers: { hospital: string }[] }, userId?: string) =>
  submissionService.submit({ kind: 'doctor', title: body.name, summary: `${body.specialty} · ${body.chambers.length}টি চেম্বার`.replace(/\d/g, (x) => '০১২৩৪৫৬৭৮৯'[Number(x)]), data: body, submitter: { name: body.name, phone: body.phone, userId } });

submissionService.registerPublisher('doctor', async (data, _sub, session) => {
  const doc = { name: data.name, specialty: data.specialty, degrees: data.degrees ?? [], phone: data.phone ?? '', chambers: data.chambers ?? [], about: data.about ?? '', verified: true } as Partial<Doctor>;
  const [d] = await DoctorModel.create([doc], { session });
  return String(d._id);
});

export const admin = contentService({ model: DoctorModel, noun: 'ডাক্তারের তথ্য', label: (d) => String(d.name), searchFields: SEARCH, sortable: ['name', 'specialty', 'updatedAt'], defaultSort: { updatedAt: -1 }, filter: (q) => (q.specialty ? { specialty: q.specialty } : {}) });

export const searchPublic = (q: string, limit: number) => DoctorModel.find({ ...visible, ...searchFilter(q, ['name', 'specialty']) }).limit(limit).lean();
export const searchAdmin = (q: string, limit: number) => DoctorModel.find({ deletedAt: null, ...searchFilter(q, ['name', 'specialty', 'phone']) }).limit(limit).lean();
