import { createKeys } from '@/lib/community';
import { api } from '@/lib/api-client';
import type { NotableListParams, NotablePerson, NotableSummary } from '../schemas/notable.schema';

export const notableKeys = createKeys<NotableListParams>('notable-persons');

export const notableApi = {
  list: (params: NotableListParams & { page: number }, signal?: AbortSignal) => api.getPaginated<NotableSummary>('/notable-persons', { ...params, limit: 12 }, signal),
  get: (id: string, signal?: AbortSignal) => api.get<NotablePerson>(`/notable-persons/${id}`, undefined, signal),
};
