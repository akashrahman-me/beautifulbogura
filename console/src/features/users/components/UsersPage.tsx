'use client';

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useListParams } from '@/hooks/useListParams';
import { bn, formatDate, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Alert, Avatar } from '@/components/ui/Misc';
import { DateCell, PersonCell } from '@/components/admin/Cell';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog, ReasonDialog } from '@/components/admin/Dialogs';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { PageHeader } from '@/components/admin/PageHeader';
import { Sheet } from '@/components/admin/Sheet';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Toolbar } from '@/components/admin/Toolbar';
import { EmptyState } from '@/components/shared/States';
import { PROVIDER_NAME, RequirePermission } from '@/features/auth';
import { posts } from '@/features/posts/api/posts.api';
import { postKindLabel } from '@/features/posts/schemas/post.schema';
import { useBan, useUnban, users } from '../api/users.api';
import { BAN_REASONS, type PublicUser } from '../schemas/user.schema';

const STATUSES = ['active', 'banned'] as const;
const PROVIDERS = ['google', 'facebook', 'apple'] as const;

function UserSheet({ u, onClose }: { u: PublicUser; onClose: () => void }) {
  const ban = useBan();
  const unban = useUnban();
  const [banning, setBanning] = useState(false);
  const [unbanning, setUnbanning] = useState(false);
  const theirPosts = posts.useList({ owner: u.id, limit: 50, sort: '-createdAt' });
  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      title={u.name}
      footer={
        u.status === 'banned' ? (
          <Button variant="secondary" iconLeft="undo" onClick={() => setUnbanning(true)}>
            নিষেধাজ্ঞা তুলে নিন
          </Button>
        ) : (
          <Button variant="emergency" iconLeft="ban" onClick={() => setBanning(true)}>
            নিষিদ্ধ করুন
          </Button>
        )
      }
    >
      <div className="flex items-center gap-4">
        <Avatar name={u.name} src={u.avatar} size="lg" />
        <div className="flex flex-col gap-1">
          <StatusBadge status={u.status} />
          <span className="text-body-sm text-ink-muted">
            {u.email ?? 'ইমেইল নেই'} · {PROVIDER_NAME[u.provider]}
          </span>
        </div>
      </div>
      {u.ban && (
        <Alert tone="danger" title={`${u.ban.by} নিষিদ্ধ করেছেন · ${formatDate(u.ban.at)}`}>
          {u.ban.reason}
        </Alert>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['মোট পোস্ট', u.posts],
          ['চালু', u.activePosts],
          ['সরানো', u.removedPosts],
          ['রিপোর্ট', u.reportsAgainst],
        ].map(([l, v]) => (
          <div key={l} className="bb-kpi">
            <span className="bb-kpi-value text-[26px] leading-9">{bn(v)}</span>
            <span className="bb-kpi-label">{l}</span>
          </div>
        ))}
      </div>
      <dl className="bb-dl">
        <dt>যোগ দিয়েছেন</dt>
        <dd>{formatDate(u.joinedAt)}</dd>
        <dt>শেষ দেখা</dt>
        <dd>{timeAgo(u.lastSeenAt)}</dd>
      </dl>
      <section className="flex flex-col gap-2">
        <h3 className="text-h4">পোস্ট</h3>
        {theirPosts.isPending ? (
          <div className="h-24 animate-pulse rounded-md bg-surface-sunken" />
        ) : theirPosts.data?.items.length ? (
          <ul className="flex flex-col divide-y divide-[var(--line)] rounded-lg border border-line">
            {theirPosts.data.items.map((p) => (
              <li key={p.id}>
                <a href={`/posts?open=${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-sunken">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-label">{p.title}</span>
                    <span className="text-caption text-ink-muted">
                      {postKindLabel(p.kind)} · {formatDate(p.createdAt)}
                    </span>
                  </span>
                  <StatusBadge status={p.status} />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-ink-muted">কোনো পোস্ট নেই।</p>
        )}
      </section>
      <ReasonDialog
        open={banning}
        onOpenChange={setBanning}
        icon="ban"
        title={`${u.name}-কে নিষিদ্ধ করবেন?`}
        description="তিনি আর পোস্ট দিতে পারবেন না এবং তাঁর সব চালু পোস্ট লুকানো হবে। কারণটি তাঁকে জানানো হবে।"
        reasons={BAN_REASONS}
        confirmLabel="নিষিদ্ধ করুন"
        pending={ban.isPending}
        onSubmit={(body) => ban.mutate({ id: u.id, body }, { onSuccess: () => setBanning(false) })}
      />
      <ConfirmDialog
        open={unbanning}
        onOpenChange={setUnbanning}
        icon="undo"
        title="নিষেধাজ্ঞা তুলে নেবেন?"
        description="তিনি আবার পোস্ট দিতে পারবেন। লুকানো পোস্ট নিজে থেকে ফিরে আসবে না; দরকার হলে পোস্ট পাতা থেকে ফেরান।"
        confirmLabel="নিষেধাজ্ঞা তুলে নিন"
        pending={unban.isPending}
        onConfirm={() => unban.mutate({ id: u.id }, { onSuccess: () => setUnbanning(false) })}
      />
    </Sheet>
  );
}

export function UsersPage() {
  const lp = useListParams();
  const [f, setF] = useQueryStates({ status: parseAsStringLiteral(STATUSES), provider: parseAsStringLiteral(PROVIDERS), open: parseAsString });
  const list = users.useList({ page: lp.page, search: lp.search, sort: lp.sort ?? '-joinedAt', status: f.status ?? undefined, provider: f.provider ?? undefined });
  // A deep link (?open=id) may point at a user not on this page.
  const fromList = list.data?.items.find((u) => u.id === f.open);
  const fetched = users.useOne(f.open && !fromList ? f.open : null);
  const current = fromList ?? fetched.data;

  const columns: Column<PublicUser>[] = [
    { key: 'name', header: 'নাম', primary: true, cell: (u) => <PersonCell name={u.name} sub={u.email ?? PROVIDER_NAME[u.provider]} src={u.avatar} /> },
    { key: 'status', header: 'অবস্থা', cell: (u) => <StatusBadge status={u.status} /> },
    { key: 'posts', header: 'পোস্ট', sort: 'posts', align: 'end', cell: (u) => bn(u.posts) },
    { key: 'reports', header: 'রিপোর্ট', sort: 'reportsAgainst', align: 'end', cell: (u) => (u.reportsAgainst ? <span className="font-semibold text-emergency">{bn(u.reportsAgainst)}</span> : '০') },
    { key: 'joined', header: 'যোগ দিয়েছেন', sort: 'joinedAt', cell: (u) => <DateCell value={u.joinedAt} /> },
  ];

  return (
    <RequirePermission permission="users.manage">
      <PageHeader title="ব্যবহারকারী" />
      <Toolbar
        query={lp.q}
        onQuery={lp.setQ}
        placeholder="নাম বা ইমেইল"
        filters={
          <>
            <FilterSelect label="অবস্থা" value={f.status} onChange={(v) => { void setF({ status: v }); lp.resetPage(); }} options={[{ value: 'active', label: 'সক্রিয়' }, { value: 'banned', label: 'নিষিদ্ধ' }]} />
            <FilterSelect label="সাইন ইন" value={f.provider} onChange={(v) => { void setF({ provider: v }); lp.resetPage(); }} options={PROVIDERS.map((p) => ({ value: p, label: PROVIDER_NAME[p] }))} />
          </>
        }
        count={list.data?.meta.total}
        countLabel="জন"
        onClear={lp.q || f.status || f.provider ? () => { lp.setQ(''); void setF({ status: null, provider: null }); } : undefined}
      />
      <DataTable
        label="ব্যবহারকারী"
        rows={list.data?.items}
        columns={columns}
        isPending={list.isPending}
        error={list.error}
        onRetry={list.refetch}
        meta={list.data?.meta}
        onPage={lp.setPage}
        sort={lp.sort ?? '-joinedAt'}
        onSort={lp.setSort}
        dimmed={list.isPlaceholderData}
        onRowClick={(u) => void setF({ open: u.id })}
        empty={<EmptyState icon="users" title="কাউকে পাওয়া যায়নি" />}
      />
      {current && <UserSheet u={current} onClose={() => void setF({ open: null })} />}
    </RequirePermission>
  );
}
