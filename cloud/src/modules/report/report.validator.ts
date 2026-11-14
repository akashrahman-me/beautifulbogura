import { z } from 'zod';
import { POST_KIND_KEYS, type PostKind } from '@/config/catalog';
import { idParams, objectId, reasonBody } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

export const listReportsSchema = z.object({
  query: listQuery(100).extend({ status: z.enum(['open', 'dismissed', 'resolved']).optional(), kind: z.enum(POST_KIND_KEYS as [PostKind, ...PostKind[]]).optional() }),
});
export const reportIdSchema = idParams;
export const dismissSchema = z.object({ params: z.object({ id: objectId }), body: z.object({ reason: z.string().trim().max(300).optional() }) });
export const resolveSchema = z.object({ params: z.object({ id: objectId }), body: reasonBody.extend({ ban: z.boolean().default(false) }) });
