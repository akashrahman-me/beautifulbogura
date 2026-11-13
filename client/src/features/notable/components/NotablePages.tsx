'use client';

import Link from 'next/link';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';
import { ApiError } from '@/lib/api-client';
import { flatPages, totalOf } from '@/lib/community';
import { bn, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Misc';
import { FilterBar, LoadMore, PageHeader } from '@/components/shared/Blocks';
import { CardGridSkeleton, Skeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useNotablePerson, useNotablePersons } from '../hooks/useNotable';
import { fieldLabel, FIELDS, type NotableSummary } from '../schemas/notable.schema';

const FIELD_VALUES = FIELDS.map(([v]) => v);
const lifespan = (p: Pick<NotableSummary, 'born' | 'died'>) => (p.born ? `${bn(p.born)} – ${p.died ? bn(p.died) : 'বর্তমান'}` : null);

function NotableCard({ p }: { p: NotableSummary }) {
  const years = lifespan(p);
  return (
    <Link href={`/notable-persons/${p.id}`} className="bb-card bb-dcard group transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="bb-dcard-head">
        <Avatar name={p.name} src={p.photo} tone="gold" size="lg" />
        <div className="bb-dcard-id">
          <h3 className="bb-card-title group-hover:underline">{p.name}</h3>
          <p className="bb-dcard-role">{p.title}</p>
        </div>
      </div>
      <p className="bb-card-text bb-clamp-2">{p.excerpt}</p>
      <div className="bb-badges">
        <Badge tone="featured" icon={null}>
          {fieldLabel(p.field)}
        </Badge>
        {years && (
          <Badge tone="neutral" icon="calendar">
            {years}
          </Badge>
        )}
      </div>
    </Link>
  );
}

export function NotableList() {
  const [{ q, field }, setP] = useQueryStates({ q: parseAsString.withDefault(''), field: parseAsStringLiteral(FIELD_VALUES) });
  const search = useDebounce(q.trim());
  const list = useNotablePersons({ field: field ?? undefined, search: search || undefined });
  const items = flatPages(list.data);

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader eyebrow="তালিকা" title="বিশিষ্ট ব্যক্তি" />
      <FilterBar
        query={q}
        onQuery={(v) => void setP({ q: v || null })}
        placeholder="নাম বা পরিচয়"
        chips={[{ value: 'all', label: 'সব' }, ...FIELDS.map(([value, label]) => ({ value, label }))]}
        chipValue={field ?? 'all'}
        onChip={(v) => void setP({ field: v === 'all' ? null : (v as (typeof FIELD_VALUES)[number]) })}
        count={list.isPending ? undefined : totalOf(list.data)}
        countLabel="জন"
        onClear={q || field ? () => void setP({ q: null, field: null }) : undefined}
      />
      {list.isPending ? (
        <CardGridSkeleton count={6} height={200} keyPrefix="notable" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="user" title="কাউকে পাওয়া যায়নি" />
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((p) => (
              <NotableCard key={p.id} p={p} />
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
    </div>
  );
}

export function NotableDetailSkeleton() {
  return (
    <div className="container-narrow flex flex-col gap-6 pt-8">
      <Skeleton uniqueKey="notable-detail" viewBox="0 0 640 420" height={420}>
        <rect x="0" y="0" rx="6" width="120" height="14" />
        <circle cx="48" cy="84" r="48" />
        <rect x="116" y="56" rx="6" width="300" height="28" />
        <rect x="116" y="96" rx="6" width="200" height="14" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x="0" y={170 + i * 34} rx="6" width={i % 3 === 2 ? 420 : 640} height="16" />
        ))}
      </Skeleton>
    </div>
  );
}

export function NotableDetail({ id }: { id: string }) {
  const { data: p, isPending, isError, error, refetch } = useNotablePerson(id);
  if (isPending) return <NotableDetailSkeleton />;
  if (isError) {
    return (
      <div className="container-narrow pt-10">
        {error instanceof ApiError && error.status === 404 ? (
          <EmptyState icon="user" title="তথ্য পাওয়া যায়নি" action={<Button href="/notable-persons">বিশিষ্ট ব্যক্তি</Button>} />
        ) : (
          <ErrorState error={error} onRetry={refetch} />
        )}
      </div>
    );
  }
  const years = lifespan(p);
  return (
    <article className="container-narrow flex flex-col gap-6">
      <PageHeader
        back={{ href: '/notable-persons', label: 'বিশিষ্ট ব্যক্তি' }}
        eyebrow={fieldLabel(p.field)}
        title={p.name}
        description={p.title}
        meta={years && <Badge tone="neutral" icon="calendar">{years}</Badge>}
        action={<Avatar name={p.name} src={p.photo} tone="gold" size="lg" />}
      />
      <div className="flex flex-col gap-4 text-body-lg">
        {p.body.split(/\n\s*\n/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  );
}
