import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { directoryApi } from '../api/directory.api';
import { directoryKeys } from '../api/directory.keys';
import type { AddEntryInput, DirectoryParams } from '../schemas/directory.schema';

export const useDirectory = (params: DirectoryParams) =>
  useInfiniteQuery({
    queryKey: directoryKeys.list(params),
    queryFn: ({ pageParam, signal }) => directoryApi.list({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000, // directories change rarely
  });

export const useAddDirectoryEntry = (type: string) =>
  useMutation({
    mutationFn: (input: AddEntryInput) => directoryApi.add(type, input),
    onSuccess: () => toast.success('ধন্যবাদ! অ্যাডমিন যাচাইয়ের পর তথ্যটি প্রকাশিত হবে।'),
  });

export const useRateEntry = (type: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stars }: { id: string; stars: number }) => directoryApi.rate(type, id, stars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: directoryKeys.lists() });
      toast.success('রেটিং দেওয়ার জন্য ধন্যবাদ');
    },
  });
};
