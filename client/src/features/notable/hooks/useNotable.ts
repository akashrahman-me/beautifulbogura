import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { notableApi, notableKeys } from '../api/notable.api';
import type { NotableListParams } from '../schemas/notable.schema';

export const useNotablePersons = (params: NotableListParams) =>
  useInfiniteQuery({
    queryKey: notableKeys.list(params),
    queryFn: ({ pageParam, signal }) => notableApi.list({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });

export const useNotablePerson = (id: string) =>
  useQuery({ queryKey: notableKeys.detail(id), queryFn: ({ signal }) => notableApi.get(id, signal), enabled: Boolean(id) });
