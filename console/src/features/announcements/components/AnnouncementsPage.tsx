'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { applyApiErrors } from '@/lib/form';
import { createResource } from '@/lib/resource';
import { bn, bnNumber, cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { Alert } from '@/components/ui/Misc';
import { DateCell, TitleCell } from '@/components/admin/Cell';
import { CrudPage } from '@/components/admin/CrudPage';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/Dialogs';
import { DocEditor } from '@/components/admin/DocEditor';
import { PageHeader } from '@/components/admin/PageHeader';
import { SpecForm, type FieldSpec } from '@/components/admin/SpecForm';
import { EmptyState } from '@/components/shared/States';
import { BLOOD_GROUPS } from '@/config/catalog';
import { RequirePermission } from '@/features/auth';
import {
  AUDIENCES, noticeFields, noticeSchema, pushSchema, slideEmpty, slideFields, slideSchema,
  type PushForm, type PushMessage, type PushQuery, type SiteNotice, type Slide,
} from '../schemas/announcement.schema';

export const slides = createResource<Slide, unknown, { page?: number; search?: string; sort?: string }>('/admin/slides', 'স্লাইড');
export const pushes = createResource<PushMessage, unknown, PushQuery>('/admin/push', 'নোটিফিকেশন');

const TABS = ['slides', 'notice', 'push'] as const;
const now = () => new Date().toISOString();
const live = (s: Slide) => s.active && (!s.startsAt || s.startsAt <= now()) && (!s.endsAt || s.endsAt >= now());

/** How the slide will look on the home page, in its tone. */
function SlidePreview({ s }: { s: Pick<Slide, 'tone' | 'icon' | 'eyebrow' | 'title'> }) {
  const bg = s.tone === 'brand' ? 'bg-brand text-on-brand' : s.tone === 'accent' ? 'bg-accent text-on-accent' : s.tone === 'gold' ? 'bg-gold text-on-gold' : 'bg-emergency text-on-emergency';
  return (
    <span className={cn('flex w-48 items-center gap-2 rounded-md px-3 py-2', bg)}>
      <Icon name={s.icon as IconName} size={18} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[11px] opacity-85">{s.eyebrow}</span>
        <span className="truncate text-label">{s.title}</span>
      </span>
    </span>
  );
}

const slideColumns: Column<Slide>[] = [
  { key: 'order', header: 'ক্রম', sort: 'order', align: 'end', hideOnCard: true, cell: (s) => bn(s.order) },
  { key: 'slide', header: 'স্লাইড', primary: true, cell: (s) => <SlidePreview s={s} /> },
  { key: 'cta', header: 'বোতাম', cell: (s) => <TitleCell title={s.cta.label} sub={s.cta.href} /> },
  { key: 'when', header: 'সময়', cell: (s) => (s.startsAt || s.endsAt ? `${s.startsAt ? formatDate(s.startsAt, false) : 'এখন'} – ${s.endsAt ? formatDate(s.endsAt, false) : 'চলবে'}` : 'সব সময়') },
  { key: 'status', header: 'অবস্থা', cell: (s) => (live(s) ? <Badge tone="success" dot icon={null}>দেখা যাচ্ছে</Badge> : s.active ? <Badge tone="info" dot icon={null}>নির্ধারিত</Badge> : <Badge tone="neutral" dot icon={null}>বন্ধ</Badge>) },
];

const pushFields = (audience: string): FieldSpec[] => [
  { name: 'title', label: 'শিরোনাম', type: 'text', required: true, wide: true, hint: '৬০ অক্ষরের মধ্যে' },
  { name: 'body', label: 'বার্তা', type: 'textarea', required: true, rows: 3, hint: '১৬০ অক্ষরের মধ্যে' },
  { name: 'url', label: 'চাপলে যে পাতা খুলবে', type: 'text', required: true, placeholder: '/blood-bank' },
  { name: 'audience', label: 'কাদের পাঠাবেন', type: 'choice', options: AUDIENCES, required: true },
  ...(audience === 'donors' ? [{ name: 'bloodGroup', label: 'রক্তের গ্রুপ', type: 'select', options: BLOOD_GROUPS, placeholder: 'সব গ্রুপ' } as FieldSpec] : []),
];

function PushPanel() {
  const send = pushes.useSave();
  const history = pushes.useList({ sort: '-sentAt' });
  const [confirm, setConfirm] = useState<PushForm | null>(null);
  const form = useForm<PushForm, unknown, ReturnType<typeof pushSchema.parse>>({ resolver: zodResolver(pushSchema), defaultValues: { title: '', body: '', url: '/', audience: 'all', bloodGroup: '' } });
  const audience = useWatch({ control: form.control, name: 'audience' });
  const columns: Column<PushMessage>[] = [
    { key: 'title', header: 'বার্তা', primary: true, cell: (p) => <TitleCell title={p.title} sub={p.body} /> },
    { key: 'audience', header: 'কাদের', cell: (p) => (p.audience === 'donors' ? `রক্তদাতা${p.bloodGroup ? ` (${p.bloodGroup})` : ''}` : 'সবাই') },
    { key: 'recipients', header: 'পৌঁছেছে', align: 'end', cell: (p) => `${bnNumber(p.recipients)} জন` },
    { key: 'sent', header: 'পাঠানো', cell: (p) => <DateCell value={p.sentAt} /> },
    { key: 'by', header: 'পাঠিয়েছেন', cell: (p) => p.sentBy },
  ];
  return (
    <>
      <form noValidate onSubmit={form.handleSubmit(() => setConfirm(form.getValues()))} className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-h3">নতুন নোটিফিকেশন</h2>
        <SpecForm form={form} fields={pushFields(audience)} />
        {form.formState.errors.root && <Alert tone="danger" title={form.formState.errors.root.message} />}
        <Button type="submit" iconLeft="bell" className="self-start">
          পাঠানোর আগে দেখুন
        </Button>
      </form>
      <h2 className="text-h2 pt-2">পাঠানো নোটিফিকেশন</h2>
      <DataTable label="পাঠানো নোটিফিকেশন" rows={history.data?.items} columns={columns} isPending={history.isPending} error={history.error} onRetry={history.refetch} empty={<EmptyState icon="bell" title="এখনো কিছু পাঠানো হয়নি" />} />
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        icon="bell"
        title="নোটিফিকেশন পাঠাবেন?"
        description={confirm ? `“${confirm.title}” — ${confirm.audience === 'donors' ? 'রক্তদাতাদের' : 'সবাইকে'} পাঠানো হবে। পাঠানোর পর ফেরানো যাবে না।` : ''}
        confirmLabel="পাঠান"
        pending={send.isPending}
        onConfirm={() =>
          send.mutate(
            { id: null, input: pushSchema.parse(confirm) },
            {
              onSuccess: () => {
                setConfirm(null);
                form.reset();
              },
              onError: (e) => {
                setConfirm(null);
                applyApiErrors(form, e);
              },
            },
          )
        }
      />
    </>
  );
}

export function AnnouncementsPage() {
  const [f, setF] = useQueryStates({ tab: parseAsStringLiteral(TABS).withDefault('slides'), edit: parseAsString, q: parseAsString });
  return (
    <RequirePermission permission="announcements.manage">
      {f.tab !== 'slides' && <PageHeader title="ঘোষণা" />}
      <Tabs label="ঘোষণার ধরন" value={f.tab} onChange={(v) => void setF({ tab: v === 'slides' ? null : v, edit: null, q: null })} items={[{ value: 'slides', label: 'হোম স্লাইড', icon: 'grid' }, { value: 'notice', label: 'সাইট নোটিশ', icon: 'megaphone' }, { value: 'push', label: 'নোটিফিকেশন', icon: 'bell' }]} />
      {f.tab === 'slides' && (
        <CrudPage
          title="হোম স্লাইড"
          noun="স্লাইড"
          resource={slides}
          columns={slideColumns}
          searchPlaceholder="শিরোনাম"
          emptyIcon="grid"
          sheet={{
            schema: slideSchema,
            fields: slideFields,
            empty: slideEmpty,
            toForm: (s) => ({ order: String(s.order), tone: s.tone, icon: s.icon, eyebrow: s.eyebrow, title: s.title, body: s.body, ctaLabel: s.cta.label, ctaHref: s.cta.href, startsAt: s.startsAt?.slice(0, 10) ?? '', endsAt: s.endsAt?.slice(0, 10) ?? '', active: s.active }),
            title: (s) => s?.title ?? 'স্লাইড',
            details: (s) => <SlidePreview s={s} />,
          }}
        />
      )}
      {f.tab === 'notice' && (
        <DocEditor
          path="/admin/site-notice"
          schema={noticeSchema}
          fields={noticeFields}
          toForm={(d: SiteNotice) => ({ enabled: d.enabled, severity: d.severity, title: d.title, body: d.body, linkLabel: d.linkLabel, linkHref: d.linkHref, expiresAt: d.expiresAt?.slice(0, 10) ?? '' })}
          savedMessage="সাইট নোটিশ হালনাগাদ হয়েছে"
        />
      )}
      {f.tab === 'push' && <PushPanel />}
    </RequirePermission>
  );
}

