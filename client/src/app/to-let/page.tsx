import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { RentalList } from '@/features/rental';

export const metadata: Metadata = { title: 'বাসা ভাড়া' };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} keyPrefix="to-let-route" /></div>}>
      <RentalList />
    </Suspense>
  );
}
