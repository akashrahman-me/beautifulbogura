'use client';

import Link from 'next/link';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';
import { flatPages, totalOf } from '@/lib/community';
import { bn, cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Avatar, MetaList } from '@/components/ui/Misc';
import { SegmentedControl } from '@/components/ui/Tabs';
import { FilterBar, LoadMore, PageHeader, SectionHeader } from '@/components/shared/Blocks';
import { CardGridSkeleton, Skeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useInstitutions, useNotices } from '../hooks/useInstitutions';
import { institutionTypeLabel, INSTITUTION_TYPES, type Institution } from '../schemas/institution.schema';

const TYPES = INSTITUTION_TYPES.map(([v]) => v);
const mapLink = (i: Institution) => `https://www.google.com/maps/search/?api=1&query=${i.lat},${i.lng}`;

function InstitutionCard({ i }: { i: Institution }) {
  return (
    <article className="bb-card bb-dcard">
      <div className="bb-dcard-head">
        <Avatar icon="school" tone="info" square />
        <div className="bb-dcard-id">
          <div className="bb-badges">
            <Badge tone="info">{institutionTypeLabel(i.type)}</Badge>
            {i.claimed && <Badge tone="verified">যাচাইকৃত</Badge>}
          </div>
          <h3 className="bb-card-title">
            <Link href={`/education/${i.id}`}>{i.name}</Link>
          </h3>
          {i.eiin && <p className="bb-dcard-role">ইআইআইএন: {bn(i.eiin)}</p>}
        </div>
      </div>
      <MetaList items={[{ icon: 'pin', text: i.area }, i.established && { icon: 'calendar', text: `প্রতিষ্ঠা: ${i.established}` }]} />
      <div className="bb-card-foot">
        <Button variant="secondary" size="sm" iconRight="arrow-right" href={`/education/${i.id}`}>
          বিস্তারিত
        </Button>
        <a className="bb-linkbtn" href={mapLink(i)} target="_blank" rel="noopener noreferrer">
          <Icon name="map" size={16} />
          ম্যাপে দেখুন
        </a>
      </div>
    </article>
  );
}

/** Map view: an OpenStreetMap frame of the area plus one row per place, each opening in Google Maps. */
function InstitutionMap({ items }: { items: Institution[] }) {
  const lats = items.map((i) => i.lat);
  const lngs = items.map((i) => i.lng);
  const pad = 0.01;
  const bbox = [Math.min(...lngs) - pad, Math.min(...lats) - pad, Math.max(...lngs) + pad, Math.max(...lats) + pad].join(',');
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <iframe title="শিক্ষা প্রতিষ্ঠানের ম্যাপ" className="h-[420px] w-full rounded-lg border border-line" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`} loading="lazy" />
      <ol className="flex flex-col gap-2">
        {items.map((i, n) => (
          <li key={i.id}>
            <a href={mapLink(i)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md border border-line bg-surface p-3 hover:border-line-strong">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-info-soft text-label text-info">{bn(n + 1)}</span>
              <span className="flex-1">
                <span className="block text-label">{i.name}</span>
                <span className="text-caption text-ink-muted">{i.area}</span>
              </span>
              <Icon name="external" size={16} />
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

function NoticeFeed() {
  const { data, isPending, isError, error, refetch } = useNotices();
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader eyebrow="শিক্ষা" title="সাম্প্রতিক নোটিশ" />
      {isPending ? (
        <Skeleton uniqueKey="notices" viewBox="0 0 360 150" height={150}>
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x="0" y={r * 50} rx="8" width="56" height="40" />
              <rect x="70" y={r * 50 + 4} rx="4" width="220" height="12" />
              <rect x="70" y={r * 50 + 24} rx="4" width="150" height="10" />
            </g>
          ))}
        </Skeleton>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.items.length === 0 ? (
        <p className="text-body-sm text-ink-muted">এখনো কোনো নোটিশ নেই।</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface">
          {data.items.map((n) => (
            <li key={n.id} className="flex gap-3 p-4">
              <span className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-info-soft text-info">
                <span className="text-label leading-none">{formatDate(n.createdAt, false).split(' ')[0]}</span>
                <span className="text-caption">{formatDate(n.createdAt, false).split(' ')[1]}</span>
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-h4">{n.title}</p>
                <p className="text-body-sm text-ink-muted">{n.body}</p>
                <Link href={`/education/${n.institutionId}`} className="text-caption text-brand hover:underline">
                  {n.institutionName}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function InstitutionList() {
  const [{ q, type, view }, setParams] = useQueryStates({
    q: parseAsString.withDefault(''),
    type: parseAsStringLiteral(TYPES),
    view: parseAsStringLiteral(['list', 'map'] as const).withDefault('list'),
  });
  const search = useDebounce(q.trim());
  const list = useInstitutions({ type: type ?? undefined, search: search || undefined });
  const items = flatPages(list.data);
  const filtered = Boolean(q || type);
  const clear = () => void setParams({ q: null, type: null });

  return (
    <div className="container-page flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <PageHeader eyebrow="শিক্ষা" title="শিক্ষা প্রতিষ্ঠান" action={<Button href="/education/new" variant="secondary" iconLeft="plus">প্রতিষ্ঠান যুক্ত করুন</Button>} />
        <FilterBar
          query={q}
          onQuery={(v) => void setParams({ q: v || null })}
          placeholder="নাম, ইআইআইএন বা এলাকা"
          trailing={<SegmentedControl label="দেখার ধরন" value={view} onChange={(v) => void setParams({ view: v === 'list' ? null : v })} items={[{ value: 'list', label: 'তালিকা', icon: 'list' }, { value: 'map', label: 'ম্যাপ', icon: 'map' }]} className="hidden sm:inline-flex" />}
          chips={[{ value: 'all', label: 'সব' }, ...INSTITUTION_TYPES.map(([value, label]) => ({ value, label }))]}
          chipValue={type ?? 'all'}
          onChip={(v) => void setParams({ type: v === 'all' ? null : (v as (typeof TYPES)[number]) })}
          count={list.isPending ? undefined : totalOf(list.data)}
          countLabel="টি প্রতিষ্ঠান"
          onClear={filtered ? clear : undefined}
        >
          <SegmentedControl label="দেখার ধরন" value={view} onChange={(v) => void setParams({ view: v === 'list' ? null : v })} items={[{ value: 'list', label: 'তালিকা', icon: 'list' }, { value: 'map', label: 'ম্যাপ', icon: 'map' }]} className="self-start sm:hidden" />
        </FilterBar>
        {list.isPending ? (
          <CardGridSkeleton count={6} height={200} keyPrefix="institution" />
        ) : list.isError ? (
          <ErrorState error={list.error} onRetry={list.refetch} />
        ) : items.length === 0 ? (
          <EmptyState icon="school" title="কোনো প্রতিষ্ঠান পাওয়া যায়নি" action={<Button href="/education/new" iconLeft="plus">প্রতিষ্ঠান যুক্ত করুন</Button>} />
        ) : view === 'map' ? (
          <InstitutionMap items={items} />
        ) : (
          <>
            <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
              {items.map((i) => (
                <InstitutionCard key={i.id} i={i} />
              ))}
            </div>
            <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
          </>
        )}
      </div>
      <NoticeFeed />
    </div>
  );
}
