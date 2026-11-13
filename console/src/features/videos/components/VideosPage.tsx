'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { createResource } from '@/lib/resource';
import { bn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { DateCell, TitleCell } from '@/components/admin/Cell';
import { CrudPage } from '@/components/admin/CrudPage';
import type { Column } from '@/components/admin/DataTable';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { labelOf, VIDEO_CATEGORIES } from '@/config/catalog';
import { RequirePermission } from '@/features/auth';
import { videoEmpty, videoFields, videoSchema, type Video, type VideoQuery } from '../schemas/video.schema';

export const videos = createResource<Video, unknown, VideoQuery>('/admin/videos', 'ভিডিও');
const clock = (s: number) => `${bn(Math.floor(s / 60))}:${bn(String(s % 60).padStart(2, '0'))}`;

const columns: Column<Video>[] = [
  {
    key: 'title',
    header: 'ভিডিও',
    primary: true,
    cell: (v) => (
      <span className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- YouTube poster */}
        {v.thumbnail ? <img src={v.thumbnail} alt="" className="aspect-video w-24 rounded-sm border border-line object-cover" /> : <span className="aspect-video w-24 rounded-sm bg-surface-sunken" />}
        <TitleCell title={v.title} sub={`youtu.be/${v.youtubeId}`} />
      </span>
    ),
  },
  { key: 'category', header: 'বিভাগ', cell: (v) => labelOf(VIDEO_CATEGORIES, v.category) },
  { key: 'duration', header: 'দৈর্ঘ্য', align: 'end', cell: (v) => clock(v.duration) },
  { key: 'status', header: 'অবস্থা', cell: (v) => (v.published ? <Badge tone="success" dot icon={null}>প্রকাশিত</Badge> : <Badge tone="neutral" dot icon={null}>খসড়া</Badge>) },
  { key: 'date', header: 'প্রকাশ', sort: 'publishedAt', cell: (v) => <DateCell value={v.publishedAt} /> },
];

export function VideosPage() {
  const [f, setF] = useQueryStates({ category: parseAsString });
  return (
    <RequirePermission permission="content.manage">
      <CrudPage
        title="ভিডিও"
        noun="ভিডিও"
        resource={videos}
        columns={columns}
        searchPlaceholder="শিরোনাম"
        emptyIcon="video"
        filters={{ category: f.category ?? undefined }}
        filtersActive={!!f.category}
        clearFilters={() => void setF({ category: null })}
        filterNode={<FilterSelect label="বিভাগ" value={f.category} onChange={(v) => void setF({ category: v })} options={VIDEO_CATEGORIES} />}
        sheet={{
          schema: videoSchema,
          fields: videoFields,
          empty: videoEmpty,
          toForm: (v) => ({ title: v.title, youtube: `https://youtu.be/${v.youtubeId}`, category: v.category, duration: `${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, '0')}`, published: v.published }),
          title: (v) => v?.title ?? 'ভিডিও',
        }}
      />
    </RequirePermission>
  );
}
