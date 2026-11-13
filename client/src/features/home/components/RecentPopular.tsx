'use client';

import { useState } from 'react';
import { serviceBySlug, type Service } from '@/config/services';
import { useLocalStore } from '@/stores/local.store';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorState } from '@/components/shared/States';
import { usePopularServices } from '../hooks/usePopularServices';
import { ServiceTiles } from './ServiceGrid';

const toServices = (slugs: string[]) => slugs.map(serviceBySlug).filter(Boolean).slice(0, 8) as Service[];

/** “Recently viewed” (this device) and “Popular · all time” (from the API). */
export function RecentPopular() {
  const recent = useLocalStore((s) => s.recent);
  const [tab, setTab] = useState<'recent' | 'popular'>('popular');
  const popular = usePopularServices();

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        label="সেবা"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'popular', label: 'জনপ্রিয় · সব সময়', icon: 'star' },
          { value: 'recent', label: 'সাম্প্রতিক দেখা', icon: 'clock' },
        ]}
      />
      {tab === 'recent' ? (
        recent.length ? (
          <ServiceTiles services={toServices(recent)} />
        ) : (
          <p className="text-body-sm text-ink-muted">আপনি যে সেবাগুলো দেখবেন, সেগুলো এখানে থাকবে — এই ডিভাইসেই, আর কোথাও নয়।</p>
        )
      ) : popular.isPending ? (
        <Skeleton uniqueKey="popular-tiles" viewBox="0 0 360 90" height={90}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={i * 92 + 16} y="4" rx="12" width="56" height="56" />
              <rect x={i * 92 + 10} y="70" rx="4" width="68" height="12" />
            </g>
          ))}
        </Skeleton>
      ) : popular.isError ? (
        <ErrorState error={popular.error} onRetry={popular.refetch} />
      ) : (
        <ServiceTiles services={toServices(popular.data)} />
      )}
    </div>
  );
}
