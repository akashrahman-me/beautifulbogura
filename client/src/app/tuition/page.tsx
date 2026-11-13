import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { TuitionList } from '@/features/tuition';

export const metadata: Metadata = { title: 'টিউশন' };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} keyPrefix="tuition-route" /></div>}>
      <TuitionList />
    </Suspense>
  );
}
