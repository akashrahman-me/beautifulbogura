'use client';

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';
import { useNow } from '@/hooks/useNow';
import { flatPages, totalOf } from '@/lib/community';
import { cn, money, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FilterBar, LoadMore, NoticeBanner, PageHeader } from '@/components/shared/Blocks';
import { ListingCard } from '@/components/shared/ListingCard';
import { PostActions } from '@/components/shared/PostActions';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useListings, useManageListing, useReportListing } from '../hooks/useListings';
import { categoryLabel, conditionLabel, LISTING_CATEGORIES, type Listing } from '../schemas/listing.schema';

const CATS = LISTING_CATEGORIES.map(([v]) => v);

function ListingItem({ item, now }: { item: Listing; now: Date | null }) {
  const manage = useManageListing();
  const report = useReportListing();
  return (
    <ListingCard
      title={item.title}
      price={money(item.price)}
      category={categoryLabel(item.category)}
      condition={conditionLabel(item.condition)}
      description={item.description}
      postedAgo={now && timeAgo(item.createdAt, now)}
      seller={item.sellerName}
      address={item.address}
      phone={item.phone}
      whatsapp={item.whatsapp}
      image={item.images[0]}
      icon="tag"
      closedLabel={item.status === 'sold' ? 'বিক্রি হয়েছে' : undefined}
      footer={<PostActions id={item.id} ownerId={item.ownerId} manage={manage} report={report} doneLabel="বিক্রি হয়ে গেছে" />}
    />
  );
}

export function ListingList() {
  const [{ q, cat }, setParams] = useQueryStates({ q: parseAsString.withDefault(''), cat: parseAsStringLiteral(CATS) });
  const search = useDebounce(q.trim());
  const now = useNow();
  const list = useListings({ search: search || undefined, category: cat ?? undefined });
  const items = flatPages(list.data);
  const filtered = Boolean(q || cat);
  const clear = () => void setParams({ q: null, cat: null });

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader
        eyebrow="কমিউনিটি"
        title="কেনাবেচা"
        action={<Button href="/buy-sell/new" iconLeft="plus">বিক্রি করুন</Button>}
      />
      <NoticeBanner items={['টাকা দেওয়ার আগে পণ্য নিজে দেখে নিন।', 'অগ্রিম টাকা চাইলে সতর্ক থাকুন এবং ‘রিপোর্ট’ করুন।']} />
      <FilterBar
        query={q}
        onQuery={(v) => void setParams({ q: v || null })}
        placeholder="পণ্য বা এলাকা"
        chips={[{ value: 'all', label: 'সব' }, ...LISTING_CATEGORIES.map(([value, label]) => ({ value, label }))]}
        chipValue={cat ?? 'all'}
        onChip={(v) => void setParams({ cat: v === 'all' ? null : (v as (typeof CATS)[number]) })}
        count={list.isPending ? undefined : totalOf(list.data)}
        countLabel="টি বিজ্ঞাপন"
        onClear={filtered ? clear : undefined}
      />
      {list.isPending ? (
        <CardGridSkeleton count={6} media />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="tag" title={cat ? `${categoryLabel(cat)} — এখনো কোনো বিজ্ঞাপন নেই` : 'কোনো বিজ্ঞাপন পাওয়া যায়নি'} action={<Button href="/buy-sell/new" iconLeft="plus">প্রথম বিজ্ঞাপন দিন</Button>} />
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((it) => (
              <ListingItem key={it.id} item={it} now={now} />
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
    </div>
  );
}
