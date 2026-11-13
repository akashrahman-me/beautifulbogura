'use client';

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
import { bn, cn, formatDate, formatPhone, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { Alert } from '@/components/ui/Misc';
import { Pagination } from '@/components/admin/DataTable';
import { ReasonDialog } from '@/components/admin/Dialogs';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { PageHeader } from '@/components/admin/PageHeader';
import { Sheet } from '@/components/admin/Sheet';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { DIRECTORY_TYPES, labelOf } from '@/config/catalog';
import { RequirePermission } from '@/features/auth';
import { submissions, useApprove, useReject } from '../api/review.api';
import { FIELD_LABELS, kindLabel, REJECT_REASONS, SUBMISSION_KINDS, type Submission } from '../schemas/review.schema';

const STATUSES = ['pending', 'approved', 'rejected'] as const;
const KINDS = SUBMISSION_KINDS.map((k) => k.value);
const typing = (e: KeyboardEvent) => e.target instanceof Element && !!e.target.closest('input,textarea,select,[contenteditable],[role="dialog"]');

/** Render a submitted value for reading. Chambers and lists get their own shape. */
function Value({ k, v }: { k: string; v: unknown }) {
  if (v == null || v === '') return <span className="text-ink-subtle">—</span>;
  if (typeof v === 'boolean') return <>{v ? 'হ্যাঁ' : 'না'}</>;
  if (k === 'phone' && typeof v === 'string') return <a className="bb-phone" href={`tel:${v}`}>{formatPhone(v)}</a>;
  if (k === 'chambers' && Array.isArray(v)) {
    return (
      <ul className="flex flex-col gap-2">
        {(v as Record<string, unknown>[]).map((c, i) => (
          <li key={i} className="rounded-md border border-line p-3">
            <p className="font-semibold">{String(c.hospital)}</p>
            <p className="text-body-sm text-ink-muted">
              {String(c.time ?? '')} {c.fee ? `· ফি ৳ ${bn(String(c.fee))}` : ''} {c.serial ? `· সিরিয়াল ${formatPhone(String(c.serial))}` : ''}
            </p>
          </li>
        ))}
      </ul>
    );
  }
  if (Array.isArray(v)) return <>{v.join(', ')}</>;
  if (typeof v === 'string' && /^https?:\/\//.test(v)) return <a className="bb-linkbtn" href={v} target="_blank" rel="noopener noreferrer">{v}</a>;
  return <>{String(v)}</>;
}

function Detail({ item, onDone }: { item: Submission; onDone: () => void }) {
  const approve = useApprove();
  const reject = useReject();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>(item.data);
  const [rejecting, setRejecting] = useState(false);
  const pending = item.status === 'pending';
  const doApprove = () => approve.mutate({ id: item.id, body: editing ? { data: draft } : {} }, { onSuccess: onDone });

  // Keyboard: A approve, R reject — only for a pending item and when not typing.
  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (typing(e) || e.metaKey || e.ctrlKey) return;
      if (e.key === 'a') doApprove();
      if (e.key === 'r') setRejecting(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <article className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info" icon={null}>
            {kindLabel(item.kind)}
            {item.directoryType ? ` · ${labelOf(DIRECTORY_TYPES, item.directoryType)}` : ''}
          </Badge>
          <StatusBadge status={item.status} />
        </div>
        <h2 className="text-h2">{item.title}</h2>
        <p className="text-body-sm text-ink-muted">
          {item.submitter.name}
          {item.submitter.phone && <> · {formatPhone(item.submitter.phone)}</>} · {formatDate(item.submittedAt)} ({timeAgo(item.submittedAt)})
        </p>
      </header>
      {item.priorRejections > 0 && (
        <Alert tone="warning" title={`এই নম্বর থেকে আগে ${bn(item.priorRejections)}টি জমা বাতিল হয়েছে`} />
      )}
      {!pending && (
        <Alert tone={item.status === 'approved' ? 'success' : 'danger'} title={`${item.decidedBy ?? ''} ${item.status === 'approved' ? 'অনুমোদন দিয়েছেন' : 'বাতিল করেছেন'} · ${item.decidedAt ? formatDate(item.decidedAt) : ''}`}>
          {item.reason}
        </Alert>
      )}

      {editing ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(draft).map(([k, v]) =>
            typeof v === 'string' || typeof v === 'number' ? (
              String(v).length > 60 ? (
                <TextArea key={k} className="sm:col-span-2" label={FIELD_LABELS[k] ?? k} rows={3} value={String(v)} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
              ) : (
                <TextField key={k} label={FIELD_LABELS[k] ?? k} value={String(v)} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
              )
            ) : null,
          )}
          <p className="text-caption text-ink-muted sm:col-span-2">তালিকা ও চেম্বারের মতো তথ্য অনুমোদনের পর সংশ্লিষ্ট পাতা থেকে সম্পাদনা করুন।</p>
        </div>
      ) : (
        <dl className="bb-dl">
          {Object.entries(item.data).map(([k, v]) => (
            <div key={k} className="contents">
              <dt>{FIELD_LABELS[k] ?? k}</dt>
              <dd>
                <Value k={k} v={v} />
              </dd>
            </div>
          ))}
        </dl>
      )}

      {pending && (
        <div className="sticky bottom-0 -mx-1 flex flex-wrap gap-2 border-t border-line bg-surface px-1 pt-4 pb-1">
          <Button iconLeft="check" loading={approve.isPending} onClick={doApprove}>
            {editing ? 'সম্পাদনাসহ অনুমোদন দিন' : 'অনুমোদন দিন'}
            <span className="bb-kbd ml-1 hidden lg:inline-flex">A</span>
          </Button>
          <Button variant="secondary" iconLeft={editing ? 'x' : 'edit'} onClick={() => setEditing(!editing)}>
            {editing ? 'সম্পাদনা বাদ দিন' : 'সম্পাদনা করুন'}
          </Button>
          <Button variant="danger-ghost" iconLeft="x" className="ml-auto" onClick={() => setRejecting(true)}>
            বাতিল করুন
            <span className="bb-kbd ml-1 hidden lg:inline-flex">R</span>
          </Button>
        </div>
      )}
      <ReasonDialog
        open={rejecting}
        onOpenChange={setRejecting}
        title="জমা দেওয়া তথ্য বাতিল করবেন?"
        description="কারণটি জমাদাতাকে জানানো হবে।"
        reasons={REJECT_REASONS}
        confirmLabel="বাতিল করুন"
        pending={reject.isPending}
        onSubmit={(body) => reject.mutate({ id: item.id, body }, { onSuccess: () => { setRejecting(false); onDone(); } })}
      />
    </article>
  );
}

