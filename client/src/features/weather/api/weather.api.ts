import { api } from '@/lib/api-client';
import type { Weather } from '../schemas/weather.schema';

export const weatherApi = {
  current: (signal?: AbortSignal) => api.get<Weather>('/weather', undefined, signal),
};
