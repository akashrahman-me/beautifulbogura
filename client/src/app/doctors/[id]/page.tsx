import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DoctorDetail, DoctorDetailSkeleton } from '@/features/doctor';

export const metadata: Metadata = { title: 'ডাক্তারের তথ্য' };

// The id is only known at request time, so it is read inside the Suspense boundary
// and the rest of the page (header, footer, skeleton) still prerenders as a static shell.
async function Detail({ params }: { params: PageProps<'/doctors/[id]'>['params'] }) {
  const { id } = await params;
  return <DoctorDetail id={id} />;
}

export default function Page({ params }: PageProps<'/doctors/[id]'>) {
  return (
    <Suspense fallback={<DoctorDetailSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}
