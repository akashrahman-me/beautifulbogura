import { api } from '@/lib/api-client';
import type { Submission } from '@/types/api';
import type { AddEntryInput, DirectoryEntry, DirectoryParams } from '../schemas/directory.schema';

export const directoryApi = {
  list: ({ type, ...params }: DirectoryParams & { page: number }, signal?: AbortSignal) =>
    api.getPaginated<DirectoryEntry>(`/directory/${type}`, { ...params, limit: 20 }, signal),
  add: (type: string, input: AddEntryInput) => api.post<Submission>(`/directory/${type}`, input),
  rate: (type: string, id: string, stars: number) => api.post<DirectoryEntry>(`/directory/${type}/${id}/rate`, { stars }),
};
