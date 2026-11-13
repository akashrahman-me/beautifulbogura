import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { NotableList } from '@/features/notable';

export const metadata: Metadata = { title: 'বিশিষ্ট ব্যক্তি' };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} keyPrefix="notable-route" /></div>}>
      <NotableList />
    </Suspense>
  );
}
