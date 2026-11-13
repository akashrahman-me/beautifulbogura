'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/States';

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-narrow pt-10">
      <ErrorState error={new Error('পাতাটি দেখাতে সমস্যা হয়েছে।')} onRetry={reset} />
    </div>
  );
}
