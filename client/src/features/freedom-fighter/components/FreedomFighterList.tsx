'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';
import { flatPages, totalOf } from '@/lib/community';
import { bn, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import { Avatar, MetaList } from '@/components/ui/Misc';
import { FilterBar, LoadMore, PageHeader } from '@/components/shared/Blocks';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useUnions } from '@/features/area';
import { useFreedomFighters } from '../hooks/useFreedomFighters';
import type { FreedomFighter } from '../schemas/freedom-fighter.schema';

function FighterCard({ f }: { f: FreedomFighter }) {
  return (
    <article className="bb-card bb-dcard">
      <div className="bb-dcard-head">
        <Avatar name={f.name} src={f.photo} tone="gold" />
        <div className="bb-dcard-id">
          <h3 className="bb-card-title">বীর মুক্তিযোদ্ধা {f.name}</h3>
          <p className="bb-dcard-role">পিতা: {f.fatherName}</p>
        </div>
      </div>
      <div className="bb-badges">
        <Badge tone="featured" icon="medal">
          নং {bn(f.idNo)}
        </Badge>
        {f.sector && <Badge tone="neutral">{f.sector}</Badge>}
        {!f.alive && (
          <Badge tone="neutral" icon={null}>
            প্রয়াত
          </Badge>
        )}
      </div>
      <MetaList items={[{ icon: 'pin', text: `${f.village}, ${f.union}` }]} />
    </article>
  );
}

export function FreedomFighterList() {
  const [{ q, union }, setP] = useQueryStates({ q: parseAsString.withDefault(''), union: parseAsString });
  const unions = useUnions();
  const search = useDebounce(q.trim());
  const list = useFreedomFighters({ union: union ?? undefined, search: search || undefined });
  const items = flatPages(list.data);
  const clear = () => void setP({ q: null, union: null });

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader eyebrow="তালিকা" title="বীর মুক্তিযোদ্ধা" />
      <FilterBar
        query={q}
        onQuery={(v) => void setP({ q: v || null })}
        placeholder="নাম, পিতার নাম, নম্বর বা গ্রাম"
        count={list.isPending ? undefined : totalOf(list.data)}
        countLabel="জন বীর মুক্তিযোদ্ধা"
        onClear={q || union ? clear : undefined}
        trailing={
          <Select
            label="ইউনিয়ন"
            className="min-w-44 [&_.bb-label]:sr-only"
            value={union ?? ''}
            onChange={(e) => void setP({ union: e.target.value || null })}
            options={[{ value: '', label: 'সব ইউনিয়ন' }, ...(unions.data ?? []).map((u) => ({ value: u.name, label: u.name }))]}
          />
        }
      />
      {list.isPending ? (
        <CardGridSkeleton count={6} height={170} keyPrefix="ff" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="medal" title="কাউকে পাওয়া যায়নি" />
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((f) => (
              <FighterCard key={f.id} f={f} />
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
    </div>
  );
}
