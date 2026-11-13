import { createKeys } from '@/lib/community';
import { api } from '@/lib/api-client';
import type { FreedomFighter, FreedomFighterListParams } from '../schemas/freedom-fighter.schema';

export const freedomFighterKeys = createKeys<FreedomFighterListParams>('freedom-fighters');

export const freedomFighterApi = {
  list: (params: FreedomFighterListParams & { page: number }, signal?: AbortSignal) => api.getPaginated<FreedomFighter>('/freedom-fighters', { ...params, limit: 24 }, signal),
};
