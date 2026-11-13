'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNow } from '@/hooks/useNow';
import { flatPages, totalOf } from '@/lib/community';
import { applyApiErrors } from '@/lib/form';
import { bn, cn, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/Field';
import { FileDrop } from '@/components/ui/FileDrop';
import { ChoiceGroup } from '@/components/ui/Interactive';
import { Alert, Avatar, MetaList } from '@/components/ui/Misc';
import { Tabs } from '@/components/ui/Tabs';
import { RequireSignIn } from '@/features/auth';
import { ContactActions, LoadMore, NoticeBanner, PageHeader, PhoneLink } from '@/components/shared/Blocks';
import { PostActions } from '@/components/shared/PostActions';
import { PostedSuccess } from '@/components/shared/PostedSuccess';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useCreateTuition, useManageTuition, useReportTuition, useTuitions } from '../hooks/useTuitions';
import { createTuitionSchema, TUITION_KINDS, type CreateTuitionIn, type CreateTuitionInput, type Tuition, type TuitionKind } from '../schemas/tuition.schema';

const TABS = ['all', 'need-teacher', 'want-to-teach'] as const;

function TuitionCard({ t, now }: { t: Tuition; now: Date | null }) {
  const manage = useManageTuition();
  const report = useReportTuition();
  const teach = t.kind === 'want-to-teach';
  return (
    <article className="bb-card bb-dcard">
      <div className="bb-dcard-head">
        <Avatar name={t.name} src={t.photo} tone={teach ? 'info' : 'gold'} />
        <div className="bb-dcard-id">
          <div className="bb-badges">
            <Badge tone={teach ? 'info' : 'accent'} icon={teach ? 'school' : 'book'}>
              {teach ? 'পড়াতে চাই' : 'শিক্ষক চাই'}
            </Badge>
          </div>
          <h3 className="bb-card-title">
            {t.subject} · {t.classLevel}
          </h3>
          <p className="bb-dcard-role">
            {t.name}
            {now && ` · ${timeAgo(t.createdAt, now)}`}
          </p>
        </div>
      </div>
      <MetaList
        items={[
          t.qualification && { icon: 'school', text: t.qualification },
          t.experience && { icon: 'briefcase', text: `অভিজ্ঞতা: ${t.experience}` },
          { icon: 'pin', text: t.address },
        ]}
      />
      {t.note && <p className="bb-card-text">{t.note}</p>}
      <div className="bb-dcard-foot">
        <PhoneLink phone={t.phone} />
        <ContactActions phone={t.phone} compact />
      </div>
      <PostActions id={t.id} ownerId={t.ownerId} manage={manage} report={report} doneLabel={teach ? 'টিউশন পেয়ে গেছি' : 'শিক্ষক পেয়ে গেছি'} />
    </article>
  );
}

