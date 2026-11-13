import { createKeys } from '@/lib/community';
import { api } from '@/lib/api-client';
import type { Achiever, AchieverListParams } from '../schemas/achiever.schema';

export const achieverKeys = createKeys<AchieverListParams>('achievers');

export const achieverApi = {
  list: (params: AchieverListParams & { page: number }, signal?: AbortSignal) => api.getPaginated<Achiever>('/achievers', { ...params, limit: 24 }, signal),
};
