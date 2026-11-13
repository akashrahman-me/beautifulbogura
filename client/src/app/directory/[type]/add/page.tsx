import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AddEntryForm, DIRECTORY_TYPES } from '@/features/directory';

export const metadata: Metadata = { title: 'তথ্য যুক্ত করুন' };

export function generateStaticParams() {
  return Object.entries(DIRECTORY_TYPES)
    .filter(([, c]) => c.addable)
    .map(([type]) => ({ type }));
}

export default async function AddEntryPage({ params }: PageProps<'/directory/[type]/add'>) {
  const { type } = await params;
  if (!DIRECTORY_TYPES[type]?.addable) notFound();
  return <AddEntryForm type={type} />;
}
