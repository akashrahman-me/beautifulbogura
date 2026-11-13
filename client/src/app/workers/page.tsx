import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { WorkerList } from '@/features/worker';

export const metadata: Metadata = { title: 'দক্ষ কারিগর' };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} keyPrefix="workers-route" /></div>}>
      <WorkerList />
    </Suspense>
  );
}
