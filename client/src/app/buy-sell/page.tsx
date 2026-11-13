import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { ListingList } from '@/features/listing';

export const metadata: Metadata = { title: 'কেনাবেচা' };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} keyPrefix="buy-sell-route" /></div>}>
      <ListingList />
    </Suspense>
  );
}
