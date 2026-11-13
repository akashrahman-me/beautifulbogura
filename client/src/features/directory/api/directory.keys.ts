import type { DirectoryParams } from '../schemas/directory.schema';

export const directoryKeys = {
  all: ['directory'] as const,
  lists: () => [...directoryKeys.all, 'list'] as const,
  list: (params: DirectoryParams) => [...directoryKeys.lists(), params] as const,
};
