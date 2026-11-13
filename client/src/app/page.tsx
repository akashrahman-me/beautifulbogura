import { Suspense } from 'react';
import { HomePage } from '@/features/home';

export default function Home() {
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}
