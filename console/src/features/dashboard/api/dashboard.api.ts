import { api } from '@/lib/api-client';
import type { Dashboard } from '../schemas/dashboard.schema';

export interface Counts {
  /** Submissions waiting for review. */
  review: number;
  /** Posts with open reports. */
  reports: number;
}

export const dashboardKeys = { counts: ['admin', 'counts'] as const, dashboard: ['admin', 'dashboard'] as const };

export const dashboardApi = {
  counts: (signal?: AbortSignal) => api.get<Counts>('/admin/counts', undefined, signal),
  dashboard: (signal?: AbortSignal) => api.get<Dashboard>('/admin/dashboard', undefined, signal),
};
