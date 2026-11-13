'use client';

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';
import { useNow } from '@/hooks/useNow';
import { flatPages, totalOf } from '@/lib/community';
import { bn, cn, money, timeAgo } from '@/lib/utils';
import { useFavourites, useLocalStore } from '@/stores/local.store';
import { Button } from '@/components/ui/Button';
import { FilterBar, LoadMore, NoticeBanner, PageHeader } from '@/components/shared/Blocks';
import { ListingCard } from '@/components/shared/ListingCard';
import { PostActions } from '@/components/shared/PostActions';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useManageRental, useRentals, useReportRental } from '../hooks/useRentals';
import { RENTAL_TYPES, rentalTypeLabel, type Rental } from '../schemas/rental.schema';

const FILTERS = ['fav', ...RENTAL_TYPES.map(([v]) => v)] as const;

function RentalItem({ item, now, fav, onFav }: { item: Rental; now: Date | null; fav: boolean; onFav: () => void }) {
  const manage = useManageRental();
  const report = useReportRental();
  return (
    <ListingCard
      title={item.title}
      price={
        <>
          {money(item.rent)}
          <span>/মাস</span>
        </>
      }
      category={rentalTypeLabel(item.type)}
      facts={[
        { label: `${bn(item.rooms)} রুম`, icon: 'bed' },
        { label: item.gas ? 'গ্যাস আছে' : 'গ্যাস নেই', off: !item.gas },
        { label: item.attachedBath ? 'অ্যাটাচড বাথ' : 'কমন বাথ', off: !item.attachedBath },
      ]}
      description={item.description}
      postedAgo={now && timeAgo(item.createdAt, now)}
      seller={item.ownerName}
      address={item.address}
      phone={item.phone}
      whatsapp={item.whatsapp}
      image={item.images[0]}
      icon="house"
      featured={item.featured}
      verified={item.verified}
      closedLabel={item.status === 'rented' ? 'ভাড়া হয়ে গেছে' : undefined}
      favourite={fav}
      onFavourite={onFav}
      footer={
        <>
          {item.mapUrl && (
            <a className="bb-linkbtn self-start" href={item.mapUrl} target="_blank" rel="noopener noreferrer">
              গুগল ম্যাপে দেখুন
            </a>
          )}
          <PostActions id={item.id} manage={manage} report={report} doneLabel="ভাড়া হয়ে গেছে" />
        </>
      }
    />
  );
}

export function RentalList() {
  const [{ q, f }, setParams] = useQueryStates({ q: parseAsString.withDefault(''), f: parseAsStringLiteral(FILTERS) });
  const search = useDebounce(q.trim());
  const now = useNow();
  const favs = useFavourites('rental');
  const toggleFav = useLocalStore((s) => s.toggleFavourite);
  const type = f && f !== 'fav' ? f : undefined;
  const list = useRentals({ search: search || undefined, type });
  const all = flatPages(list.data);
  const items = f === 'fav' ? all.filter((r) => favs.includes(r.id)) : all;
  const filtered = Boolean(q || f);
  const clear = () => void setParams({ q: null, f: null });

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader
        eyebrow="ভাড়া"
        title="বাসা ভাড়া (টু-লেট)"
        description="ফ্ল্যাট, সাবলেট, মেস, হোস্টেল, অফিস ও দোকান। মালিককে সরাসরি কল করুন।"
        action={<Button href="/to-let/new" iconLeft="plus">বাসার বিজ্ঞাপন দিন</Button>}
      />
      <NoticeBanner>
        <p>বিজ্ঞাপন ৩০ দিন দেখা যায়। ভাড়া হয়ে গেলে পিন দিয়ে ‘ভাড়া হয়ে গেছে’ চিহ্নিত করুন। বাসা দেখার আগে অগ্রিম টাকা দেবেন না।</p>
      </NoticeBanner>
      <FilterBar
        query={q}
        onQuery={(v) => void setParams({ q: v || null })}
        placeholder="এলাকা লিখে খুঁজুন"
        chips={[{ value: 'all', label: 'সব' }, { value: 'fav', label: 'পছন্দের', icon: 'heart', count: favs.length }, ...RENTAL_TYPES.map(([value, label]) => ({ value, label }))]}
        chipValue={f ?? 'all'}
        onChip={(v) => void setParams({ f: v === 'all' ? null : (v as (typeof FILTERS)[number]) })}
        count={list.isPending ? undefined : f === 'fav' ? items.length : totalOf(list.data)}
        countLabel="টি বাসা"
        onClear={filtered ? clear : undefined}
      />
      {list.isPending ? (
        <CardGridSkeleton count={6} media />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        f === 'fav' ? (
          <EmptyState icon="heart" title="পছন্দের তালিকা খালি">যে বাসাগুলো ভালো লাগে, কার্ডের হৃদয় চিহ্নে চাপ দিয়ে এখানে রাখুন। এগুলো এই ডিভাইসেই থাকে।</EmptyState>
        ) : (
          <EmptyState icon="house" title={search ? `“${search}” এলাকায় এখনো কোনো বাসা নেই` : 'কোনো বাসা পাওয়া যায়নি'} action={<Button href="/to-let/new" iconLeft="plus">আপনার বাসার বিজ্ঞাপন দিন</Button>}>
            অন্য এলাকা বা ধরন বেছে দেখুন।
          </EmptyState>
        )
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((r) => (
              <RentalItem key={r.id} item={r} now={now} fav={favs.includes(r.id)} onFav={() => toggleFav('rental', r.id)} />
            ))}
          </div>
          {f !== 'fav' && <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />}
        </>
      )}
    </div>
  );
}
