import type { DoctorListParams } from '../schemas/doctor.schema';

export const doctorKeys = {
  all: ['doctors'] as const,
  stats: () => [...doctorKeys.all, 'stats'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (params: DoctorListParams) => [...doctorKeys.lists(), params] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
};
