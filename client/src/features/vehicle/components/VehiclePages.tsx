'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNow } from '@/hooks/useNow';
import { flatPages, totalOf } from '@/lib/community';
import { applyApiErrors } from '@/lib/form';
import { bn, cn, timeAgo } from '@/lib/utils';
import { useFavourites, useLocalStore } from '@/stores/local.store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox, TextArea, TextField } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { ChoiceGroup } from '@/components/ui/Interactive';
import { Alert, Avatar } from '@/components/ui/Misc';
import { Tabs } from '@/components/ui/Tabs';
import { RequireSignIn } from '@/features/auth';
import { ContactActions, LoadMore, NoticeBanner, PageHeader, PhoneLink } from '@/components/shared/Blocks';
import { PostActions } from '@/components/shared/PostActions';
import { PostedSuccess } from '@/components/shared/PostedSuccess';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useCreateVehicle, useManageVehicle, useReportVehicle, useVehicles } from '../hooks/useVehicles';
import { createVehicleSchema, VEHICLE_TYPES, vehicleTypeLabel, type CreateVehicleIn, type CreateVehicleInput, type Vehicle } from '../schemas/vehicle.schema';

const TABS = ['all', 'fav', ...VEHICLE_TYPES.map(([v]) => v)] as const;

function VehicleCard({ v, fav, onFav, now }: { v: Vehicle; fav: boolean; onFav: () => void; now: Date | null }) {
  const manage = useManageVehicle();
  const report = useReportVehicle();
  return (
    <article className={cn('bb-card bb-dcard', v.featured && 'border-gold shadow-[inset_0_3px_0_var(--gold)]')}>
      <div className="bb-dcard-head">
        <Avatar icon={v.type === 'bus' ? 'bus' : v.type === 'truck' ? 'courier' : 'car'} tone="accent" square />
        <div className="bb-dcard-id flex-1">
          <div className="bb-badges">
            <Badge tone="accent">{vehicleTypeLabel(v.type)}</Badge>
            {v.featured && <Badge tone="featured" title="অ্যাডমিন উপরে রেখেছেন">ফিচার্ড</Badge>}
            {v.verified && <Badge tone="verified" title="মালিকের কাগজপত্র অ্যাডমিন দেখেছেন">যাচাইকৃত</Badge>}
          </div>
          <h3 className="bb-card-title">{v.ownerName}</h3>
          {now && <p className="bb-dcard-role">{timeAgo(v.createdAt, now)}</p>}
        </div>
        <button type="button" className={cn('bb-iconbtn bb-iconbtn-ghost', fav && 'text-accent')} aria-pressed={fav} aria-label={fav ? 'পছন্দ থেকে সরান' : 'পছন্দে রাখুন'} onClick={onFav}>
          <Icon name="heart" size={22} className={fav ? '[&_path]:fill-current' : undefined} />
        </button>
      </div>
      <p className="bb-card-text">{v.description}</p>
      <div className="bb-dcard-foot">
        <PhoneLink phone={v.phone} />
        <ContactActions phone={v.phone} whatsapp={v.whatsapp} compact />
      </div>
      <PostActions id={v.id} ownerId={v.ownerId} manage={manage} report={report} />
    </article>
  );
}

export function VehicleList() {
  const [tab, setTab] = useQueryState('type', parseAsStringLiteral(TABS).withDefault('all'));
  const now = useNow();
  const favs = useFavourites('vehicle');
  const toggleFav = useLocalStore((s) => s.toggleFavourite);
  const type = tab !== 'all' && tab !== 'fav' ? tab : undefined;
  const list = useVehicles({ type });
  const all = flatPages(list.data);
  const items = tab === 'fav' ? all.filter((v) => favs.includes(v.id)) : all;

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader eyebrow="ভাড়া" title="গাড়ি ভাড়া" action={<Button href="/car-rent/new" iconLeft="plus">গাড়ির তথ্য দিন</Button>} />
      <NoticeBanner items={['ভাড়া ঠিক করার আগে গাড়ি ও চালকের কাগজ দেখে নিন।']} />
      <Tabs
        label="গাড়ির ধরন"
        value={tab}
        onChange={(v) => void setTab(v === 'all' ? null : v)}
        items={[{ value: 'all', label: 'সব' }, { value: 'fav', label: 'পছন্দের', icon: 'heart', count: favs.length }, ...VEHICLE_TYPES.map(([value, label]) => ({ value, label }))]}
      />
      {!list.isPending && !list.isError && <p className="bb-filterbar-count">{bn(tab === 'fav' ? items.length : totalOf(list.data))}টি গাড়ি</p>}
      {list.isPending ? (
        <CardGridSkeleton count={6} height={230} keyPrefix="vehicle" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="car" title={tab === 'fav' ? 'পছন্দের তালিকা খালি' : 'এই ধরনের কোনো গাড়ি নেই'} action={<Button href="/car-rent/new" iconLeft="plus">গাড়ির তথ্য দিন</Button>} />
      ) : (
        <>
          <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((v) => (
              <VehicleCard key={v.id} v={v} now={now} fav={favs.includes(v.id)} onFav={() => toggleFav('vehicle', v.id)} />
            ))}
          </div>
          {tab !== 'fav' && <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />}
        </>
      )}
    </div>
  );
}

export function VehicleForm() {
  const create = useCreateVehicle();
  const [done, setDone] = useState(false);
  const form = useForm<CreateVehicleIn, unknown, CreateVehicleInput>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: { ownerName: '', description: '', phone: '', whatsapp: true, website: '' },
  });
  const { errors } = form.formState;
  const submit = form.handleSubmit((v) => create.mutate(v, { onSuccess: () => setDone(true), onError: (e) => applyApiErrors(form, e) }));
  return (
    <div className="container-narrow flex flex-col gap-5">
      <PageHeader eyebrow="গাড়ি ভাড়া" title="গাড়ির তথ্য দিন" back={{ href: '/car-rent', label: 'গাড়ি ভাড়া' }} />
      {done ? (
        <PostedSuccess title="গাড়ির তথ্য প্রকাশিত হয়েছে" href="/car-rent" listLabel="গাড়ি ভাড়া দেখুন" />
      ) : (
        <RequireSignIn>
          <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
            <Controller control={form.control} name="type" render={({ field }) => <ChoiceGroup required label="গাড়ির ধরন" options={VEHICLE_TYPES.map(([value, label]) => ({ value, label }))} value={field.value ?? ''} onChange={field.onChange} error={errors.type?.message} />} />
            <TextField label="মালিক বা চালকের নাম" required {...form.register('ownerName')} error={errors.ownerName?.message} />
            <TextArea label="বিবরণ" required rows={3} placeholder="যেমন: টয়োটা নোয়া, ৭ সিট, এসি। বিয়ে, পিকনিক ও ঢাকা ট্রিপ।" {...form.register('description')} error={errors.description?.message} />
            <TextField label="মোবাইল নম্বর" required inputMode="tel" icon="phone" {...form.register('phone')} error={errors.phone?.message} />
            <Controller control={form.control} name="whatsapp" render={({ field }) => <Checkbox label="এই নম্বরে হোয়াটসঅ্যাপ আছে" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
            {errors.root && <Alert tone="danger" title={errors.root.message} />}
            <Button type="submit" size="lg" block loading={create.isPending} iconLeft="check">
              প্রকাশ করুন
            </Button>
          </form>
        </RequireSignIn>
      )}
    </div>
  );
}
