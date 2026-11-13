'use client';

import Link from 'next/link';
import { parseAsBoolean, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useListParams } from '@/hooks/useListParams';
import { siteUrl } from '@/lib/env';
import { bn, daysUntil, formatDate, formatPhone } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Alert } from '@/components/ui/Misc';
import { DateCell, TitleCell } from '@/components/admin/Cell';
import { BulkBar, DataTable, type Column } from '@/components/admin/DataTable';
import { ReasonDialog } from '@/components/admin/Dialogs';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { Menu, MenuItem } from '@/components/admin/Menu';
import { PageHeader } from '@/components/admin/PageHeader';
import { Sheet } from '@/components/admin/Sheet';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Toolbar } from '@/components/admin/Toolbar';
import { EmptyState } from '@/components/shared/States';
import { RequirePermission } from '@/features/auth';
import { posts, useExtend, useFeature, useRemovePost, useRestorePost, useVerify } from '../api/posts.api';
import { POST_KINDS, POST_STATUSES, postKindLabel, postPath, REMOVE_REASONS, type AdminPost } from '../schemas/post.schema';

const KINDS = POST_KINDS.map((k) => k.value);
const STATUSES = POST_STATUSES.map((s) => s.value);

function Expiry({ at }: { at: string | null }) {
  if (!at) return <span className="text-ink-subtle">—</span>;
  const d = daysUntil(at);
  return d < 0 ? <span className="text-ink-muted">শেষ হয়েছে</span> : <span className={d <= 3 ? 'text-warning font-semibold' : undefined}>{bn(d)} দিন বাকি</span>;
}

/** Feature / verify / extend / remove-or-restore for one post, as a menu. */
function PostMenu({ p, onRemove }: { p: AdminPost; onRemove: () => void }) {
  const feature = useFeature();
  const verify = useVerify();
  const extend = useExtend();
  const restore = useRestorePost();
  const removed = p.status === 'removed';
  return (
    <Menu label="পোস্টের কাজ" trigger={({ open, toggle }) => <IconButton icon="more" label="আরও কাজ" size="sm" aria-expanded={open} onClick={toggle} />}>
      {(close) => (
        <>
          <MenuItem disabled={removed} onSelect={() => { feature.mutate({ id: p.id, body: { value: !p.featured } }); close(); }}>
            <Icon name="star" size={20} />
            {p.featured ? 'ফিচার্ড থেকে সরান' : 'ফিচার্ড করুন'}
          </MenuItem>
          <MenuItem disabled={removed} onSelect={() => { verify.mutate({ id: p.id, body: { value: !p.verified } }); close(); }}>
            <Icon name="verified" size={20} />
            {p.verified ? 'যাচাইকৃত চিহ্ন সরান' : 'যাচাইকৃত করুন'}
          </MenuItem>
          {[7, 15, 30].map((d) => (
            <MenuItem key={d} disabled={removed} onSelect={() => { extend.mutate({ id: p.id, body: { days: d } }); close(); }}>
              <Icon name="clock" size={20} />
              মেয়াদ {bn(d)} দিন বাড়ান
            </MenuItem>
          ))}
          <div className="mt-1 border-t border-line pt-1">
            {removed ? (
              <MenuItem onSelect={() => { restore.mutate({ id: p.id }); close(); }}>
                <Icon name="undo" size={20} />
                পোস্ট ফিরিয়ে আনুন
              </MenuItem>
            ) : (
              <MenuItem tone="emergency" onSelect={() => { onRemove(); close(); }}>
                <Icon name="trash" size={20} />
                পোস্ট সরান
              </MenuItem>
            )}
          </div>
        </>
      )}
    </Menu>
  );
}

function PostSheet({ p, onClose, onRemove }: { p: AdminPost; onClose: () => void; onRemove: () => void }) {
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={p.title} description={postKindLabel(p.kind)} footer={<><a className="bb-btn bb-btn-ghost bb-btn-md mr-auto" href={siteUrl(postPath(p.kind, p.id))} target="_blank" rel="noopener noreferrer">সাইটে দেখুন</a><PostMenu p={p} onRemove={onRemove} /></>}>
      {p.status === 'removed' && p.removedReason && <Alert tone="danger" title="সরানো হয়েছে">{p.removedReason}</Alert>}
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={p.status} />
        {p.featured && <Badge tone="featured">ফিচার্ড</Badge>}
        {p.verified && <Badge tone="verified">যাচাইকৃত</Badge>}
        {p.reports > 0 && (
          <Badge tone="danger" icon="flag">
            {bn(p.reports)}টি রিপোর্ট
          </Badge>
        )}
      </div>
      {p.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {p.images.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element -- uploaded photo
            <img key={src} src={src} alt="" className="size-28 shrink-0 rounded-md border border-line object-cover" />
          ))}
        </div>
      )}
      <p className="text-body whitespace-pre-line">{p.body}</p>
      <dl className="bb-dl">
        <dt>পোস্টদাতা</dt>
        <dd>
          <Link className="bb-linkbtn" href={`/users?open=${p.owner.id}`}>
            {p.owner.name}
          </Link>
          {p.owner.banned && (
            <Badge tone="danger" icon={null} className="ml-2">
              নিষিদ্ধ
            </Badge>
          )}
        </dd>
        <dt>ফোন</dt>
        <dd>{formatPhone(p.phone)}</dd>
        <dt>ঠিকানা</dt>
        <dd>{p.address || '—'}</dd>
        <dt>প্রকাশ</dt>
        <dd>{formatDate(p.createdAt)}</dd>
        <dt>মেয়াদ</dt>
        <dd>
          <Expiry at={p.expiresAt} />
        </dd>
        <dt>দেখা হয়েছে</dt>
        <dd>{bn(p.views)} বার</dd>
      </dl>
    </Sheet>
  );
}

