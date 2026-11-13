import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { VehicleList } from '@/features/vehicle';

export const metadata: Metadata = { title: 'গাড়ি ভাড়া' };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} keyPrefix="car-rent-route" /></div>}>
      <VehicleList />
    </Suspense>
  );
}
