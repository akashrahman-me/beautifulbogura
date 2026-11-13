import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { achieverApi, achieverKeys } from '../api/achiever.api';
import type { AchieverListParams } from '../schemas/achiever.schema';

export const useAchievers = (params: AchieverListParams) =>
  useInfiniteQuery({
    queryKey: achieverKeys.list(params),
    queryFn: ({ pageParam, signal }) => achieverApi.list({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });
