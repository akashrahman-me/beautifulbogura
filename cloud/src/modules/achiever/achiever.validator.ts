import { z } from 'zod';
import { CADRES } from '@/config/catalog';
import { imageUrl } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

export const listSchema = z.object({ query: listQuery(50, 24).extend({ cadre: z.enum(CADRES).optional() }) });
export const adminBody = z.object({
  name: z.string().trim().min(3).max(120),
  cadre: z.enum(CADRES),
  batch: z.string().trim().max(20).nullable().default(null),
  post: z.string().trim().min(2).max(120),
  workplace: z.string().trim().min(2).max(200),
  village: z.string().trim().max(80).default(''),
  union: z.string().trim().max(60).default(''),
  photo: imageUrl.nullable().default(null),
});
export const adminFilters = z.object({ cadre: z.enum(CADRES).optional() });
