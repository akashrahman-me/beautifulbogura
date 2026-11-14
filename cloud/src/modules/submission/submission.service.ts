import type { ClientSession, Types } from 'mongoose';
import { ApiError } from '@/errors/ApiError';
import * as audit from '@/modules/audit/audit.service';
import { pageMeta, searchFilter, toSort } from '@/utils/pagination';
import { diff, withId } from '@/utils/serialize';
import { withTransaction } from '@/utils/transaction';
import { SubmissionModel, type Submission } from './submission.model';
import type { ListSubmissionsQuery } from './submission.validator';

type Kind = Submission['kind'];
type Publisher = (data: Record<string, unknown>, sub: { directoryType: string | null; targetId: Types.ObjectId | null; submitterUserId: Types.ObjectId | null }, session: ClientSession) => Promise<string | null>;

/**
 * Each content module registers how an approved submission becomes a published item, so this module never
 * imports them (and they can import it to submit).
 */
const publishers = new Map<Kind, Publisher>();
export const registerPublisher = (kind: Kind, fn: Publisher) => void publishers.set(kind, fn);

export interface SubmitInput {
  kind: Kind;
  title: string;
  summary: string;
  data: Record<string, unknown>;
  submitter: { name: string; phone: string; userId?: string | null };
  directoryType?: string;
  targetId?: string;
}

/** Public forms land here: pending until staff approve. The response tells the site it is under review. */
export const submit = async (input: SubmitInput) => {
  const s = await SubmissionModel.create({ ...input, submitter: { ...input.submitter, userId: input.submitter.userId ?? null }, directoryType: input.directoryType ?? null, targetId: input.targetId ?? null });
  return { id: String(s._id), status: 'pending' as const };
};

const view = async (s: Record<string, unknown> & { _id: unknown; submitter: { phone?: string } }) => ({
  ...withId(s)!,
  // A hint for spam: earlier submissions from the same phone that staff turned down.
  priorRejections: s.submitter?.phone ? await SubmissionModel.countDocuments({ 'submitter.phone': s.submitter.phone, status: 'rejected', _id: { $ne: s._id } }) : 0,
});

export const listSubmissions = async ({ page, limit, search, sort, kind, status }: ListSubmissionsQuery) => {
  const filter = { ...(kind && { kind }), ...(status && { status }), ...searchFilter(search, ['title', 'summary', 'submitter.name', 'submitter.phone']) };
  const [docs, total] = await Promise.all([
    SubmissionModel.find(filter).sort(toSort(sort, ['submittedAt', 'title'], { submittedAt: 1 })).skip((page - 1) * limit).limit(limit).lean(),
    SubmissionModel.countDocuments(filter),
  ]);
  return { items: await Promise.all(docs.map((d) => view(d as never))), meta: pageMeta(page, limit, total) };
};

export const getSubmission = async (id: string) => {
  const s = await SubmissionModel.findById(id).lean();
  if (!s) throw ApiError.notFound('জমা দেওয়া তথ্য পাওয়া যায়নি');
  return view(s as never);
};

const pendingOrThrow = async (id: string, session?: ClientSession) => {
  const s = await SubmissionModel.findById(id).session(session ?? null);
  if (!s) throw ApiError.notFound('জমা দেওয়া তথ্য পাওয়া যায়নি');
  if (s.status !== 'pending') throw ApiError.conflict('এটি আগেই সিদ্ধান্ত হয়ে গেছে', 'ALREADY_DECIDED');
  return s;
};

/** Publish (with optional edits), mark approved and audit — all or nothing. */
export const approve = async (id: string, edits: Record<string, unknown> | undefined, actor: audit.Actor) =>
  withTransaction(async (session) => {
    const s = await pendingOrThrow(id, session);
    const before = s.data as Record<string, unknown>;
    const data = { ...before, ...(edits ?? {}) };
    const publish = publishers.get(s.kind);
    if (!publish) throw new Error(`No publisher for ${s.kind}`);
    const publishedId = await publish(data, { directoryType: s.directoryType ?? null, targetId: s.targetId ?? null, submitterUserId: s.submitter?.userId ?? null }, session);
    Object.assign(s, { status: 'approved', data, decidedAt: new Date(), decidedBy: actor.name, publishedId });
    await s.save({ session });
    await audit.record(actor, { action: 'review.approve', type: 'submission', id, label: s.title, changes: edits ? diff(before, data) : null }, session);
    return view(s.toObject() as never);
  });

export const reject = async (id: string, reason: string, actor: audit.Actor) => {
  const s = await pendingOrThrow(id);
  Object.assign(s, { status: 'rejected', decidedAt: new Date(), decidedBy: actor.name, reason });
  await s.save();
  await audit.record(actor, { action: 'review.reject', type: 'submission', id, label: s.title, reason });
  return view(s.toObject() as never);
};

export const countPending = () => SubmissionModel.countDocuments({ status: 'pending' });
export const oldestPending = (n: number) => SubmissionModel.find({ status: 'pending' }).sort({ submittedAt: 1 }).limit(n).lean();
