'use client';

import Link from 'next/link';
import { parseAsString, useQueryState } from 'nuqs';
import { SERVICES } from '@/config/services';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from '@/components/ui/Icon';
import { SearchField } from '@/components/ui/Interactive';
import { PageHeader, SectionHeader } from '@/components/shared/Blocks';
import { CardSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { ServiceTiles } from '@/features/home';
import { useSearch } from '../hooks/useSearch';
import type { SearchHit } from '../schemas/search.schema';

const KIND: Record<SearchHit['kind'], { label: string; icon: IconName }> = {
  doctor: { label: 'ডাক্তার', icon: 'stethoscope' },
  directory: { label: 'তালিকা', icon: 'list' },
  institution: { label: 'শিক্ষা প্রতিষ্ঠান', icon: 'school' },
  job: { label: 'চাকরি', icon: 'briefcase' },
};

/** Searches the service catalogue on the device and everything else through the API. */
export function SearchPage() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const term = useDebounce(q.trim());
  const lower = term.toLowerCase();
  const services = term ? SERVICES.filter((s) => `${s.label} ${s.keywords ?? ''}`.toLowerCase().includes(lower)) : [];
  const hits = useSearch(term);

  return (
    <div className="container-page flex flex-col gap-6">
      <PageHeader title="খুঁজুন" description="ডাক্তার, অফিস, স্কুল, চাকরি — সব এক জায়গা থেকে।" />
      <SearchField size="lg" value={q} onChange={(v) => void setQ(v || null)} autoFocus />

      {term.length < 2 ? (
        <p className="text-body-sm text-ink-muted">অন্তত দুটি অক্ষর লিখুন। যেমন: “শিশু”, “ব্যাংক”, “অ্যাম্বুলেন্স”।</p>
      ) : (
        <>
          {services.length > 0 && (
            <section className="flex flex-col gap-3">
              <SectionHeader title="সেবা" count={services.length} as="h2" />
              <ServiceTiles services={services} />
            </section>
          )}
          <section className="flex flex-col gap-3">
            <SectionHeader title="ফলাফল" count={hits.data?.length} as="h2" />
            {hits.isPending ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <CardSkeleton key={i} index={i} height={90} keyPrefix="search" />
                ))}
              </div>
            ) : hits.isError ? (
              <ErrorState error={hits.error} onRetry={hits.refetch} />
            ) : hits.data.length === 0 && services.length === 0 ? (
              <EmptyState title={`“${term}” এর সাথে মেলে এমন কিছু পাওয়া যায়নি`}>বানান বদলে বা অন্য শব্দ দিয়ে আবার খুঁজুন।</EmptyState>
            ) : (
              <ul className={cn('grid gap-3 sm:grid-cols-2', hits.isPlaceholderData && 'opacity-60')}>
                {hits.data.map((h) => (
                  <li key={`${h.kind}-${h.id}`}>
                    <Link href={h.href} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4 hover:border-line-strong">
                      <span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
                        <Icon name={KIND[h.kind].icon} size={22} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-h4">{h.title}</span>
                        <span className="text-body-sm text-ink-muted">
                          {KIND[h.kind].label} · {h.subtitle}
                        </span>
                      </span>
                      <Icon name="chevron-right" size={18} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
