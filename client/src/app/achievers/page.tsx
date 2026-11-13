import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { AchieverList } from '@/features/achiever';

export const metadata: Metadata = { title: 'কৃতি সন্তান' };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} keyPrefix="achiever-route" /></div>}>
      <AchieverList />
    </Suspense>
  );
}
