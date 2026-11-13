import { api } from '@/lib/api-client';
import type { SearchHit } from '../schemas/search.schema';

export const searchApi = {
  search: (q: string, signal?: AbortSignal) => api.get<SearchHit[]>('/search', { q }, signal),
};
