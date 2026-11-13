import type { Metadata } from 'next';
import { VideosPage } from '@/features/videos';

export const metadata: Metadata = { title: 'ভিডিও' };

export default function Page() {
  return <VideosPage />;
}