export function PostsPage() {
  const lp = useListParams();
  const [f, setF] = useQueryStates({ kind: parseAsStringLiteral(KINDS), status: parseAsStringLiteral(STATUSES), featured: parseAsBoolean, open: parseAsString });
  const list = posts.useList({ page: lp.page, search: lp.search, sort: lp.sort ?? '-createdAt', kind: f.kind ?? undefined, status: f.status ?? undefined, featured: f.featured ?? undefined });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<string[] | null>(null);
  const remove = useRemovePost();
  const current = list.data?.items.find((x) => x.id === f.open);
  const filtered = Boolean(lp.q || f.kind || f.status || f.featured);

  const columns: Column<AdminPost>[] = [
    { key: 'title', header: 'পোস্ট', primary: true, cell: (p) => <TitleCell title={p.title} sub={postKindLabel(p.kind)} /> },
    { key: 'owner', header: 'পোস্টদাতা', cell: (p) => <span className={p.owner.banned ? 'text-emergency' : undefined}>{p.owner.name}</span> },
    {
      key: 'status',
      header: 'অবস্থা',
      cell: (p) => (
        <span className="flex flex-wrap gap-1">
          <StatusBadge status={p.status} />
          {p.featured && <Badge tone="featured">ফিচার্ড</Badge>}
          {p.verified && <Badge tone="verified">যাচাইকৃত</Badge>}
        </span>
      ),
    },
    { key: 'reports', header: 'রিপোর্ট', sort: 'reports', align: 'end', cell: (p) => (p.reports ? <span className="font-semibold text-emergency">{bn(p.reports)}</span> : <span className="text-ink-subtle">০</span>) },
    { key: 'expires', header: 'মেয়াদ', sort: 'expiresAt', cell: (p) => <Expiry at={p.expiresAt} /> },
    { key: 'created', header: 'প্রকাশ', sort: 'createdAt', cell: (p) => <DateCell value={p.createdAt} /> },
  ];

  return (
    <RequirePermission permission="posts.manage">
      <PageHeader title="পোস্ট" />
      <Toolbar
        query={lp.q}
        onQuery={lp.setQ}
        placeholder="শিরোনাম, ফোন বা পোস্টদাতা"
        filters={
          <>
            <FilterSelect label="ধরন" value={f.kind} onChange={(v) => { void setF({ kind: v }); lp.resetPage(); }} options={POST_KINDS} />
            <FilterSelect label="অবস্থা" value={f.status} onChange={(v) => { void setF({ status: v }); lp.resetPage(); }} options={POST_STATUSES} />
            <FilterSelect label="ফিচার্ড" value={f.featured ? 'yes' : ''} onChange={(v) => { void setF({ featured: v ? true : null }); lp.resetPage(); }} options={[{ value: 'yes', label: 'শুধু ফিচার্ড' }]} />
          </>
        }
        count={list.data?.meta.total}
        countLabel="টি পোস্ট"
        onClear={filtered ? () => { lp.setQ(''); void setF({ kind: null, status: null, featured: null }); } : undefined}
      />
      <DataTable
        label="কমিউনিটি পোস্ট"
        rows={list.data?.items}
        columns={columns}
        isPending={list.isPending}
        error={list.error}
        onRetry={list.refetch}
        meta={list.data?.meta}
        onPage={lp.setPage}
        sort={lp.sort ?? '-createdAt'}
        onSort={lp.setSort}
        selected={selected}
        onSelect={setSelected}
        dimmed={list.isPlaceholderData}
        onRowClick={(p) => void setF({ open: p.id })}
        empty={<EmptyState icon="document" title="কোনো পোস্ট পাওয়া যায়নি" />}
        rowActions={(p) => <PostMenu p={p} onRemove={() => setRemoving([p.id])} />}
      />
      <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
        <Button size="sm" variant="emergency" iconLeft="trash" onClick={() => setRemoving([...selected])}>
          সরান
        </Button>
      </BulkBar>
      {current && <PostSheet p={current} onClose={() => void setF({ open: null })} onRemove={() => setRemoving([current.id])} />}
      <ReasonDialog
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={removing && removing.length > 1 ? `${bn(removing.length)}টি পোস্ট সরাবেন?` : 'পোস্টটি সরাবেন?'}
        description="কারণটি পোস্টদাতাকে জানানো হবে। পরে ‘ফিরিয়ে আনুন’ দিয়ে ফেরানো যাবে।"
        reasons={REMOVE_REASONS}
        confirmLabel="সরান"
        pending={remove.isPending}
        onSubmit={async (body) => {
          await Promise.all(removing!.map((id) => remove.mutateAsync({ id, body })));
          setRemoving(null);
          setSelected(new Set());
        }}
      />
    </RequirePermission>
  );
}
