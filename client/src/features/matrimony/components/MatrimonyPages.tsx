'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useDebounce } from '@/hooks/useDebounce';
import { flatPages, totalOf } from '@/lib/community';
import { applyApiErrors } from '@/lib/form';
import { bn, cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox, Select, TextArea, TextField } from '@/components/ui/Field';
import { FileDrop } from '@/components/ui/FileDrop';
import { ChoiceGroup } from '@/components/ui/Interactive';
import { Alert, Avatar, MetaList } from '@/components/ui/Misc';
import { Tabs } from '@/components/ui/Tabs';
import { RequireSignIn } from '@/features/auth';
import { ContactActions, FilterBar, LoadMore, NoticeBanner, PageHeader, PhoneLink } from '@/components/shared/Blocks';
import { PostActions } from '@/components/shared/PostActions';
import { PostedSuccess } from '@/components/shared/PostedSuccess';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useCreateMatrimonial, useManageMatrimonial, useMatrimonials, useReportMatrimonial } from '../hooks/useMatrimony';
import {
  createMatrimonySchema,
  EDUCATION,
  genderLabel,
  GENDERS,
  MARITAL,
  maritalLabel,
  MIN_AGE,
  religionLabel,
  RELIGIONS,
  type CreateMatrimonyIn,
  type CreateMatrimonyInput,
  type Matrimonial,
} from '../schemas/matrimony.schema';

const GENDER_TABS = ['all', ...GENDERS.map(([v]) => v)] as const;
const RELIGION_VALUES = RELIGIONS.map(([v]) => v);
const thisYear = new Date().getFullYear();

function MatrimonyCard({ m }: { m: Matrimonial }) {
  const manage = useManageMatrimonial();
  const report = useReportMatrimonial();
  return (
    <article className="bb-card bb-dcard">
      <div className="bb-dcard-head">
        <Avatar name={m.name} src={m.photo} tone={m.gender === 'bride' ? 'accent' : 'info'} size="lg" />
        <div className="bb-dcard-id">
          <div className="bb-badges">
            <Badge tone={m.gender === 'bride' ? 'accent' : 'info'} icon={null}>
              {genderLabel(m.gender)}
            </Badge>
            <Badge tone="neutral" icon={null}>
              {bn(thisYear - m.birthYear)} বছর
            </Badge>
          </div>
          <h3 className="bb-card-title">{m.name}</h3>
          <p className="bb-dcard-role">
            {religionLabel(m.religion)} · {maritalLabel(m.maritalStatus)}
          </p>
        </div>
      </div>
      <MetaList items={[{ icon: 'book', text: m.education }, { icon: 'briefcase', text: m.profession }, { icon: 'pin', text: m.address }]} />
      <dl className="flex flex-col gap-2 text-body-sm">
        <div>
          <dt className="text-label">পরিবার</dt>
          <dd className="text-ink-muted">{m.familyMembers}</dd>
        </div>
        <div>
          <dt className="text-label">যেমন জীবনসঙ্গী চান</dt>
          <dd className="text-ink-muted">{m.preference}</dd>
        </div>
      </dl>
      <p className="text-caption text-ink-subtle">নিবন্ধন: {formatDate(m.createdAt)}</p>
      <div className="bb-dcard-foot">
        <PhoneLink phone={m.phone} />
        <ContactActions phone={m.phone} whatsapp={m.whatsapp} compact />
      </div>
      <PostActions id={m.id} ownerId={m.ownerId} manage={manage} report={report} doneLabel="বিয়ে ঠিক হয়েছে" />
    </article>
  );
}

