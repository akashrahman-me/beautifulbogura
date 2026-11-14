import { z } from 'zod';
import { NOTABLE_FIELDS } from '@/config/catalog';
import { idParams, imageUrl } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

export const listSchema = z.object({ query: listQuery(50, 12).extend({ field: z.enum(NOTABLE_FIELDS).optional() }) });
export const idSchema = idParams;
export const adminBody = z.object({
  name: z.string().trim().min(3).max(120),
  title: z.string().trim().min(3).max(160),
  field: z.enum(NOTABLE_FIELDS),
  born: z.string().trim().max(20).nullable().default(null),
  died: z.string().trim().max(20).nullable().default(null),
  photo: imageUrl.nullable().default(null),
  excerpt: z.string().trim().min(20).max(240),
  body: z.string().trim().min(100).max(50000),
  published: z.boolean().default(false),
});
export const adminFilters = z.object({ field: z.enum(NOTABLE_FIELDS).optional() });
