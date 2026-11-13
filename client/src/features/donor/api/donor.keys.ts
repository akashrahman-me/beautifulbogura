import type { DonorListParams } from '../schemas/donor.schema';

export const donorKeys = {
  all: ['donors'] as const,
  stats: () => [...donorKeys.all, 'stats'] as const,
  lists: () => [...donorKeys.all, 'list'] as const,
  list: (params: DonorListParams) => [...donorKeys.lists(), params] as const,
};
