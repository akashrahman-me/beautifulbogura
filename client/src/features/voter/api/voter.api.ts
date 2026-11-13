import { createKeys } from '@/lib/community';
import { api } from '@/lib/api-client';
import type { Voter, VoterLookupParams } from '../schemas/voter.schema';

export const voterKeys = createKeys<VoterLookupParams>('voters');

export const voterApi = {
  lookup: (params: VoterLookupParams & { page: number }, signal?: AbortSignal) => api.getPaginated<Voter>('/voters', { ...params, limit: 20 }, signal),
};
