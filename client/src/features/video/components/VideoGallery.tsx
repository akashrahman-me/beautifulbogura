'use client';

import * as RDialog from '@radix-ui/react-dialog';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { flatPages, totalOf } from '@/lib/community';
import { bn, cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Bricks } from '@/components/ui/Misc';
import { FilterBar, LoadMore, PageHeader } from '@/components/shared/Blocks';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useVideos } from '../hooks/useVideos';
import { VIDEO_CATEGORIES, videoCategoryLabel, type Video } from '../schemas/video.schema';

const CATEGORY_VALUES = VIDEO_CATEGORIES.map(([v]) => v);
const clock = (s: number) => `${bn(Math.floor(s / 60))}:${bn(String(s % 60).padStart(2, '0'))}`;

function Poster({ video }: { video: Video }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-md bg-brand-soft">
      {video.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element -- poster images come from the video host
        <img src={video.thumbnail} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <Bricks rows={14} cols={24} sparse className="absolute inset-0 size-full text-brand opacity-30" />
      )}
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-14 place-items-center rounded-full bg-[var(--ink)]/75 text-[var(--canvas)] transition-transform group-hover:scale-110">
          <Icon name="play" size={26} />
        </span>
      </span>
      <span className="absolute right-2 bottom-2 rounded-sm bg-[var(--ink)]/80 px-1.5 text-caption text-[var(--canvas)]">{clock(video.duration)}</span>
    </div>
  );
}

function Player({ video, onClose }: { video: Video | null; onClose: () => void }) {
  return (
    <RDialog.Root open={!!video} onOpenChange={(o) => !o && onClose()}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-[300] bg-black/80" />
        <RDialog.Content className="fixed top-1/2 left-1/2 z-[400] flex w-[min(960px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3">
          <div className="flex items-start justify-between gap-3 text-white">
            <RDialog.Title className="text-h4">{video?.title}</RDialog.Title>
            <RDialog.Close asChild>
              <IconButton icon="x" label="বন্ধ করুন" className="text-white" />
            </RDialog.Close>
          </div>
          <RDialog.Description className="bb-sr">ভিডিও চলছে</RDialog.Description>
          {video && (
            <iframe
              className="aspect-video w-full rounded-md bg-black"
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.youtubeId)}?autoplay=1&rel=0`}
              title={video.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

export function VideoGallery() {
  const [{ q, category }, setP] = useQueryStates({ q: parseAsString.withDefault(''), category: parseAsStringLiteral(CATEGORY_VALUES) });
  const search = useDebounce(q.trim());
  const list = useVideos({ category: category ?? undefined, search: search || undefined });
  const items = flatPages(list.data);
  const [playing, setPlaying] = useState<Video | null>(null);

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader eyebrow="পরিচিতি" title="ভিডিও" />
      <FilterBar
        query={q}
        onQuery={(v) => void setP({ q: v || null })}
        placeholder="ভিডিও খুঁজুন"
        chips={[{ value: 'all', label: 'সব' }, ...VIDEO_CATEGORIES.map(([value, label]) => ({ value, label }))]}
        chipValue={category ?? 'all'}
        onChip={(v) => void setP({ category: v === 'all' ? null : (v as (typeof CATEGORY_VALUES)[number]) })}
        count={list.isPending ? undefined : totalOf(list.data)}
        countLabel="টি ভিডিও"
        onClear={q || category ? () => void setP({ q: null, category: null }) : undefined}
      />
      {list.isPending ? (
        <CardGridSkeleton count={6} media keyPrefix="video" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="video" title="কোনো ভিডিও পাওয়া যায়নি" />
      ) : (
        <>
          <div className={cn('grid gap-5 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((v) => (
              <button key={v.id} type="button" className="group flex flex-col gap-2 text-left" onClick={() => setPlaying(v)} aria-label={`চালান: ${v.title}`}>
                <Poster video={v} />
                <span className="text-h4 group-hover:underline">{v.title}</span>
                <span className="flex flex-wrap items-center gap-2">
                  <Badge tone="info" icon={null}>
                    {videoCategoryLabel(v.category)}
                  </Badge>
                  <span className="text-caption text-ink-muted">{formatDate(v.publishedAt)}</span>
                </span>
              </button>
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
      <Player video={playing} onClose={() => setPlaying(null)} />
    </div>
  );
}
