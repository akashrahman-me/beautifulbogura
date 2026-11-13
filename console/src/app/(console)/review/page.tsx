import type { Metadata } from 'next';
import { ReviewPage } from '@/features/review';

export const metadata: Metadata = { title: 'যাচাই' };

export default function Page() {
  return <ReviewPage />;
}
