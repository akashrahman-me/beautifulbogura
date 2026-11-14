import { z } from 'zod';
import { SUBMISSION_KINDS } from '@/config/catalog';
import { idParams, objectId, reasonBody } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

export const listSubmissionsSchema = z.object({
  query: listQuery(100).extend({ kind: z.enum(SUBMISSION_KINDS).optional(), status: z.enum(['pending', 'approved', 'rejected']).optional() }),
});
export const submissionIdSchema = idParams;
/** Approve as sent, or with edited plain fields (strings / numbers only — lists are edited after publishing). */
export const approveSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ data: z.record(z.string(), z.union([z.string().max(2000), z.number()])).optional() }),
});
export const rejectSchema = z.object({ params: z.object({ id: objectId }), body: reasonBody });
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsSchema>['query'];
