import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { FreedomFighterList } from '@/features/freedom-fighter';

export const metadata: Metadata = { title: 'বীর মুক্তিযোদ্ধা' };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} keyPrefix="ff-route" /></div>}>
      <FreedomFighterList />
    </Suspense>
  );
}
