import { z } from 'zod';
import { VIDEO_CATEGORIES } from '@/config/catalog';
import { listQuery } from '@/utils/pagination';

export const listSchema = z.object({ query: listQuery(50, 12).extend({ category: z.enum(VIDEO_CATEGORIES).optional() }) });
export const adminBody = z.object({
  title: z.string().trim().min(3).max(200),
  youtubeId: z.string().regex(/^[\w-]{11}$/, 'ইউটিউব ভিডিও আইডি ১১ অক্ষরের'),
  thumbnail: z.string().regex(/^https:\/\/i\.ytimg\.com\/vi\/[\w-]{11}\/\w+\.jpg$/).nullable().default(null),
  category: z.enum(VIDEO_CATEGORIES),
  duration: z.number().int().min(1).max(36000),
  published: z.boolean().default(true),
});
export const adminFilters = z.object({ category: z.enum(VIDEO_CATEGORIES).optional() });
