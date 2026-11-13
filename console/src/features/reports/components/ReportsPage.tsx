'use client';

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useListParams } from '@/hooks/useListParams';
import { siteUrl } from '@/lib/env';
import { bn, formatDate, formatPhone, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Alert } from '@/components/ui/Misc';
import { DateCell, TitleCell } from '@/components/admin/Cell';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ReasonDialog } from '@/components/admin/Dialogs';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { PageHeader } from '@/components/admin/PageHeader';
import { Sheet } from '@/components/admin/Sheet';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Toolbar } from '@/components/admin/Toolbar';
import { EmptyState } from '@/components/shared/States';
import { RequirePermission } from '@/features/auth';
import { POST_KINDS, postKindLabel, postPath, REMOVE_REASONS } from '@/features/posts/schemas/post.schema';
import { reports, useDismiss, useResolve } from '../api/reports.api';
import { REPORT_REASONS, type ReportGroup } from '../schemas/report.schema';

const STATUSES = ['open', 'dismissed', 'resolved'] as const;
const KINDS = POST_KINDS.map((k) => k.value);

function ReasonBadges({ g }: { g: ReportGroup }) {
  return (
    <span className="flex flex-wrap gap-1">
      {Object.entries(g.reasons)
        .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
        .map(([r, n]) => (
          <Badge key={r} tone={r === 'fake' ? 'danger' : 'neutral'} icon={null}>
            {REPORT_REASONS[r] ?? r} · {bn(n ?? 0)}
          </Badge>
        ))}
    </span>
  );
}

function ReportDetail({ g, onClose }: { g: ReportGroup; onClose: () => void }) {
  const dismiss = useDismiss();
  const resolve = useResolve();
  const [action, setAction] = useState<'remove' | 'ban' | null>(null);
  const open = g.status === 'open';
  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      title={g.post.title}
      description={`${postKindLabel(g.post.kind)} · ${bn(g.count)}টি রিপোর্ট`}
      footer={
        open && (
          <>
            <Button variant="ghost" className="mr-auto" loading={dismiss.isPending} onClick={() => dismiss.mutate({ id: g.id, body: {} }, { onSuccess: onClose })}>
              খারিজ করুন, পোস্ট থাকুক
            </Button>
            <Button variant="danger-ghost" iconLeft="trash" onClick={() => setAction('remove')}>
              পোস্ট সরান
            </Button>
            <Button variant="emergency" iconLeft="ban" onClick={() => setAction('ban')}>
              সরান ও নিষিদ্ধ করুন
            </Button>
          </>
        )
      }
    >
      {g.autoHidden && <Alert tone="warning" title="রিপোর্টের সংখ্যা সীমা ছাড়ানোয় পোস্টটি স্বয়ংক্রিয়ভাবে লুকানো আছে" />}
      {!open && (
        <Alert tone="info" title={`${g.decidedBy ?? ''} — ${g.status === 'dismissed' ? 'খারিজ করেছেন' : 'ব্যবস্থা নিয়েছেন'}`}>
          {g.decisionReason}
        </Alert>
      )}
      <section className="flex flex-col gap-3 rounded-lg border border-line p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info" icon={null}>
            {postKindLabel(g.post.kind)}
          </Badge>
          <StatusBadge status={g.post.status} />
          <a href={siteUrl(postPath(g.post.kind, g.post.id))} target="_blank" rel="noopener noreferrer" className="bb-linkbtn ml-auto">
            সাইটে দেখুন
          </a>
        </div>
        <p className="text-body whitespace-pre-line">{g.post.body}</p>
        <p className="text-body-sm text-ink-muted">ফোন: {formatPhone(g.post.phone)}</p>
      </section>
      <dl className="bb-dl">
        <dt>পোস্টদাতা</dt>
        <dd>
          {g.owner.name}
          {g.owner.banned && (
            <Badge tone="danger" icon={null} className="ml-2">
              নিষিদ্ধ
            </Badge>
          )}
        </dd>
        <dt>আগে সরানো পোস্ট</dt>
        <dd>{bn(g.owner.priorRemovals)}টি</dd>
        <dt>প্রথম রিপোর্ট</dt>
        <dd>{formatDate(g.firstAt)}</dd>
        <dt>কারণ</dt>
        <dd>
          <ReasonBadges g={g} />
        </dd>
      </dl>
      <section className="flex flex-col gap-2">
        <h3 className="text-h4">রিপোর্টকারীদের নোট</h3>
        <ul className="flex flex-col gap-2">
          {g.notes.map((n, i) => (
            <li key={i} className="rounded-md bg-surface-sunken px-3 py-2 text-body-sm">
              <span className="font-semibold">{REPORT_REASONS[n.reason] ?? n.reason}</span>
              {n.note && <span> — {n.note}</span>}
              <span className="block text-caption text-ink-subtle">{timeAgo(n.at)}</span>
            </li>
          ))}
        </ul>
      </section>
      <ReasonDialog
        open={action !== null}
        onOpenChange={(o) => !o && setAction(null)}
        title={action === 'ban' ? 'পোস্ট সরিয়ে ব্যবহারকারীকে নিষিদ্ধ করবেন?' : 'পোস্টটি সরাবেন?'}
        description={action === 'ban' ? 'নিষিদ্ধ হলে তিনি আর পোস্ট দিতে পারবেন না এবং তাঁর অন্য পোস্টও লুকানো হবে।' : 'কারণটি পোস্টদাতাকে জানানো হবে।'}
        reasons={REMOVE_REASONS}
        confirmLabel={action === 'ban' ? 'সরান ও নিষিদ্ধ করুন' : 'পোস্ট সরান'}
        pending={resolve.isPending}
        onSubmit={(body) => resolve.mutate({ id: g.id, body: { ...body, ban: action === 'ban' } }, { onSuccess: () => { setAction(null); onClose(); } })}
      />
    </Sheet>
  );
}