export function MatrimonyList() {
  const [{ q, gender, religion }, setP] = useQueryStates({ q: parseAsString.withDefault(''), gender: parseAsStringLiteral(GENDER_TABS).withDefault('all'), religion: parseAsStringLiteral(RELIGION_VALUES) });
  const search = useDebounce(q.trim());
  const list = useMatrimonials({ gender: gender === 'all' ? undefined : gender, religion: religion ?? undefined, search: search || undefined });
  const items = flatPages(list.data);

  return (
    <div className="container-page flex flex-col gap-5">
      <PageHeader eyebrow="বিয়ে" title="পাত্র-পাত্রী" action={<Button href="/marriage/register" iconLeft="plus">বায়োডাটা দিন</Button>} />
      <NoticeBanner items={['বিয়ের আগে পরিবারসহ নিজে খোঁজখবর নিন।', 'টাকা বা উপহার চাইলে সতর্ক থাকুন এবং ‘রিপোর্ট’ করুন।', 'ভুয়া বায়োডাটা দিলে অ্যাকাউন্ট স্থায়ীভাবে বন্ধ করা হয়।']} />
      <Tabs
        label="পাত্র না পাত্রী"
        variant="pill"
        value={gender}
        onChange={(v) => void setP({ gender: v === 'all' ? null : v })}
        items={[{ value: 'all', label: 'সব' }, ...GENDERS.map(([value, label]) => ({ value, label }))]}
      />
      <FilterBar
        query={q}
        onQuery={(v) => void setP({ q: v || null })}
        placeholder="পেশা, শিক্ষা বা এলাকা"
        chips={[{ value: 'all', label: 'সব ধর্ম' }, ...RELIGIONS.map(([value, label]) => ({ value, label }))]}
        chipValue={religion ?? 'all'}
        onChip={(v) => void setP({ religion: v === 'all' ? null : (v as (typeof RELIGION_VALUES)[number]) })}
        count={list.isPending ? undefined : totalOf(list.data)}
        countLabel="টি বায়োডাটা"
        onClear={q || gender !== 'all' || religion ? () => void setP({ q: null, gender: null, religion: null }) : undefined}
      />
      {list.isPending ? (
        <CardGridSkeleton count={4} height={320} keyPrefix="matrimony" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="rings" title="কোনো বায়োডাটা পাওয়া যায়নি" action={<Button href="/marriage/register" iconLeft="plus">বায়োডাটা দিন</Button>} />
      ) : (
        <>
          <div className={cn('grid gap-4 md:grid-cols-2 xl:grid-cols-3', list.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {items.map((m) => (
              <MatrimonyCard key={m.id} m={m} />
            ))}
          </div>
          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
        </>
      )}
    </div>
  );
}

export function MatrimonyForm() {
  const create = useCreateMatrimonial();
  const [done, setDone] = useState(false);
  const form = useForm<CreateMatrimonyIn, unknown, CreateMatrimonyInput>({
    resolver: zodResolver(createMatrimonySchema),
    defaultValues: { name: '', birthYear: '', education: '', profession: '', familyMembers: '', preference: '', address: '', phone: '', whatsapp: true, images: [], truthful: false, website: '' },
  });
  const { errors } = form.formState;
  const gender = useWatch({ control: form.control, name: 'gender' });
  const minAge = MIN_AGE[gender ?? 'bride'];
  const years = Array.from({ length: 50 }, (_, i) => String(thisYear - minAge - i));
  const submit = form.handleSubmit((v) => create.mutate(v, { onSuccess: () => setDone(true), onError: (e) => applyApiErrors(form, e) }));
  const card = 'flex flex-col gap-5 rounded-lg border border-line bg-surface p-5';

  return (
    <div className="container-narrow flex flex-col gap-5">
      <PageHeader eyebrow="পাত্র-পাত্রী" title="বায়োডাটা দিন" back={{ href: '/marriage', label: 'পাত্র-পাত্রী' }} />
      {done ? (
        <PostedSuccess title="বায়োডাটা প্রকাশিত হয়েছে" href="/marriage" listLabel="তালিকা দেখুন" />
      ) : (
        <RequireSignIn title="বায়োডাটা দিতে সাইন ইন করুন">
          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <fieldset className={card}>
              <legend className="text-h4 px-1">ব্যক্তিগত তথ্য</legend>
              <Controller control={form.control} name="gender" render={({ field }) => <ChoiceGroup required label="বায়োডাটা কার" options={GENDERS.map(([value, label]) => ({ value, label }))} value={field.value ?? ''} onChange={field.onChange} error={errors.gender?.message} />} />
              <TextField label="পূর্ণ নাম" required {...form.register('name')} error={errors.name?.message} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Select label="জন্ম সাল" required placeholder="বেছে নিন" options={years.map((y) => ({ value: y, label: `${bn(y)} (${bn(thisYear - Number(y))} বছর)` }))} {...form.register('birthYear')} error={errors.birthYear?.message} />
                <Select label="শিক্ষাগত যোগ্যতা" required placeholder="বেছে নিন" options={[...EDUCATION]} {...form.register('education')} error={errors.education?.message} />
              </div>
              <Controller control={form.control} name="religion" render={({ field }) => <ChoiceGroup required label="ধর্ম" options={RELIGIONS.map(([value, label]) => ({ value, label }))} value={field.value ?? ''} onChange={field.onChange} error={errors.religion?.message} />} />
              <Controller control={form.control} name="maritalStatus" render={({ field }) => <ChoiceGroup required label="বৈবাহিক অবস্থা" options={MARITAL.map(([value, label]) => ({ value, label }))} value={field.value ?? ''} onChange={field.onChange} error={errors.maritalStatus?.message} />} />
              <TextField label="পেশা" required placeholder="যেমন: স্কুল শিক্ষক" {...form.register('profession')} error={errors.profession?.message} />
              <Controller control={form.control} name="images" render={({ field }) => <FileDrop label="ছবি" optional max={1} value={field.value ?? []} onChange={field.onChange} />} />
            </fieldset>

            <fieldset className={card}>
              <legend className="text-h4 px-1">পরিবার ও প্রত্যাশা</legend>
              <TextArea label="পরিবারের সদস্য" required rows={3} placeholder="যেমন: বাবা (ব্যবসায়ী), মা (গৃহিণী), ১ ভাই, ১ বোন" {...form.register('familyMembers')} error={errors.familyMembers?.message} />
              <TextArea label="যেমন জীবনসঙ্গী চান" required rows={3} placeholder="যেমন: শিক্ষিত, নামাজি, বগুড়ার মধ্যে" {...form.register('preference')} error={errors.preference?.message} />
            </fieldset>

            <fieldset className={card}>
              <legend className="text-h4 px-1">যোগাযোগ</legend>
              <TextField label="ঠিকানা" required icon="pin" {...form.register('address')} error={errors.address?.message} />
              <TextField label="মোবাইল নম্বর" required inputMode="tel" icon="phone" {...form.register('phone')} error={errors.phone?.message} />
              <Controller control={form.control} name="whatsapp" render={({ field }) => <Checkbox label="এই নম্বরে হোয়াটসঅ্যাপ আছে" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
            </fieldset>

            <div className={cn('rounded-lg border p-4', errors.truthful ? 'border-emergency' : 'border-line bg-surface')}>
              <Controller
                control={form.control}
                name="truthful"
                render={({ field }) => <Checkbox label="সব তথ্য সত্য। ভুয়া বায়োডাটা দিলে অ্যাকাউন্ট স্থায়ীভাবে বন্ধ হবে।" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
              />
              {errors.truthful && <p className="bb-field-error pt-2">{errors.truthful.message}</p>}
            </div>

            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
            {errors.root && <Alert tone="danger" title={errors.root.message} />}
            <Button type="submit" size="lg" block loading={create.isPending} iconLeft="check">
              বায়োডাটা প্রকাশ করুন
            </Button>
          </form>
        </RequireSignIn>
      )}
    </div>
  );
}
