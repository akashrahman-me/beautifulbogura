'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';
import { flatPages, totalOf } from '@/lib/community';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FilterBar, LoadMore, NoticeBanner, PageHeader } from '@/components/shared/Blocks';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useJobs } from '../hooks/useJobs';
import { JobCard } from './JobCard';

export function JobList() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const search = useDebounce(q.trim());
  const list = useJobs({ search: search || undefined });
  const items = flatPages(list.data);

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader
        eyebrow="চাকরি ও কেনাবেচা"
        title="চাকরির খবর"
        description="বগুড়ার দোকান, অফিস আর প্রতিষ্ঠানের চাকরি। আবেদনের শেষ তারিখ দেখে সরাসরি যোগাযোগ করুন।"
        action={
          <Button href="/jobs/new" iconLeft="plus">
            চাকরির বিজ্ঞাপন দিন
          </Button>
        }
      />
      <NoticeBanner>
        <p>বিজ্ঞাপন দিতে কোনো অ্যাকাউন্ট লাগে না। পোস্ট করার সময় একটি পিন দিন — সেই পিন দিয়ে পরে বিজ্ঞাপন মুছে ফেলতে বা ‘নিয়োগ সম্পন্ন’ করতে পারবেন। চাকরির জন্য টাকা চাওয়া হলে রিপোর্ট করুন।</p>
      </NoticeBanner>
      <FilterBar query={q} onQuery={(v) => void setQ(v || null)} placeholder="প্রতিষ্ঠান, পদ বা এলাকা" count={list.isPending ? undefined : totalOf(list.data)} countLabel="টি সক্রিয় বিজ্ঞাপন" onClear={q ? () => void setQ(null) : undefined} />
      {list.isPending ? (
        <CardGridSkeleton count={6} height={250} keyPrefix="job" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="briefcase" title="কোনো চাকরির বিজ্ঞাপন পাওয়া যায়নি" action={<Button href="/jobs/new" iconLeft="plus">বিজ্ঞাপন দিন</Button>}>
          অন্য শব্দ দিয়ে খুঁজুন, অথবা আপনার প্রতিষ্ঠানের বিজ্ঞাপন দিন।
        </EmptyState>
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
    </div>
  );
}
