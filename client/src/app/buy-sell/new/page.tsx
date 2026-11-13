import type { Metadata } from 'next';
import { ListingForm } from '@/features/listing';

export const metadata: Metadata = { title: 'বিক্রির বিজ্ঞাপন দিন' };

export default function Page() {
  return <ListingForm />;
}
