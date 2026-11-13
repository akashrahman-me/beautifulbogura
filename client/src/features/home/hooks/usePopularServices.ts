import { useQuery } from '@tanstack/react-query';
import { homeApi } from '../api/home.api';
import { homeKeys } from '../api/home.keys';

export const usePopularServices = () =>
  useQuery({
    queryKey: homeKeys.popular(),
    queryFn: ({ signal }) => homeApi.popular(signal),
    staleTime: 60 * 60 * 1000,
  });
