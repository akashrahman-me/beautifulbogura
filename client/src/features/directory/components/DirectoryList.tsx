'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { ADMIN_PHONE } from '@/config/services';
import { useDebounce } from '@/hooks/useDebounce';
import { flatPages, totalOf } from '@/lib/community';
import { cn, formatPhone, telHref } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FilterBar, LoadMore, NoticeBanner, PageHeader } from '@/components/shared/Blocks';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useDirectory } from '../hooks/useDirectory';
import { DIRECTORY_TYPES } from '../schemas/directory.schema';
import { DirectoryCard } from './DirectoryCard';

export function DirectoryList({ type }: { type: string }) {
  const config = DIRECTORY_TYPES[type];
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const search = useDebounce(q.trim());
  const { data, isPending, isError, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage, isPlaceholderData } = useDirectory({ type, search: search || undefined });
  const items = flatPages(data);

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader
        title={config.title}
        description={config.description}
        back={{ href: '/services', label: 'সব সেবা' }}
        action={config.addable ? <Button href={`/directory/${type}/add`} variant="secondary" iconLeft="plus">তথ্য যুক্ত করুন</Button> : undefined}
      />

      <NoticeBanner>
        <p>
          এই তালিকায় আপনার তথ্য যুক্ত করতে {config.addable ? '“তথ্য যুক্ত করুন” বোতামে চাপুন অথবা ' : ''}অ্যাডমিনের সাথে যোগাযোগ করুন। ভুল তথ্য সংশোধন বা মুছে ফেলতেও অ্যাডমিনকে জানান:{' '}
          <a className="font-semibold underline underline-offset-2" href={telHref(ADMIN_PHONE)}>
            {formatPhone(ADMIN_PHONE)}
          </a>
        </p>
      </NoticeBanner>

      <FilterBar query={q} onQuery={(v) => void setQ(v || null)} placeholder="নাম, ঠিকানা বা নম্বর দিয়ে খুঁজুন" count={isPending ? undefined : totalOf(data)} countLabel={config.countLabel ?? 'টি তথ্য'} onClear={q ? () => void setQ(null) : undefined} />

      {isPending ? (
        <CardGridSkeleton count={6} keyPrefix={`dir-${type}`} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon={config.icon} title={search ? `“${search}” এর সাথে মেলে এমন কিছু পাওয়া যায়নি` : 'এই তালিকায় এখনো কোনো তথ্য নেই'} action={config.addable ? <Button href={`/directory/${type}/add`} iconLeft="plus">প্রথম তথ্য যুক্ত করুন</Button> : undefined}>
          {search ? 'বানান বদলে বা অন্য শব্দ দিয়ে আবার খুঁজুন।' : undefined}
        </EmptyState>
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((e) => (
              <DirectoryCard key={e.id} entry={e} config={config} />
            ))}
          </div>
          <LoadMore hasMore={!!hasNextPage} loading={isFetchingNextPage} onClick={() => void fetchNextPage()} />
        </>
      )}
    </div>
  );
}
