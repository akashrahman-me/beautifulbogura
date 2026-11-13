'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import { getQueryClient } from '@/lib/query-client';
import { AuthBootstrap } from '@/features/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
      <AuthBootstrap />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: 'var(--ink)', color: 'var(--canvas)', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)' },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
