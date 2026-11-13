import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { freedomFighterApi, freedomFighterKeys } from '../api/freedom-fighter.api';
import type { FreedomFighterListParams } from '../schemas/freedom-fighter.schema';

export const useFreedomFighters = (params: FreedomFighterListParams) =>
  useInfiniteQuery({
    queryKey: freedomFighterKeys.list(params),
    queryFn: ({ pageParam, signal }) => freedomFighterApi.list({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });
