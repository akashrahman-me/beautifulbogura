'use client';

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';
import { flatPages, totalOf } from '@/lib/community';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Avatar, MetaList } from '@/components/ui/Misc';
import { FilterBar, LoadMore, PageHeader } from '@/components/shared/Blocks';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useAchievers } from '../hooks/useAchievers';
import { cadreLabel, CADRES, type Achiever } from '../schemas/achiever.schema';

const CADRE_VALUES = CADRES.map(([v]) => v);

function AchieverCard({ a }: { a: Achiever }) {
  return (
    <article className="bb-card bb-dcard">
      <div className="bb-dcard-head">
        <Avatar name={a.name} src={a.photo} tone="info" />
        <div className="bb-dcard-id">
          <h3 className="bb-card-title">{a.name}</h3>
          <p className="bb-dcard-role">{a.post}</p>
        </div>
      </div>
      <div className="bb-badges">
        <Badge tone="info" icon="medal">
          {cadreLabel(a.cadre)}
        </Badge>
        {a.batch && <Badge tone="neutral">{a.batch} বিসিএস</Badge>}
      </div>
      <MetaList items={[{ icon: 'office', text: a.workplace }, { icon: 'home', text: `${a.village}, ${a.union}` }]} />
    </article>
  );
}

export function AchieverList() {
  const [{ q, cadre }, setP] = useQueryStates({ q: parseAsString.withDefault(''), cadre: parseAsStringLiteral(CADRE_VALUES) });
  const search = useDebounce(q.trim());
  const list = useAchievers({ cadre: cadre ?? undefined, search: search || undefined });
  const items = flatPages(list.data);

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader eyebrow="তালিকা" title="কৃতি সন্তান" />
      <FilterBar
        query={q}
        onQuery={(v) => void setP({ q: v || null })}
        placeholder="নাম, পদ বা গ্রাম"
        chips={[{ value: 'all', label: 'সব ক্যাডার' }, ...CADRES.map(([value, label]) => ({ value, label }))]}
        chipValue={cadre ?? 'all'}
        onChip={(v) => void setP({ cadre: v === 'all' ? null : (v as (typeof CADRE_VALUES)[number]) })}
        count={list.isPending ? undefined : totalOf(list.data)}
        countLabel="জন"
        onClear={q || cadre ? () => void setP({ q: null, cadre: null }) : undefined}
      />
      {list.isPending ? (
        <CardGridSkeleton count={6} height={180} keyPrefix="achiever" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="medal" title={cadre ? `${cadreLabel(cadre)} ক্যাডারে এখনো কেউ নেই` : 'কাউকে পাওয়া যায়নি'} />
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((a) => (
              <AchieverCard key={a.id} a={a} />
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
    </div>
  );
}