export function TuitionList() {
  const [tab, setTab] = useQueryState('kind', parseAsStringLiteral(TABS).withDefault('all'));
  const now = useNow();
  const list = useTuitions({ kind: tab === 'all' ? undefined : (tab as TuitionKind) });
  const items = flatPages(list.data);
  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader eyebrow="শিক্ষা" title="টিউশন" description="শিক্ষক খুঁজছেন, নাকি পড়াতে চান — বিজ্ঞাপন দিন, সরাসরি কথা বলুন।" action={<Button href="/tuition/new" iconLeft="plus">বিজ্ঞাপন দিন</Button>} />
      <NoticeBanner>
        <p>বিজ্ঞাপন এক মাস পর নিজে থেকেই মুছে যায়। শিক্ষক বা টিউশন পেয়ে গেলে ‘আমার অ্যাকাউন্ট’ থেকে আগেই সরিয়ে দিন। শিশুর নিরাপত্তায় প্রথম দেখা অভিভাবকের উপস্থিতিতে করুন।</p>
      </NoticeBanner>
      <Tabs label="টিউশনের ধরন" variant="pill" value={tab} onChange={(v) => void setTab(v === 'all' ? null : v)} items={[{ value: 'all', label: 'সব' }, ...TUITION_KINDS.map(([value, label]) => ({ value, label }))]} />
      {!list.isPending && !list.isError && <p className="bb-filterbar-count">{bn(totalOf(list.data))}টি বিজ্ঞাপন</p>}
      {list.isPending ? (
        <CardGridSkeleton count={6} height={250} keyPrefix="tuition" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="book" title="এখনো কোনো বিজ্ঞাপন নেই" action={<Button href="/tuition/new" iconLeft="plus">প্রথম বিজ্ঞাপন দিন</Button>} />
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((t) => (
              <TuitionCard key={t.id} t={t} now={now} />
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
    </div>
  );
}

export function TuitionForm() {
  const create = useCreateTuition();
  const [done, setDone] = useState(false);
  const form = useForm<CreateTuitionIn, unknown, CreateTuitionInput>({
    resolver: zodResolver(createTuitionSchema),
    defaultValues: { name: '', phone: '', classLevel: '', subject: '', qualification: '', experience: '', address: '', note: '', images: [], website: '' },
  });
  const { errors } = form.formState;
  const kind = useWatch({ control: form.control, name: 'kind' });
  const submit = form.handleSubmit((v) => create.mutate(v, { onSuccess: () => setDone(true), onError: (e) => applyApiErrors(form, e) }));
  return (
    <div className="container-narrow flex flex-col gap-5">
      <PageHeader eyebrow="টিউশন" title="টিউশনের বিজ্ঞাপন দিন" back={{ href: '/tuition', label: 'টিউশন' }} description="এক মাস দেখা যাবে, তারপর নিজে থেকেই মুছে যাবে।" />
      {done ? (
        <PostedSuccess title="বিজ্ঞাপন প্রকাশিত হয়েছে" href="/tuition" listLabel="টিউশন দেখুন" days="এক মাস" />
      ) : (
        <RequireSignIn>
          <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
            <Controller control={form.control} name="kind" render={({ field }) => <ChoiceGroup required label="আপনি কী চান?" options={TUITION_KINDS.map(([value, label]) => ({ value, label }))} value={field.value ?? ''} onChange={field.onChange} error={errors.kind?.message} />} />
            <TextField label={kind === 'want-to-teach' ? 'আপনার নাম' : 'অভিভাবকের নাম'} required {...form.register('name')} error={errors.name?.message} />
            <TextField label="মোবাইল নম্বর" required inputMode="tel" icon="phone" {...form.register('phone')} error={errors.phone?.message} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="শ্রেণি" required placeholder="যেমন: অষ্টম" {...form.register('classLevel')} error={errors.classLevel?.message} />
              <TextField label="বিষয়" required placeholder="যেমন: গণিত ও ইংরেজি" {...form.register('subject')} error={errors.subject?.message} />
            </div>
            {kind === 'want-to-teach' && (
              <>
                <TextField label="শিক্ষাগত যোগ্যতা" required placeholder="যেমন: বিএসসি, আজিজুল হক কলেজ" {...form.register('qualification')} error={errors.qualification?.message} />
                <TextField label="অভিজ্ঞতা" optional placeholder="যেমন: ৩ বছর" {...form.register('experience')} />
                <Controller control={form.control} name="images" render={({ field }) => <FileDrop label="আপনার ছবি" optional max={1} value={field.value} onChange={field.onChange} />} />
              </>
            )}
            <TextField label="এলাকা" required icon="pin" {...form.register('address')} error={errors.address?.message} />
            <TextArea label="অন্য কিছু" optional rows={3} placeholder="সপ্তাহে কয়দিন, সময়, সম্মানী" {...form.register('note')} />
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
            {errors.root && <Alert tone="danger" title={errors.root.message} />}
            <Button type="submit" size="lg" block loading={create.isPending} iconLeft="check">
              বিজ্ঞাপন প্রকাশ করুন
            </Button>
          </form>
        </RequireSignIn>
      )}
    </div>
  );
}
