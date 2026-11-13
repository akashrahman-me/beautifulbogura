import type { Metadata } from 'next';
import { RentalForm } from '@/features/rental';

export const metadata: Metadata = { title: 'বাসার বিজ্ঞাপন দিন' };

export default function Page() {
  return <RentalForm />;
}
