import type { Metadata } from 'next';
import { TuitionForm } from '@/features/tuition';

export const metadata: Metadata = { title: 'টিউশনের বিজ্ঞাপন দিন' };

export default function Page() {
  return <TuitionForm />;
}
