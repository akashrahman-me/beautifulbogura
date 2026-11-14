import { z } from 'zod';
import { objectId, optionalUrl } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

export const listNoticesSchema = z.object({ query: listQuery(50, 10).extend({ institution: objectId.optional() }) });
export const adminBody = z.object({
  institutionId: objectId,
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().min(5).max(5000),
  link: optionalUrl,
  pinned: z.boolean().default(false),
});
export const adminFilters = z.object({ institution: objectId.optional() });
