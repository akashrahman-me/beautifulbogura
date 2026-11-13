import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/shared/Blocks';
import { ServiceGrid } from '@/features/home';

export const metadata: Metadata = { title: 'সব সেবা' };

export default function ServicesPage() {
  return (
    <div className="container-page flex flex-col gap-4">
      <PageHeader title="সব সেবা" />
      <Suspense>
        <ServiceGrid />
      </Suspense>
    </div>
  );
}
