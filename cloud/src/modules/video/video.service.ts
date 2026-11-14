import { contentService, publicList } from '@/utils/content';
import { searchFilter } from '@/utils/pagination';
import { omit } from '@/utils/serialize';
import { VideoModel } from './video.model';

export const listPublic = async (q: { page: number; limit: number; search?: string; category?: string }) => {
  const r = await publicList(VideoModel, { deletedAt: null, published: true, ...(q.category && { category: q.category }), ...searchFilter(q.search, ['title']) }, q, { publishedAt: -1 });
  return { ...r, items: r.items.map((x) => omit(x, ['deletedAt', 'createdAt', 'updatedAt', 'published'] as const)) };
};
export const admin = contentService({ model: VideoModel, noun: 'ভিডিও', label: (d) => String(d.title), searchFields: ['title'], sortable: ['publishedAt', 'title'], defaultSort: { publishedAt: -1 }, filter: (q) => (q.category ? { category: q.category } : {}) });
