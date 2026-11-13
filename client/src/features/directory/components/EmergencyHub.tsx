'use client';

import { flatPages } from '@/lib/community';
import { SectionHeader, PageHeader } from '@/components/shared/Blocks';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { ErrorState } from '@/components/shared/States';
import { EmergencyCard } from '@/features/home';
import { useDirectory } from '../hooks/useDirectory';
import { DIRECTORY_TYPES } from '../schemas/directory.schema';
import { DirectoryCard } from './DirectoryCard';

function EmergencySection({ type }: { type: string }) {
  const config = DIRECTORY_TYPES[type];
  const { data, isPending, isError, error, refetch } = useDirectory({ type });
  const items = flatPages(data);
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title={config.title} action={{ label: 'সব দেখুন', href: `/directory/${type}` }} />
      {isPending ? (
        <CardGridSkeleton count={2} keyPrefix={`em-${type}`} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.slice(0, 3).map((e) => (
            <DirectoryCard key={e.id} entry={e} config={config} />
          ))}
        </div>
      )}
    </section>
  );
}

export function EmergencyHub() {
  return (
    <div className="container-page flex flex-col gap-8">
      <PageHeader title="জরুরি সেবা" />
      <div className="max-w-xl">
        <EmergencyCard />
      </div>
      {['fire-service', 'police', 'ambulance', 'electricity'].map((t) => (
        <EmergencySection key={t} type={t} />
      ))}
    </div>
  );
}
