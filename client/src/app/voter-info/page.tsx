import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { VoterLookup } from '@/features/voter';

export const metadata: Metadata = { title: 'ভোটার তথ্য', robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={4} keyPrefix="voter-route" /></div>}>
      <VoterLookup />
    </Suspense>
  );
}
