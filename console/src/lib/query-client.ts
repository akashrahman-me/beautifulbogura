import { QueryClient, isServer } from '@tanstack/react-query';
import { ApiError } from './api-client';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // Moderation data moves fast: fresh for 30 s
        gcTime: 10 * 60 * 1000, // Unused cache kept for 10 min
        refetchOnWindowFocus: true, // Coming back to the tab shows the current queue
        retry: (count, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false; // 4xx will not fix itself
          return count < 2;
        },
      },
      mutations: { retry: false },
    },
  });

let browserClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (isServer) return makeQueryClient(); // New client per server request
  return (browserClient ??= makeQueryClient()); // One client for the whole browser session
};
