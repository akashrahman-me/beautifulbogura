import { useQuery } from '@tanstack/react-query';
import { useSessionStatus } from '@/stores/session.store';
import { dashboardApi, dashboardKeys } from '../api/dashboard.api';

/** Sidebar badges. Polls every minute so a new report shows without a reload. */
export const useCounts = () =>
  useQuery({ queryKey: dashboardKeys.counts, queryFn: ({ signal }) => dashboardApi.counts(signal), refetchInterval: 60_000, enabled: useSessionStatus() === 'signed-in' });

export const useDashboard = () => useQuery({ queryKey: dashboardKeys.dashboard, queryFn: ({ signal }) => dashboardApi.dashboard(signal), refetchInterval: 120_000 });
