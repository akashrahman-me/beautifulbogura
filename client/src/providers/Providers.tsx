'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthBootstrap } from '@/features/auth';
import { getQueryClient } from '@/lib/query-client';
import { useLocalStore } from '@/stores/local.store';

function RehydrateLocal() {
  // localStorage-backed stores hydrate after mount so server and first client render match.
  useEffect(() => {
    void useLocalStore.persist.rehydrate();
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
        <RehydrateLocal />
        <AuthBootstrap />
        <Toaster
          position="bottom-center"
          offset={88}
          toastOptions={{
            style: {
              background: 'var(--ink)',
              color: 'var(--canvas)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
        {/* Devtools button sits above the bottom nav only on desktop. */}
        <div className="hidden lg:block">
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </div>
    </QueryClientProvider>
  );
}