export function ReviewPage() {
  const [p, setP] = useQueryStates({
    status: parseAsStringLiteral(STATUSES).withDefault('pending'),
    kind: parseAsStringLiteral(KINDS),
    id: parseAsString,
    page: parseAsString,
  });
  const page = Number(p.page ?? 1);
  // Oldest first while pending (first come, first served); newest first for decided items.
  const list = submissions.useList({ status: p.status, kind: p.kind ?? undefined, page, sort: p.status === 'pending' ? 'submittedAt' : '-submittedAt' });
  const items = list.data?.items ?? [];
  const current = items.find((i) => i.id === p.id) ?? (p.id ? undefined : items[0]);
  const idx = current ? items.indexOf(current) : -1;
  const select = (i: Submission | undefined) => void setP({ id: i?.id ?? null });
  const next = () => select(items[idx + 1] ?? items[idx - 1]);

  // J / K move through the queue.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typing(e) || e.metaKey || e.ctrlKey) return;
      if (e.key === 'j' && items[idx + 1]) select(items[idx + 1]);
      if (e.key === 'k' && idx > 0) select(items[idx - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <RequirePermission permission="review.manage">
      <PageHeader
        title="যাচাই"
        meta={
          <span className="flex flex-wrap items-center gap-3 text-caption text-ink-muted">
            <Icon name="keyboard" size={16} />
            <span><span className="bb-kbd">J</span> / <span className="bb-kbd">K</span> পরের / আগের</span>
            <span><span className="bb-kbd">A</span> অনুমোদন</span>
            <span><span className="bb-kbd">R</span> বাতিল</span>
          </span>
        }
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Tabs label="অবস্থা" variant="pill" value={p.status} onChange={(v) => void setP({ status: v === 'pending' ? null : v, id: null, page: null })} items={[{ value: 'pending', label: 'অপেক্ষমাণ' }, { value: 'approved', label: 'অনুমোদিত' }, { value: 'rejected', label: 'বাতিল' }]} />
        <FilterSelect label="ধরন" value={p.kind} onChange={(v) => void setP({ kind: v, id: null, page: null })} options={SUBMISSION_KINDS} />
      </div>

      {list.error ? (
        <ErrorState error={list.error} onRetry={list.refetch} />
      ) : list.isPending ? (
        <div className="h-96 animate-pulse rounded-lg bg-surface-sunken" aria-busy="true" />
      ) : items.length === 0 ? (
        <div className="bb-table-wrap">
          <EmptyState icon={p.status === 'pending' ? 'check' : 'inbox'} title={p.status === 'pending' ? 'যাচাইয়ের অপেক্ষায় কিছু নেই' : 'কিছু পাওয়া যায়নি'} />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <div className="bb-table-wrap self-start">
            <ul aria-label="জমা দেওয়া তথ্যের তালিকা">
              {items.map((i) => (
                <li key={i.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    className={cn('flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-surface-sunken', current?.id === i.id && 'bg-brand-soft hover:bg-brand-soft')}
                    aria-current={current?.id === i.id || undefined}
                    onClick={() => {
                      select(i);
                      setSheetOpen(true);
                    }}
                  >
                    <span className="flex items-center gap-2 text-caption text-ink-muted">
                      {kindLabel(i.kind)} · {timeAgo(i.submittedAt)}
                      {i.priorRejections > 0 && <Icon name="alert" size={14} className="text-warning" label="আগে বাতিল হয়েছে" />}
                    </span>
                    <span className="text-label">{i.title}</span>
                    <span className="truncate text-body-sm text-ink-muted">{i.summary}</span>
                  </button>
                </li>
              ))}
            </ul>
            {list.data && list.data.meta.totalPages > 1 && <Pagination meta={list.data.meta} onPage={(n) => void setP({ page: n <= 1 ? null : String(n), id: null })} />}
          </div>
          <div className="hidden rounded-lg border border-line bg-surface p-6 lg:block">{current ? <Detail key={current.id} item={current} onDone={next} /> : <EmptyState icon="inbox" title="বাঁ দিক থেকে একটি বেছে নিন" />}</div>
          <div className="lg:hidden">
            <Sheet open={sheetOpen && !!current} onOpenChange={setSheetOpen} title={current ? kindLabel(current.kind) : ''}>
              {current && <Detail key={current.id} item={current} onDone={() => setSheetOpen(false)} />}
            </Sheet>
          </div>
        </div>
      )}
    </RequirePermission>
  );
}
