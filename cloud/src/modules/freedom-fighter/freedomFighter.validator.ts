import { z } from 'zod';
import { imageUrl } from '@/utils/defineRoutes';
import { listQuery } from '@/utils/pagination';

export const listSchema = z.object({ query: listQuery(50, 24).extend({ union: z.string().max(60).optional() }) });
export const adminBody = z.object({
  name: z.string().trim().min(3).max(120),
  fatherName: z.string().trim().min(3).max(120),
  idNo: z.string().trim().min(1).max(40),
  village: z.string().trim().min(2).max(80),
  union: z.string().trim().min(1).max(60),
  sector: z.string().trim().max(40).nullable().default(null),
  alive: z.boolean().default(true),
  photo: imageUrl.nullable().default(null),
});
export const adminFilters = z.object({ union: z.string().max(60).optional() });
