import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/search.api';
import { searchKeys } from '../api/search.keys';

export const useSearch = (q: string) =>
  useQuery({
    queryKey: searchKeys.query(q),
    queryFn: ({ signal }) => searchApi.search(q, signal),
    enabled: q.length >= 2,
    placeholderData: keepPreviousData,
  });
