import { api } from '@/lib/api-client';
import type { Administration, AreaProfile, Municipality, Union } from '../schemas/area.schema';

export const areaApi = {
  profile: (signal?: AbortSignal) => api.get<AreaProfile>('/area/profile', undefined, signal),
  unions: (signal?: AbortSignal) => api.get<Union[]>('/area/unions', undefined, signal),
  administration: (signal?: AbortSignal) => api.get<Administration>('/area/administration', undefined, signal),
  municipality: (signal?: AbortSignal) => api.get<Municipality>('/area/municipality', undefined, signal),
};
