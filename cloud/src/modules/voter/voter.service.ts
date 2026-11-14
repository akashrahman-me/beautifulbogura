import { GENDERS_VOTER } from '@/config/catalog';
import { ApiError } from '@/errors/ApiError';
import * as audit from '@/modules/audit/audit.service';
import { pageMeta, searchFilter } from '@/utils/pagination';
import { omit, withId, withIds } from '@/utils/serialize';
import { parseCsv } from './voter.csv';
import { VoterImportModel, VoterModel } from './voter.model';
import { CSV_COLUMNS } from './voter.validator';

const PRIVATE = ['createdAt', 'updatedAt'] as const;

const find = async (filter: Record<string, unknown>, q: { page: number; limit: number }) => {
  const [docs, total] = await Promise.all([VoterModel.find(filter).sort({ name: 1, _id: 1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(), VoterModel.countDocuments(filter)]);
  return { items: withIds(docs).map((v) => omit(v, PRIVATE)), meta: pageMeta(q.page, q.limit, total) };
};

export const lookup = (q: { page: number; limit: number; search?: string; union?: string; dob?: string; birthYear?: string }) =>
  find(
    {
      ...(q.union && { union: q.union }),
      ...(q.dob && { dob: q.dob }),
      ...(q.birthYear && !q.dob && { dob: { $regex: `^${q.birthYear}-` } }),
      ...((q.search?.length ?? 0) >= 3 && searchFilter(q.search, ['name', 'voterNo'])),
    },
    q,
  );

/** Staff search — every one is written to the audit log with the term. */
export const adminSearch = async (q: { page: number; limit: number; search: string; union?: string }, actor: audit.Actor) => {
  await audit.record(actor, { action: 'voters.search', type: 'voters', id: 'search', label: `“${q.search}”${q.union ? ` · ${q.union}` : ''}` });
  return find({ ...(q.union && { union: q.union }), ...searchFilter(q.search, ['name', 'voterNo', 'fatherName']) }, q);
};

export const stats = async () => {
  const rows = await VoterModel.aggregate<{ _id: { union: string; gender: string }; n: number }>([{ $group: { _id: { union: '$union', gender: '$gender' }, n: { $sum: 1 } } }]);
  const byUnion = new Map<string, { union: string; total: number; male: number; female: number; third: number }>();
  for (const r of rows) {
    const u = byUnion.get(r._id.union) ?? { union: r._id.union, total: 0, male: 0, female: 0, third: 0 };
    u.total += r.n;
    u[r._id.gender as 'male' | 'female' | 'third'] += r.n;
    byUnion.set(r._id.union, u);
  }
  const list = [...byUnion.values()].sort((a, b) => a.union.localeCompare(b.union, 'bn'));
  const last = await VoterImportModel.findOne().sort({ at: -1 }).lean();
  return { total: list.reduce((a, u) => a + u.total, 0), byUnion: list, lastImport: last ? withId(last) : null };
};

export const listImports = async () => withIds(await VoterImportModel.find().sort({ at: -1 }).limit(50).lean());

/**
 * Import a roll export. Columns may come in any order; `voterNo` is the key, so re-importing updates.
 * Bad rows are skipped and reported (the first 20), the rest are written in batches.
 */
export const importCsv = async (file: { originalname: string; buffer: Buffer }, actor: audit.Actor) => {
  const rows = parseCsv(file.buffer.toString('utf8').replace(/^\uFEFF/, ''));
  const head = (rows.shift() ?? []).map((h) => h.trim());
  const missing = CSV_COLUMNS.filter((c) => !head.includes(c));
  if (missing.length) throw ApiError.badRequest(`এই কলামগুলো নেই: ${missing.join(', ')}`, 'BAD_CSV');
  const at = (r: string[], c: string) => (r[head.indexOf(c)] ?? '').trim();
  const errors: { row: number; message: string }[] = [];
  const ops: Parameters<typeof VoterModel.bulkWrite>[0] = [];
  rows.forEach((r, i) => {
    const line = i + 2;
    const v = Object.fromEntries(CSV_COLUMNS.map((c) => [c, at(r, c)]));
    if (!v.voterNo) return errors.push({ row: line, message: 'ভোটার নম্বর ফাঁকা' });
    if (!v.name) return errors.push({ row: line, message: 'নাম ফাঁকা' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.dob) || Number.isNaN(Date.parse(v.dob))) return errors.push({ row: line, message: 'জন্ম তারিখ বোঝা যায়নি (yyyy-mm-dd)' });
    if (!(GENDERS_VOTER as readonly string[]).includes(v.gender)) return errors.push({ row: line, message: 'লিঙ্গ male / female / third হতে হবে' });
    if (!v.union) return errors.push({ row: line, message: 'ইউনিয়ন ফাঁকা' });
    ops.push({ updateOne: { filter: { voterNo: v.voterNo }, update: { $set: v }, upsert: true } });
  });
  let imported = 0;
  let updated = 0;
  for (let i = 0; i < ops.length; i += 1000) {
    const r = await VoterModel.bulkWrite(ops.slice(i, i + 1000), { ordered: false });
    imported += r.upsertedCount;
    updated += r.matchedCount;
  }
  const report = await VoterImportModel.create({ by: actor.name, file: file.originalname, imported, updated, skipped: errors.length, errors: errors.slice(0, 20) });
  await audit.record(actor, { action: 'voters.import', type: 'voters', id: String(report._id), label: file.originalname });
  return withId(report.toObject());
};
