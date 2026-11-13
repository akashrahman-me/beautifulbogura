import { useQuery } from '@tanstack/react-query';
import { areaApi } from '../api/area.api';
import { areaKeys } from '../api/area.keys';

// Reference content that changes a few times a year.
const LONG = 60 * 60 * 1000;

export const useAreaProfile = () => useQuery({ queryKey: areaKeys.profile(), queryFn: ({ signal }) => areaApi.profile(signal), staleTime: LONG });
export const useUnions = () => useQuery({ queryKey: areaKeys.unions(), queryFn: ({ signal }) => areaApi.unions(signal), staleTime: LONG });
export const useAdministration = () => useQuery({ queryKey: areaKeys.administration(), queryFn: ({ signal }) => areaApi.administration(signal), staleTime: LONG });
export const useMunicipality = () => useQuery({ queryKey: areaKeys.municipality(), queryFn: ({ signal }) => areaApi.municipality(signal), staleTime: LONG });
