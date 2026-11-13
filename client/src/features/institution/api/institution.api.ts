import { api } from '@/lib/api-client';
import type { Submission } from '@/types/api';
import type { AddInstitutionInput, ClaimInput, Institution, InstitutionListParams, Notice } from '../schemas/institution.schema';

export const institutionApi = {
  list: (params: InstitutionListParams & { page: number }, signal?: AbortSignal) => api.getPaginated<Institution>('/institutions', { ...params, limit: 20 }, signal),
  getById: (id: string, signal?: AbortSignal) => api.get<Institution>(`/institutions/${id}`, undefined, signal),
  add: ({ website: _hp, site, ...input }: AddInstitutionInput) => api.post<Submission>('/institutions', { ...input, website: site }),
  claim: (id: string, { website: _hp, ...input }: ClaimInput) => api.post<Submission>(`/institutions/${id}/claims`, input),
  notices: (params: { institution?: string; limit?: number }, signal?: AbortSignal) => api.getPaginated<Notice>('/notices', params, signal),
};
