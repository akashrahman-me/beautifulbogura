'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDebounce } from '@/hooks/useDebounce';
import { flatPages, totalOf } from '@/lib/community';
import { applyApiErrors } from '@/lib/form';
import { ADMIN_PHONE } from '@/config/services';
import { cn, telHref } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { ChoiceGroup } from '@/components/ui/Interactive';
import { Alert, Avatar, MetaList } from '@/components/ui/Misc';
import { ContactActions, FilterBar, LoadMore, NoticeBanner, PageHeader, PhoneLink } from '@/components/shared/Blocks';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useRegisterWorker, useWorkers } from '../hooks/useWorkers';
import { registerWorkerSchema, tradeLabel, TRADES, type RegisterWorkerIn, type RegisterWorkerInput, type Worker } from '../schemas/worker.schema';

const TRADE_VALUES = TRADES.map(([v]) => v);

function WorkerCard({ w }: { w: Worker }) {
  return (
    <article className="bb-card bb-dcard">
      <div className="bb-dcard-head">
        <Avatar name={w.name} tone="accent" />
        <div className="bb-dcard-id">
          <h3 className="bb-card-title">{w.name}</h3>
          <div className="bb-badges">
            {w.trades.map((t) => (
              <Badge key={t} tone="accent" icon="wrench">
                {tradeLabel(t)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <MetaList items={[w.address && { icon: 'pin', text: w.address }]} />
      <div className="bb-dcard-foot">
        <PhoneLink phone={w.phone} />
        <ContactActions phone={w.phone} compact copy />
      </div>
    </article>
  );
}

export function WorkerList() {
  const [{ q, trade }, setParams] = useQueryStates({ q: parseAsString.withDefault(''), trade: parseAsStringLiteral(TRADE_VALUES) });
  const search = useDebounce(q.trim());
  const list = useWorkers({ trade: trade ?? undefined, search: search || undefined });
  const items = flatPages(list.data);
  const filtered = Boolean(q || trade);
  const clear = () => void setParams({ q: null, trade: null });
  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader eyebrow="মিস্ত্রি ও যানবাহন" title="দক্ষ কারিগর" action={<Button href="/workers/register" variant="secondary" iconLeft="plus">নিজের নাম যুক্ত করুন</Button>} />
      <NoticeBanner items={['কাজ শুরুর আগে মজুরি ঠিক করে নিন।', 'কারো কাজ নিয়ে অভিযোগ থাকলে অ্যাডমিনকে জানান।']} action={<Button href={telHref(ADMIN_PHONE)} size="sm" variant="secondary" iconLeft="phone">অ্যাডমিন</Button>} />
      <FilterBar
        query={q}
        onQuery={(v) => void setParams({ q: v || null })}
        placeholder="নাম বা নম্বর"
        chips={[{ value: 'all', label: 'সব কাজ' }, ...TRADES.map(([value, label]) => ({ value, label }))]}
        chipValue={trade ?? 'all'}
        onChip={(v) => void setParams({ trade: v === 'all' ? null : (v as (typeof TRADE_VALUES)[number]) })}
        count={list.isPending ? undefined : totalOf(list.data)}
        countLabel="জন কারিগর"
        onClear={filtered ? clear : undefined}
      />
      {list.isPending ? (
        <CardGridSkeleton count={6} height={190} keyPrefix="worker" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="wrench" title={trade ? `${tradeLabel(trade)} — এখনো কেউ নিবন্ধিত নন` : 'কাউকে পাওয়া যায়নি'} action={<Button href="/workers/register" iconLeft="plus">নিজের নাম যুক্ত করুন</Button>} />
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((w) => (
              <WorkerCard key={w.id} w={w} />
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
    </div>
  );
}

export function WorkerRegisterForm() {
  const register = useRegisterWorker();
  const [done, setDone] = useState(false);
  const form = useForm<RegisterWorkerIn, unknown, RegisterWorkerInput>({ resolver: zodResolver(registerWorkerSchema), defaultValues: { name: '', phone: '', trades: [], address: '', website: '' } });
  const { errors } = form.formState;
  const submit = form.handleSubmit((v) => register.mutate(v, { onSuccess: () => setDone(true), onError: (e) => applyApiErrors(form, e) }));
  return (
    <div className="container-narrow flex flex-col gap-5">
      <PageHeader eyebrow="দক্ষ কারিগর" title="নিজের নাম যুক্ত করুন" back={{ href: '/workers', label: 'দক্ষ কারিগর' }} />
      {done ? (
        <Alert tone="success" title="নিবন্ধন সম্পন্ন হয়েছে" action={<Button href="/workers" size="sm" variant="secondary">তালিকা দেখুন</Button>} />
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
          <TextField label="নাম" required {...form.register('name')} error={errors.name?.message} />
          <TextField label="মোবাইল নম্বর" required inputMode="tel" icon="phone" {...form.register('phone')} error={errors.phone?.message} />
          <Controller control={form.control} name="trades" render={({ field }) => <ChoiceGroup multiple required label="কী কী কাজ করেন" options={TRADES.map(([value, label]) => ({ value, label }))} value={field.value} onChange={field.onChange} error={errors.trades?.message} />} />
          <TextField label="এলাকা" optional icon="pin" {...form.register('address')} />
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
          {errors.root && <Alert tone="danger" title={errors.root.message} />}
          <Button type="submit" size="lg" block loading={register.isPending} iconLeft="check">
            নিবন্ধন করুন
          </Button>
        </form>
      )}
    </div>
  );
}
