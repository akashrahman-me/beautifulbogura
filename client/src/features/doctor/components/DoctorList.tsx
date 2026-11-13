'use client';

import { parseAsBoolean, parseAsString, useQueryStates } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';
import { flatPages, totalOf } from '@/lib/community';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FilterBar, LoadMore, PageHeader, StatStrip } from '@/components/shared/Blocks';
import { CardGridSkeleton, StatStripSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useDoctors, useDoctorStats } from '../hooks/useDoctors';
import { DoctorCard } from './DoctorCard';

export function DoctorList() {
  const [{ q, spec, today }, setParams] = useQueryStates({
    q: parseAsString.withDefault(''),
    spec: parseAsString.withDefault(''),
    today: parseAsBoolean.withDefault(false),
  });
  const search = useDebounce(q.trim());
  const stats = useDoctorStats();
  const list = useDoctors({ search: search || undefined, specialty: spec || undefined, today: today || undefined });
  const items = flatPages(list.data);

  const chipValue = today ? 'today' : spec || 'all';
  const chips = [
    { value: 'today', label: 'আজ বসছেন', icon: 'check' as const, count: stats.data?.sittingToday },
    { value: 'all', label: 'সব' },
    ...(stats.data?.specialties ?? []).map((s) => ({ value: s.name, label: s.name, count: s.count })),
  ];
  const filtered = Boolean(q || spec || today);

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader
        eyebrow="স্বাস্থ্য"
        title="ডাক্তারদের তালিকা"
        description="নাম, বিশেষজ্ঞতা, হাসপাতাল বা নম্বর দিয়ে খুঁজুন। সিরিয়ালের জন্য সরাসরি কল করুন।"
        action={
          <Button href="/doctors/new" variant="secondary" iconLeft="plus">
            ডাক্তার যুক্ত করুন
          </Button>
        }
      />

      {stats.isPending ? (
        <StatStripSkeleton cells={3} />
      ) : stats.data ? (
        <StatStrip
          items={[
            { label: 'মোট ডাক্তার', value: stats.data.total, tone: 'brand' },
            { label: 'আজ বসছেন', value: stats.data.sittingToday, tone: 'success' },
            { label: 'বিভাগ', value: stats.data.specialties.length },
          ]}
        />
      ) : null}

      <FilterBar
        query={q}
        onQuery={(v) => void setParams({ q: v || null })}
        placeholder="নাম, বিশেষজ্ঞতা, হাসপাতাল বা নম্বর"
        chips={chips}
        chipValue={chipValue}
        onChip={(v) => void setParams(v === 'today' ? { today: true, spec: null } : v === 'all' ? { today: null, spec: null } : { spec: v, today: null })}
        count={list.isPending ? undefined : totalOf(list.data)}
        countLabel="জন ডাক্তার"
        onClear={filtered ? () => void setParams({ q: null, spec: null, today: null }) : undefined}
      />

      {list.isPending ? (
        <CardGridSkeleton count={6} height={240} keyPrefix="doctor" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="stethoscope" title={today ? 'আজ এই বিভাগে কেউ বসছেন না' : 'কোনো ডাক্তার পাওয়া যায়নি'} action={filtered ? <Button variant="secondary" onClick={() => void setParams({ q: null, spec: null, today: null })}>ফিল্টার মুছুন</Button> : undefined}>
          অন্য বিভাগ বা নাম দিয়ে খুঁজে দেখুন।
        </EmptyState>
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
    </div>
  );
}
