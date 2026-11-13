import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchPage } from '@/features/search';

export const metadata: Metadata = { title: 'খুঁজুন' };

export default function Page() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
