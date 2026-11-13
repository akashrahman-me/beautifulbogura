import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InstitutionDetail, InstitutionDetailSkeleton } from '@/features/institution';

export const metadata: Metadata = { title: 'প্রতিষ্ঠানের তথ্য' };

// The id is only known at request time, so it is read inside the Suspense boundary
// and the rest of the page (header, footer, skeleton) still prerenders as a static shell.
async function Detail({ params }: { params: PageProps<'/education/[id]'>['params'] }) {
  const { id } = await params;
  return <InstitutionDetail id={id} />;
}

export default function Page({ params }: PageProps<'/education/[id]'>) {
  return (
    <Suspense fallback={<InstitutionDetailSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}
