import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { InstitutionList } from '@/features/institution';

export const metadata: Metadata = { title: 'শিক্ষা প্রতিষ্ঠান' };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} keyPrefix="edu-route" /></div>}>
      <InstitutionList />
    </Suspense>
  );
}
