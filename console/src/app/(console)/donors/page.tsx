import type { Metadata } from 'next';
import { DonorsPage } from '@/features/donors';

export const metadata: Metadata = { title: 'রক্তদাতা' };

export default function Page() {
  return <DonorsPage />;
}
