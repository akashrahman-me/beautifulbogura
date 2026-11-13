import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { DIRECTORY_TYPES, DirectoryList } from '@/features/directory';

export function generateStaticParams() {
  return Object.keys(DIRECTORY_TYPES).map((type) => ({ type }));
}

export async function generateMetadata({ params }: PageProps<'/directory/[type]'>): Promise<Metadata> {
  const { type } = await params;
  return { title: DIRECTORY_TYPES[type]?.title ?? 'তালিকা', description: DIRECTORY_TYPES[type]?.description };
}

export default async function DirectoryPage({ params }: PageProps<'/directory/[type]'>) {
  const { type } = await params;
  if (!DIRECTORY_TYPES[type]) notFound();
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} keyPrefix="dir-route" /></div>}>
      <DirectoryList type={type} />
    </Suspense>
  );
}