export function ReportsPage() {
  const lp = useListParams();
  const [f, setF] = useQueryStates({ status: parseAsStringLiteral(STATUSES).withDefault('open'), kind: parseAsStringLiteral(KINDS), open: parseAsString });
  const list = reports.useList({ page: lp.page, search: lp.search, sort: lp.sort ?? '-count', status: f.status, kind: f.kind ?? undefined });
  const current = list.data?.items.find((g) => g.id === f.open);
  const dismiss = useDismiss();

  const columns: Column<ReportGroup>[] = [
    { key: 'post', header: 'পোস্ট', primary: true, cell: (g) => <TitleCell title={g.post.title} sub={`${postKindLabel(g.post.kind)} · ${g.owner.name}`} /> },
    { key: 'count', header: 'রিপোর্ট', sort: 'count', align: 'end', cell: (g) => <span className="text-label">{bn(g.count)}</span> },
    { key: 'reasons', header: 'কারণ', cell: (g) => <ReasonBadges g={g} /> },
    { key: 'last', header: 'শেষ রিপোর্ট', sort: 'lastAt', cell: (g) => <DateCell value={g.lastAt} /> },
    { key: 'status', header: 'অবস্থা', cell: (g) => (g.autoHidden && g.status === 'open' ? <StatusBadge status="hidden" /> : <StatusBadge status={g.status} />) },
  ];

  return (
    <RequirePermission permission="reports.manage">
      <PageHeader title="রিপোর্ট" />
      <Tabs label="অবস্থা" variant="pill" value={f.status} onChange={(v) => void setF({ status: v === 'open' ? null : v, open: null })} items={[{ value: 'open', label: 'খোলা' }, { value: 'dismissed', label: 'খারিজ' }, { value: 'resolved', label: 'ব্যবস্থা নেওয়া' }]} />
      <Toolbar
        query={lp.q}
        onQuery={lp.setQ}
        placeholder="পোস্টের শিরোনাম বা পোস্টদাতা"
        filters={<FilterSelect label="ধরন" value={f.kind} onChange={(v) => { void setF({ kind: v }); lp.resetPage(); }} options={POST_KINDS} />}
        count={list.data?.meta.total}
        countLabel="টি পোস্টে রিপোর্ট"
        onClear={lp.q || f.kind ? () => { lp.setQ(''); void setF({ kind: null }); } : undefined}
      />
      <DataTable
        label="রিপোর্ট করা পোস্ট"
        rows={list.data?.items}
        columns={columns}
        isPending={list.isPending}
        error={list.error}
        onRetry={list.refetch}
        meta={list.data?.meta}
        onPage={lp.setPage}
        sort={lp.sort ?? '-count'}
        onSort={lp.setSort}
        dimmed={list.isPlaceholderData}
        onRowClick={(g) => void setF({ open: g.id })}
        empty={<EmptyState icon={f.status === 'open' ? 'check' : 'flag'} title={f.status === 'open' ? 'কোনো খোলা রিপোর্ট নেই' : 'কিছু পাওয়া যায়নি'} />}
        rowActions={(g) =>
          g.status === 'open' ? (
            <span className="inline-flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => dismiss.mutate({ id: g.id, body: {} })}>
                খারিজ
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void setF({ open: g.id })}>
                দেখুন
              </Button>
            </span>
          ) : null
        }
      />
      {current && <ReportDetail g={current} onClose={() => void setF({ open: null })} />}
    </RequirePermission>
  );
}
