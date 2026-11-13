import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NotableDetail, NotableDetailSkeleton } from '@/features/notable';

export const metadata: Metadata = { title: 'বিশিষ্ট ব্যক্তি' };

// The id is read inside the Suspense boundary so the shell still prerenders.
async function Detail({ params }: { params: PageProps<'/notable-persons/[id]'>['params'] }) {
  const { id } = await params;
  return <NotableDetail id={id} />;
}

export default function Page({ params }: PageProps<'/notable-persons/[id]'>) {
  return (
    <Suspense fallback={<NotableDetailSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}
