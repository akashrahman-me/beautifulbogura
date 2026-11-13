import type { Metadata } from 'next';
import { NotablePage } from '@/features/people';

export const metadata: Metadata = { title: 'বিশিষ্ট ব্যক্তি' };

export default function Page() {
  return <NotablePage />;
}
