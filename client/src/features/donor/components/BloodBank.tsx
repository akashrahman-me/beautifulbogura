'use client';

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';
import { flatPages, totalOf } from '@/lib/community';
import { ADMIN_PHONE } from '@/config/services';
import { bnNumber, cn, telHref } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FilterBar, LoadMore, NoticeBanner, PageHeader, StatStrip } from '@/components/shared/Blocks';
import { CardGridSkeleton, Skeleton, StatStripSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useDonors, useDonorStats } from '../hooks/useDonors';
import { BLOOD_GROUPS, type BloodGroup, type DonorStatus } from '../schemas/donor.schema';
import { DonorCard } from './DonorCard';

const STATUSES = ['ready', 'not-yet', 'unknown'] as const;

function BloodGroupGrid({ value, counts, onChange }: { value: BloodGroup | null; counts: Partial<Record<BloodGroup, number>>; onChange: (g: BloodGroup | null) => void }) {
  return (
    <div className="bb-bgrid" role="radiogroup" aria-label="রক্তের গ্রুপ বেছে নিন">
      {BLOOD_GROUPS.map((g) => {
        const on = value === g;
        return (
          <button key={g} type="button" role="radio" aria-checked={on} className={cn('bb-bgrid-cell', on && 'is-active')} onClick={() => onChange(on ? null : g)}>
            <span className="bb-bgrid-group">{g}</span>
            <span className="bb-bgrid-count">{bnNumber(counts[g] ?? 0)} জন</span>
          </button>
        );
      })}
    </div>
  );
}

export function BloodBank() {
  const [{ q, group, status }, setParams] = useQueryStates({
    q: parseAsString.withDefault(''),
    group: parseAsStringLiteral(BLOOD_GROUPS),
    status: parseAsStringLiteral(STATUSES),
  });
  const search = useDebounce(q.trim());
  const stats = useDonorStats();
  const list = useDonors({ group: group ?? undefined, status: (status as DonorStatus | null) ?? undefined, search: search || undefined });
  const items = flatPages(list.data);
  const filtered = Boolean(q || group || status);
  const clear = () => void setParams({ q: null, group: null, status: null });

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader
        eyebrow="জীবন বাঁচান"
        title="রক্ত ব্যাংক"
        description="শেষ রক্তদানের ১২০ দিন পর আবার রক্ত দেওয়া যায়।"
        action={
          <Button href="/blood-bank/register" variant="emergency" iconLeft="drop">
            রক্তদাতা হোন
          </Button>
        }
      />

      {stats.isPending ? (
        <>
          <StatStripSkeleton cells={4} />
          <Skeleton uniqueKey="bgrid" viewBox="0 0 360 140" height={140}>
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={(i % 4) * 92} y={Math.floor(i / 4) * 72} rx="12" width="84" height="64" />
            ))}
          </Skeleton>
        </>
      ) : stats.data ? (
        <>
          <StatStrip
            items={[
              { label: 'মোট দাতা', value: stats.data.total, tone: 'emergency' },
              { label: 'রক্ত দিতে প্রস্তুত', value: stats.data.ready, tone: 'success' },
              { label: 'এখনো নয়', value: stats.data.notYet, tone: 'warning' },
              { label: 'তথ্য নেই', value: stats.data.unknown },
            ]}
          />
          <BloodGroupGrid value={group} counts={stats.data.byGroup} onChange={(g) => void setParams({ group: g })} />
        </>
      ) : stats.isError ? (
        <ErrorState error={stats.error} onRetry={stats.refetch} />
      ) : null}

      <NoticeBanner
        items={['রক্ত দেওয়ার আগে দাতার শারীরিক অবস্থা জেনে নিন।', 'রক্তের বিনিময়ে টাকা চাওয়া হলে রিপোর্ট করুন।', 'কোনো দাতার তথ্য ভুল হলে বা কেউ তালিকা থেকে সরতে চাইলে অ্যাডমিনকে জানান।']}
        action={<Button href={telHref(ADMIN_PHONE)} size="sm" variant="secondary" iconLeft="phone">অ্যাডমিন</Button>}
      />

      <FilterBar
        query={q}
        onQuery={(v) => void setParams({ q: v || null })}
        placeholder="নাম বা মোবাইল নম্বর"
        chips={[
          { value: 'all', label: 'সব অবস্থা' },
          { value: 'ready', label: 'প্রস্তুত', count: stats.data?.ready },
          { value: 'not-yet', label: 'এখনো নয়', count: stats.data?.notYet },
          { value: 'unknown', label: 'তথ্য নেই', count: stats.data?.unknown },
        ]}
        chipValue={status ?? 'all'}
        onChip={(v) => void setParams({ status: v === 'all' ? null : (v as DonorStatus) })}
        count={list.isPending ? undefined : totalOf(list.data)}
        countLabel={`জন${group ? ` ${group}` : ''} দাতা`}
        onClear={filtered ? clear : undefined}
      />

      {list.isPending ? (
        <CardGridSkeleton count={6} height={210} keyPrefix="donor" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="drop" title={group ? `${group} গ্রুপের কোনো দাতা পাওয়া যায়নি` : 'কোনো দাতা পাওয়া যায়নি'} action={filtered ? <Button variant="secondary" onClick={clear}>ফিল্টার মুছুন</Button> : undefined}>
          অন্য অবস্থা বেছে দেখুন, অথবা কাছের হাসপাতালের ব্লাড ব্যাংকে যোগাযোগ করুন।
        </EmptyState>
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((d) => (
              <DonorCard key={d.id} donor={d} />
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
    </div>
  );
}
