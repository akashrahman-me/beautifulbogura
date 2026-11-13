import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { voterApi, voterKeys } from '../api/voter.api';
import { hasLookupFilter, type VoterLookupParams } from '../schemas/voter.schema';

export const useVoterLookup = (params: VoterLookupParams) =>
  useInfiniteQuery({
    queryKey: voterKeys.list(params),
    queryFn: ({ pageParam, signal }) => voterApi.lookup({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    placeholderData: keepPreviousData,
    enabled: hasLookupFilter(params),
  });
