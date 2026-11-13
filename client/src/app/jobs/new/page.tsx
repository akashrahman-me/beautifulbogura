import type { Metadata } from 'next';
import { JobForm } from '@/features/job';

export const metadata: Metadata = { title: 'চাকরির বিজ্ঞাপন দিন' };

export default function NewJobPage() {
  return <JobForm />;
}
