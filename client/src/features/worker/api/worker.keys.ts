import type { WorkerListParams } from '../schemas/worker.schema';

export const workerKeys = {
  all: ['workers'] as const,
  lists: () => [...workerKeys.all, 'list'] as const,
  list: (params: WorkerListParams) => [...workerKeys.lists(), params] as const,
};
