import { api } from '@/lib/api-client';
import type { RegisterWorkerInput, Worker, WorkerListParams } from '../schemas/worker.schema';

export const workerApi = {
  list: (params: WorkerListParams & { page: number }, signal?: AbortSignal) => api.getPaginated<Worker>('/workers', { ...params, limit: 20 }, signal),
  register: ({ website: _hp, ...input }: RegisterWorkerInput) => api.post<Worker>('/workers', input),
};
