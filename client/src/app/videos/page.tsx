import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { VideoGallery } from '@/features/video';

export const metadata: Metadata = { title: 'ভিডিও' };

export default function Page() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} keyPrefix="video-route" /></div>}>
      <VideoGallery />
    </Suspense>
  );
}
