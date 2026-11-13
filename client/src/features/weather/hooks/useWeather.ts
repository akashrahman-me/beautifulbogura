import { useQuery } from '@tanstack/react-query';
import { weatherApi } from '../api/weather.api';
import { weatherKeys } from '../api/weather.keys';

export const useWeather = () =>
  useQuery({
    queryKey: weatherKeys.current(),
    queryFn: ({ signal }) => weatherApi.current(signal),
    staleTime: 15 * 60 * 1000, // readings change slowly
  });
