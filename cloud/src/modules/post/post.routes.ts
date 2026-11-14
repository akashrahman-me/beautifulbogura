import { POST_KINDS, POST_KIND_KEYS } from '@/config/catalog';
import { writeLimiter } from '@/middlewares/rateLimiter';
import { defineRoutes, idParams } from '@/utils/defineRoutes';
import * as c from './post.controller';
import * as v from './post.validator';

/** /jobs, /listings, /rentals, /vehicles, /tuitions, /matrimony — the same contract for each kind. */
export const postRoutes = POST_KIND_KEYS.map((kind) => {
  const r = defineRoutes(POST_KINDS[kind].base, `Community · ${kind}`);
  const k = c.forKind(kind);
  r.get('/', { summary: `Live ${kind} posts, featured first`, schema: v.listSchema(kind) }, k.list);
  r.get('/:id', { summary: `One ${kind} post`, schema: v.postIdSchema }, k.get);
  r.post('/', { summary: `Create (signed in; daily limit; owner = you)`, auth: 'user', schema: v.createSchema(kind), use: [writeLimiter], status: 201 }, k.create);
  r.patch('/:id', { summary: 'Edit your own post (403 NOT_OWNER)', auth: 'user', schema: v.updateSchema(kind) }, k.update);
  r.post('/:id/manage', { summary: 'Delete or mark done — owner only', auth: 'user', schema: v.manageSchema }, k.manage);
  r.post('/:id/report', { summary: 'Report a post (one per person per case)', auth: 'optional', schema: v.reportSchema, use: [writeLimiter] }, k.report);
  return r;
});

export const meRoutes = defineRoutes('/me', 'Account');
meRoutes.get('/posts', { summary: 'Your community posts across all kinds', auth: 'user' }, c.myPosts);

export const adminPostRoutes = defineRoutes('/admin/posts', 'Admin · Posts');
const permission = 'posts.manage';
adminPostRoutes.get('/', { summary: 'All community posts (?kind, ?status, ?featured, ?owner)', permission, schema: v.adminListSchema }, c.adminList);
adminPostRoutes.get('/:id', { summary: 'One post', permission, schema: idParams }, c.adminGet);
adminPostRoutes.post('/:id/feature', { summary: 'Feature on / off', permission, schema: v.toggleSchema }, c.moderate('feature'));
adminPostRoutes.post('/:id/verify', { summary: 'Verified on / off', permission, schema: v.toggleSchema }, c.moderate('verify'));
adminPostRoutes.post('/:id/extend', { summary: 'Extend expiry by days', permission, schema: v.extendSchema }, c.moderate('extend'));
adminPostRoutes.post('/:id/remove', { summary: 'Remove with a reason (shown to the owner)', permission, schema: v.removeSchema }, c.moderate('remove'));
adminPostRoutes.post('/:id/restore', { summary: 'Put a removed post back', permission, schema: idParams }, c.moderate('restore'));
