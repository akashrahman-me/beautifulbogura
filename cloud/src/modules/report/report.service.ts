import { createHash } from 'node:crypto';
import { env } from '@/config/env';
import { ApiError } from '@/errors/ApiError';
import * as audit from '@/modules/audit/audit.service';
import * as postService from '@/modules/post/post.service';
import * as siteService from '@/modules/site/site.service';
import * as userService from '@/modules/user/user.service';
import { pageMeta, toSort } from '@/utils/pagination';
import { withTransaction } from '@/utils/transaction';
import { ReportCaseModel } from './report.model';

const reporterKey = (ip: string | undefined, userId: string | undefined) => createHash('sha256').update(`${env.JWT_REFRESH_SECRET}|${ip ?? ''}|${userId ?? ''}`).digest('hex').slice(0, 32);

/**
 * A public report. One per person per open case; enough of them hides the post until a moderator decides
 * (settings.moderation.autoHideAfterReports).
 */
export const addReport = async (postId: string, reason: string, note: string | undefined, who: { ip?: string; userId?: string }) => {
  const post = await postService.assertReportable(postId);
  const key = reporterKey(who.ip, who.userId);
  const at = new Date();
  const c = await ReportCaseModel.findOneAndUpdate(
    { post: postId, status: 'open', reporters: { $ne: key } },
    { $inc: { count: 1, [`reasons.${reason}`]: 1 }, $push: { notes: { $each: [{ at, reason, note: note || null }], $slice: -50 }, reporters: { $each: [key], $slice: -500 } }, $set: { lastAt: at }, $setOnInsert: { firstAt: at } },
    { returnDocument: 'after', upsert: true },
  ).catch((e) => {
    // The person already reported this open case (the upsert collides with the existing one).
    if (e?.code === 11000) return null;
    throw e;
  });
  if (!c) return { ok: true as const };
  await postService.bumpReports(postId);
  const { moderation } = await siteService.getSettings();
  if (c.count >= moderation.autoHideAfterReports && post.status === 'active') {
    await postService.hideForReports(postId);
    await ReportCaseModel.updateOne({ _id: c._id }, { $set: { autoHidden: true } });
  }
  return { ok: true as const };
};

type CaseDoc = { _id: unknown; post: unknown; reasons: Map<string, number> | Record<string, number> } & Record<string, unknown>;
const view = async (c: CaseDoc) => {
  const s = await postService.summary(String(c.post));
  const reasons = c.reasons instanceof Map ? Object.fromEntries(c.reasons) : c.reasons;
  const { _id, post: _p, ...rest } = c;
  return { id: String(_id), ...rest, count: Number(c.count), autoHidden: !!c.autoHidden, lastAt: c.lastAt as Date, reasons, ...(s ?? { post: { id: String(c.post), kind: 'job', title: 'মুছে ফেলা পোস্ট', body: '', phone: '', status: 'removed' }, owner: { id: '', name: '', banned: false, priorRemovals: 0 } }) };
};

export const listReports = async (q: { page: number; limit: number; search?: string; sort?: string; status?: string; kind?: string }) => {
  // Kind and search need the post, so filter after the join (cases are few compared to posts).
  const filter = (q.status ? { status: q.status } : {}) as { status?: 'open' | 'dismissed' | 'resolved' };
  const all = await ReportCaseModel.find(filter).sort(toSort(q.sort, ['count', 'lastAt', 'firstAt'], { count: -1, lastAt: -1 })).limit(2000).lean();
  let rows = await Promise.all(all.map((c) => view(c as unknown as CaseDoc)));
  if (q.kind) rows = rows.filter((r) => r.post.kind === q.kind);
  if (q.search) {
    const s = q.search.toLowerCase();
    rows = rows.filter((r) => r.post.title.toLowerCase().includes(s) || r.owner.name.toLowerCase().includes(s));
  }
  return { items: rows.slice((q.page - 1) * q.limit, q.page * q.limit), meta: pageMeta(q.page, q.limit, rows.length) };
};

const openCase = async (id: string) => {
  const c = await ReportCaseModel.findById(id);
  if (!c) throw ApiError.notFound('রিপোর্ট পাওয়া যায়নি');
  if (c.status !== 'open') throw ApiError.conflict('এটি আগেই সিদ্ধান্ত হয়ে গেছে', 'ALREADY_DECIDED');
  return c;
};

export const getReport = async (id: string) => {
  const c = await ReportCaseModel.findById(id).lean();
  if (!c) throw ApiError.notFound('রিপোর্ট পাওয়া যায়নি');
  return view(c as unknown as CaseDoc);
};

/** Keep the post; close the case (and un-hide it if reports had hidden it). */
export const dismiss = async (id: string, reason: string | undefined, actor: audit.Actor) => {
  const c = await openCase(id);
  if (c.autoHidden) await postService.unhide(String(c.post));
  Object.assign(c, { status: 'dismissed', decidedBy: actor.name, decisionReason: reason ?? 'পোস্ট নিয়ম মেনে চলছে', decidedAt: new Date() });
  await c.save();
  const s = await postService.summary(String(c.post));
  await audit.record(actor, { action: 'report.dismiss', type: 'report', id, label: s?.post.title ?? '', reason: reason ?? null });
  return getReport(id);
};

/** Remove the post (and optionally ban its owner) — one transaction. */
export const resolve = async (id: string, body: { reason: string; ban: boolean }, actor: audit.Actor) => {
  await withTransaction(async (session) => {
    const c = await ReportCaseModel.findById(id).session(session);
    if (!c) throw ApiError.notFound('রিপোর্ট পাওয়া যায়নি');
    if (c.status !== 'open') throw ApiError.conflict('এটি আগেই সিদ্ধান্ত হয়ে গেছে', 'ALREADY_DECIDED');
    const postId = String(c.post);
    const s = await postService.summary(postId);
    await postService.moderate(postId, 'remove', { reason: body.reason }, actor, session);
    Object.assign(c, { status: 'resolved', decidedBy: actor.name, decisionReason: body.reason, decidedAt: new Date() });
    await c.save({ session });
    await audit.record(actor, { action: 'report.resolve', type: 'report', id, label: s?.post.title ?? '', reason: body.reason }, session);
    if (body.ban && s?.owner.id) await userService.banUser(s.owner.id, body.reason, actor, session);
  });
  return getReport(id);
};

export const countOpen = () => ReportCaseModel.countDocuments({ status: 'open' });
export const topOpen = async (n: number) => Promise.all((await ReportCaseModel.find({ status: 'open' }).sort({ count: -1, lastAt: -1 }).limit(n).lean()).map((c) => view(c as unknown as CaseDoc)));
