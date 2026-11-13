import type { Metadata } from 'next';
import { Suspense } from 'react';
import { JobDetail, JobDetailSkeleton } from '@/features/job';

export const metadata: Metadata = { title: 'চাকরির বিস্তারিত' };

// The id is only known at request time, so it is read inside the Suspense boundary
// and the rest of the page (header, footer, skeleton) still prerenders as a static shell.
async function Detail({ params }: { params: PageProps<'/jobs/[id]'>['params'] }) {
  const { id } = await params;
  return <JobDetail id={id} />;
}

export default function Page({ params }: PageProps<'/jobs/[id]'>) {
  return (
    <Suspense fallback={<JobDetailSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}
