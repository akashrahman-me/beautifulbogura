import type { InstitutionListParams } from '../schemas/institution.schema';

export const institutionKeys = {
  all: ['institutions'] as const,
  lists: () => [...institutionKeys.all, 'list'] as const,
  list: (params: InstitutionListParams) => [...institutionKeys.lists(), params] as const,
  detail: (id: string) => [...institutionKeys.all, 'detail', id] as const,
  notices: (institution?: string) => [...institutionKeys.all, 'notices', institution ?? 'all'] as const,
};
