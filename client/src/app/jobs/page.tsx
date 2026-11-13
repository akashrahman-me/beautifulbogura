import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { JobList } from '@/features/job';

export const metadata: Metadata = { title: 'চাকরির খবর', description: 'বগুড়ার স্থানীয় চাকরির বিজ্ঞাপন।' };

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} height={250} keyPrefix="job-route" /></div>}>
      <JobList />
    </Suspense>
  );
}
