/**
 * Admin CRUD for a content collection (directory, doctors, donors, people lists, videos…), so each module
 * only declares its model, validators and public queries.
 *
 *   GET    /admin/x?page&limit&search&sort&…filters   list (excludes soft-deleted)
 *   GET    /admin/x/:id                               one
 *   POST   /admin/x                                   create            → audit content.create
 *   PATCH  /admin/x/:id                               partial update    → audit content.update (with diff)
 *   DELETE /admin/x/:id   { reason? }                 soft delete       → audit content.delete
 *   POST   /admin/x/:id/restore                       undo delete       → audit content.restore
 */
import type { Request, Response } from 'express';
import type { Model, QueryFilter } from 'mongoose';
import { z, type ZodObject } from 'zod';
import type { Permission } from '@/config/permissions';
import { ApiError } from '@/errors/ApiError';
import * as audit from '@/modules/audit/audit.service';
import { actorOf } from './actor';
import { idParams, objectId, type ModuleRoutes } from './defineRoutes';
import { listQuery, pageMeta, searchFilter, toSort } from './pagination';
import { sendResponse } from './sendResponse';
import { diff, withId } from './serialize';

type Doc = Record<string, unknown> & { _id: unknown };

export interface ContentOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each module passes its own model
  model: Model<any>;
  noun: string;
  label: (d: Doc) => string;
  searchFields: readonly string[];
  sortable: readonly string[];
  defaultSort: Record<string, 1 | -1>;
  /** Module filters from the validated query. */
  filter?: (q: Record<string, unknown>) => QueryFilter<Doc>;
  /** Shape a stored document for the console (defaults to `withId`). */
  toAdmin?: (d: Doc) => Promise<object> | object;
  /** Fill derived fields before saving (e.g. an institution name on a notice). */
  prepare?: (input: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>;
}

export function contentService(o: ContentOptions) {
  const live = { deletedAt: null };
  const view = async (d: Doc) => (o.toAdmin ? o.toAdmin(d) : withId(d)!);
  const find = async (id: string, deleted = false) => {
    const d = (await o.model.findOne({ _id: id, deletedAt: deleted ? { $ne: null } : null }).lean()) as Doc | null;
    if (!d) throw ApiError.notFound(`${o.noun} পাওয়া যায়নি`);
    return d;
  };
  return {
    list: async (q: { page: number; limit: number; search?: string; sort?: string } & Record<string, unknown>) => {
      const filter = { ...live, ...(o.filter?.(q) ?? {}), ...searchFilter(q.search, o.searchFields) };
      const [docs, total] = await Promise.all([
        o.model.find(filter).sort(toSort(q.sort, o.sortable, o.defaultSort)).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
        o.model.countDocuments(filter),
      ]);
      return { items: await Promise.all((docs as Doc[]).map(view)), meta: pageMeta(q.page, q.limit, total) };
    },
    get: async (id: string) => view(await find(id)),
    create: async (input: Record<string, unknown>, actor: audit.Actor) => {
      const data = o.prepare ? await o.prepare(input) : input;
      const created = await o.model.create(data);
      const d = created.toObject() as Doc;
      await audit.record(actor, { action: 'content.create', type: 'content', id: String(d._id), label: o.label(d) });
      return view(d);
    },
    update: async (id: string, input: Record<string, unknown>, actor: audit.Actor) => {
      const before = await find(id);
      const data = o.prepare ? await o.prepare(input) : input;
      const after = (await o.model.findOneAndUpdate({ _id: id, ...live }, { $set: data }, { returnDocument: 'after', runValidators: true }).lean()) as Doc;
      await audit.record(actor, { action: 'content.update', type: 'content', id, label: o.label(after), changes: diff(before, data) });
      return view(after);
    },
    remove: async (id: string, reason: string | undefined, actor: audit.Actor) => {
      const d = await find(id);
      await o.model.updateOne({ _id: id }, { $set: { deletedAt: new Date() } });
      await audit.record(actor, { action: 'content.delete', type: 'content', id, label: o.label(d), reason: reason ?? null });
    },
    restore: async (id: string, actor: audit.Actor) => {
      const d = await find(id, true);
      await o.model.updateOne({ _id: id }, { $set: { deletedAt: null } });
      await audit.record(actor, { action: 'content.restore', type: 'content', id, label: o.label(d) });
      return view({ ...d, deletedAt: null });
    },
  };
}

export type ContentService = ReturnType<typeof contentService>;

/** Controllers for the six admin routes. */
export function contentController(s: ContentService, noun: string) {
  return {
    list: async (req: Request, res: Response) => {
      const { items, meta } = await s.list(req.validated.query);
      sendResponse(res, { message: `${noun} list`, data: items, meta });
    },
    get: async (req: Request, res: Response) => sendResponse(res, { message: noun, data: await s.get(req.validated.params.id) }),
    create: async (req: Request, res: Response) => sendResponse(res, { statusCode: 201, message: `${noun} created`, data: await s.create(req.validated.body, await actorOf(req)) }),
    update: async (req: Request, res: Response) => sendResponse(res, { message: `${noun} updated`, data: await s.update(req.validated.params.id, req.validated.body, await actorOf(req)) }),
    remove: async (req: Request, res: Response) => {
      await s.remove(req.validated.params.id, req.validated.body?.reason, await actorOf(req));
      res.status(204).send();
    },
    restore: async (req: Request, res: Response) => sendResponse(res, { message: `${noun} restored`, data: await s.restore(req.validated.params.id, await actorOf(req)) }),
  };
}

/**
 * Register the six admin routes. `body` is the create schema's body object; updates accept any subset of it.
 * `filters` extends the list query.
 */
export function registerContentRoutes(r: ModuleRoutes, c: ReturnType<typeof contentController>, opts: { permission: Permission; noun: string; body: ZodObject; filters?: ZodObject; maxLimit?: number }) {
  const { permission, noun } = opts;
  const list = z.object({ query: listQuery(opts.maxLimit ?? 500).extend(opts.filters?.shape ?? {}) });
  r.get('/', { summary: `List ${noun}`, permission, schema: list }, c.list);
  r.get('/:id', { summary: `Get one ${noun}`, permission, schema: idParams }, c.get);
  r.post('/', { summary: `Create ${noun}`, permission, schema: z.object({ body: opts.body }), status: 201 }, c.create);
  r.patch('/:id', { summary: `Update ${noun}`, permission, schema: z.object({ params: z.object({ id: objectId }), body: opts.body.partial() }) }, c.update);
  r.delete('/:id', { summary: `Delete ${noun} (soft)`, permission, schema: z.object({ params: z.object({ id: objectId }), body: z.object({ reason: z.string().max(300).optional(), note: z.string().max(500).optional() }).optional().default({}) }), status: 204 }, c.remove);
  r.post('/:id/restore', { summary: `Restore a deleted ${noun}`, permission, schema: idParams }, c.restore);
}

/** Paginated public list helper: `filter` must already exclude hidden / deleted / unpublished. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any module model
export const publicList = async (model: Model<any>, filter: QueryFilter<Doc>, q: { page: number; limit: number }, sort: Record<string, 1 | -1>, project?: string) => {
  const [docs, total] = await Promise.all([model.find(filter, project).sort(sort).skip((q.page - 1) * q.limit).limit(q.limit).lean(), model.countDocuments(filter)]);
  return { items: (docs as Doc[]).map((d) => withId(d)!), meta: pageMeta(q.page, q.limit, total) };
};
