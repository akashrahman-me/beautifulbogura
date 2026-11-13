import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { MatrimonyList } from '@/features/matrimony';

export const metadata: Metadata = { title: 'পাত্র-পাত্রী' };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={4} keyPrefix="matrimony-route" /></div>}>
      <MatrimonyList />
    </Suspense>
  );
}
