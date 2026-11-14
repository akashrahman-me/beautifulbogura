import { z } from 'zod';
import { objectId } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

export const listAuditSchema = z.object({
  query: listQuery(100).extend({
    actor: objectId.optional(),
    action: z.string().max(40).optional(),
    type: z.string().max(40).optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
  }),
});
export type ListAuditQuery = z.infer<typeof listAuditSchema>['query'];
