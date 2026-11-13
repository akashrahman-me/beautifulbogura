'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { useListParams } from '@/hooks/useListParams';
import { createResource } from '@/lib/resource';
import { formatDate, timeAgo } from '@/lib/utils';
import { roleLabel } from '@/lib/permissions';
import { Badge } from '@/components/ui/Badge';
import { TextField } from '@/components/ui/Field';
import { PersonCell, TitleCell } from '@/components/admin/Cell';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { PageHeader } from '@/components/admin/PageHeader';
import { Sheet } from '@/components/admin/Sheet';
import { Toolbar } from '@/components/admin/Toolbar';
import { EmptyState } from '@/components/shared/States';
import { RequirePermission } from '@/features/auth';
import { staff } from '@/features/staff/components/StaffPage';
import { actionLabel, AUDIT_ACTIONS, RESOURCE_TYPES, type AuditEntry, type AuditQuery } from '../schemas/audit.schema';

export const audit = createResource<AuditEntry, never, AuditQuery>('/admin/audit', 'অডিট');
const show = (v: unknown) => (v == null || v === '' ? '—' : Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? 'হ্যাঁ' : 'না') : String(v));

function EntrySheet({ e, onClose }: { e: AuditEntry; onClose: () => void }) {
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={`${e.resource.label} — ${actionLabel(e.action)}`}>
      <dl className="bb-dl">
        <dt>কে</dt>
        <dd>
          {e.actor.name} ({roleLabel(e.actor.role)})
        </dd>
        <dt>কখন</dt>
        <dd>
          {formatDate(e.at)} · {new Date(e.at).toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' })}
        </dd>
        <dt>কী</dt>
        <dd>{RESOURCE_TYPES.find((t) => t.value === e.resource.type)?.label ?? e.resource.type} · {e.resource.label}</dd>
        <dt>কারণ</dt>
        <dd>{e.reason ?? '—'}</dd>
      </dl>
      {e.changes && Object.keys(e.changes).length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-h4">পরিবর্তন</h3>
          <div className="bb-table-wrap">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>ঘর</th>
                  <th>আগে</th>
                  <th>পরে</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(e.changes).map(([k, [a, b]]) => (
                  <tr key={k}>
                    <td className="font-semibold">{k}</td>
                    <td className="text-ink-muted line-through decoration-[var(--emergency)]">{show(a)}</td>
                    <td>{show(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </Sheet>
  );
}

export function AuditPage() {
  const lp = useListParams();
  const [f, setF] = useQueryStates({ actor: parseAsString, action: parseAsString, type: parseAsString, from: parseAsString, to: parseAsString, open: parseAsString });
  const staffList = staff.useList({ sort: 'name' });
  const list = audit.useList({ page: lp.page, search: lp.search, sort: '-at', actor: f.actor ?? undefined, action: f.action ?? undefined, type: f.type ?? undefined, from: f.from ?? undefined, to: f.to ?? undefined });
  const current = list.data?.items.find((e) => e.id === f.open);
  const active = Boolean(f.actor || f.action || f.type || f.from || f.to);
  const set = (patch: Parameters<typeof setF>[0]) => {
    void setF(patch);
    lp.resetPage();
  };

  const columns: Column<AuditEntry>[] = [
    { key: 'when', header: 'কখন', cell: (e) => <TitleCell title={timeAgo(e.at)} sub={formatDate(e.at)} /> },
    { key: 'who', header: 'কে', cell: (e) => <PersonCell name={e.actor.name} sub={roleLabel(e.actor.role)} tone="neutral" /> },
    { key: 'what', header: 'কী করেছেন', primary: true, cell: (e) => <TitleCell title={`${e.resource.label} — ${actionLabel(e.action)}`} sub={e.reason ?? undefined} /> },
    { key: 'type', header: 'বিভাগ', cell: (e) => <Badge tone="neutral" icon={null}>{RESOURCE_TYPES.find((t) => t.value === e.resource.type)?.label ?? e.resource.type}</Badge> },
  ];

  return (
    <RequirePermission permission="audit.view">
      <PageHeader title="অডিট লগ" />
      <Toolbar
        query={lp.q}
        onQuery={lp.setQ}
        placeholder="নাম, পোস্ট বা কারণ"
        filters={
          <>
            <FilterSelect label="কে" value={f.actor} onChange={(v) => set({ actor: v })} options={(staffList.data?.items ?? []).filter((s) => s.status === 'active').map((s) => ({ value: s.id, label: s.name }))} allLabel="সবাই" />
            <FilterSelect label="কাজ" value={f.action} onChange={(v) => set({ action: v })} options={AUDIT_ACTIONS} />
            <FilterSelect label="বিভাগ" value={f.type} onChange={(v) => set({ type: v })} options={RESOURCE_TYPES} />
            <TextField label="থেকে" type="date" className="min-w-40" value={f.from ?? ''} onChange={(e) => set({ from: e.target.value || null })} />
            <TextField label="পর্যন্ত" type="date" className="min-w-40" value={f.to ?? ''} onChange={(e) => set({ to: e.target.value || null })} />
          </>
        }
        count={list.data?.meta.total}
        countLabel="টি কাজ"
        onClear={lp.q || active ? () => { lp.setQ(''); void setF({ actor: null, action: null, type: null, from: null, to: null }); } : undefined}
      />
      <DataTable
        label="অডিট লগ"
        rows={list.data?.items}
        columns={columns}
        isPending={list.isPending}
        error={list.error}
        onRetry={list.refetch}
        meta={list.data?.meta}
        onPage={lp.setPage}
        dimmed={list.isPlaceholderData}
        onRowClick={(e) => void setF({ open: e.id })}
        empty={<EmptyState icon="activity" title="কিছু পাওয়া যায়নি" />}
      />
      {current && <EntrySheet e={current} onClose={() => void setF({ open: null })} />}
    </RequirePermission>
  );
}
