'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { useDebounce } from '@/hooks/useDebounce';
import { flatPages, totalOf } from '@/lib/community';
import { bn, cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select, TextField } from '@/components/ui/Field';
import { SegmentedControl } from '@/components/ui/Tabs';
import { Avatar, MetaList } from '@/components/ui/Misc';
import { FilterBar, LoadMore, NoticeBanner, PageHeader } from '@/components/shared/Blocks';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useUnions } from '@/features/area';
import { useVoterLookup } from '../hooks/useVoters';
import { hasLookupFilter, type Voter } from '../schemas/voter.schema';

const GENDER: Record<Voter['gender'], string> = { male: 'পুরুষ', female: 'নারী', third: 'তৃতীয় লিঙ্গ' };
const YEARS = Array.from({ length: 90 }, (_, i) => String(new Date().getFullYear() - 18 - i));

function VoterCard({ v }: { v: Voter }) {
  return (
    <article className="bb-card bb-dcard">
      <div className="bb-dcard-head">
        <Avatar name={v.name} tone="brand" />
        <div className="bb-dcard-id">
          <h3 className="bb-card-title">{v.name}</h3>
          <p className="bb-dcard-role">ভোটার নং: {bn(v.voterNo)}</p>
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-body-sm">
        <dt className="text-ink-muted">পিতা</dt>
        <dd>{v.fatherName}</dd>
        <dt className="text-ink-muted">মাতা</dt>
        <dd>{v.motherName}</dd>
        <dt className="text-ink-muted">জন্ম</dt>
        <dd>{formatDate(v.dob)}</dd>
      </dl>
      <div className="bb-badges">
        <Badge tone="neutral" icon="user">
          {GENDER[v.gender]}
        </Badge>
      </div>
      <MetaList items={[{ icon: 'pin', text: `${v.village}, ${v.union}` }, { icon: 'vote', text: v.centre }]} />
    </article>
  );
}

export function VoterLookup() {
  const [p, setP] = useQueryStates({
    q: parseAsString.withDefault(''),
    union: parseAsString,
    by: parseAsString.withDefault('year'),
    dob: parseAsString,
    year: parseAsString,
  });
  const unions = useUnions();
  const search = useDebounce(p.q.trim());
  const params = { union: p.union ?? undefined, search: search || undefined, dob: p.by === 'dob' ? (p.dob ?? undefined) : undefined, birthYear: p.by === 'year' ? (p.year ?? undefined) : undefined };
  const ready = hasLookupFilter(params);
  const list = useVoterLookup(params);
  const items = flatPages(list.data);
  const filtered = Boolean(p.q || p.union || p.dob || p.year);

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader eyebrow="সরকারি সেবা" title="ভোটার তথ্য" />
      <NoticeBanner
        title="সতর্কতা"
        defaultOpen
        items={['শুধু নিজের বা পরিবারের ভোটার তথ্য যাচাইয়ের জন্য ব্যবহার করুন।', 'অন্যের তথ্যের অপব্যবহার আইনত দণ্ডনীয় অপরাধ।', 'সংশোধনের জন্য উপজেলা নির্বাচন অফিসে যোগাযোগ করুন।']}
      />
      <FilterBar
        query={p.q}
        onQuery={(v) => void setP({ q: v || null })}
        placeholder="নাম বা ভোটার নম্বর"
        count={ready && !list.isPending ? totalOf(list.data) : undefined}
        countLabel="জন ভোটার"
        onClear={filtered ? () => void setP({ q: null, union: null, dob: null, year: null }) : undefined}
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <Select
            label="ইউনিয়ন"
            value={p.union ?? ''}
            onChange={(e) => void setP({ union: e.target.value || null })}
            options={[{ value: '', label: 'সব ইউনিয়ন' }, ...(unions.data ?? []).map((u) => ({ value: u.name, label: u.name }))]}
          />
          <SegmentedControl
            label="জন্ম তারিখ দিয়ে খুঁজুন"
            value={p.by === 'dob' ? 'dob' : 'year'}
            onChange={(v) => void setP({ by: v, dob: null, year: null })}
            items={[
              { value: 'year', label: 'জন্ম সাল' },
              { value: 'dob', label: 'জন্ম তারিখ' },
            ]}
          />
          {p.by === 'dob' ? (
            <TextField label="জন্ম তারিখ" type="date" icon="calendar" value={p.dob ?? ''} onChange={(e) => void setP({ dob: e.target.value || null })} />
          ) : (
            <Select label="জন্ম সাল" value={p.year ?? ''} onChange={(e) => void setP({ year: e.target.value || null })} options={[{ value: '', label: 'যেকোনো সাল' }, ...YEARS.map((y) => ({ value: y, label: bn(y) }))]} />
          )}
        </div>
      </FilterBar>

      {!ready ? (
        <EmptyState icon="vote" title="নাম, ভোটার নম্বর বা জন্ম তারিখ দিন" />
      ) : list.isPending ? (
        <CardGridSkeleton count={4} height={220} keyPrefix="voter" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="vote" title="কোনো ভোটার পাওয়া যায়নি" action={<Button variant="secondary" onClick={() => void setP({ q: null, union: null, dob: null, year: null })}>নতুন করে খুঁজুন</Button>} />
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((v) => (
              <VoterCard key={v.id} v={v} />
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
    </div>
  );
}
