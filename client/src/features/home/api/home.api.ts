import { api } from '@/lib/api-client';

export const homeApi = {
  /** Service slugs ordered by all-time views. */
  popular: (signal?: AbortSignal) => api.get<string[]>('/services/popular', undefined, signal),
};
