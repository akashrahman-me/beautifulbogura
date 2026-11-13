'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { createResource } from '@/lib/resource';
import { formatPhone } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { DateCell, PersonCell } from '@/components/admin/Cell';
import { CrudPage } from '@/components/admin/CrudPage';
import type { Column } from '@/components/admin/DataTable';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { labelOf, TRADES } from '@/config/catalog';
import { RequirePermission } from '@/features/auth';
import { workerEmpty, workerFields, workerSchema, type Worker, type WorkerQuery } from '../schemas/worker.schema';

export const workers = createResource<Worker, unknown, WorkerQuery>('/admin/workers', 'কারিগরের তথ্য');

const columns: Column<Worker>[] = [
  { key: 'name', header: 'নাম', primary: true, sort: 'name', cell: (w) => <PersonCell name={w.name} sub={w.address} tone="accent" /> },
  { key: 'trades', header: 'কাজ', cell: (w) => <span className="flex flex-wrap gap-1">{w.trades.map((t) => <Badge key={t} tone="accent" icon={null}>{labelOf(TRADES, t)}</Badge>)}</span> },
  { key: 'phone', header: 'ফোন', cell: (w) => formatPhone(w.phone) },
  { key: 'status', header: 'অবস্থা', cell: (w) => (w.hidden ? <Badge tone="warning" icon="eye-off">লুকানো</Badge> : <Badge tone="success" dot icon={null}>প্রকাশিত</Badge>) },
  { key: 'created', header: 'নিবন্ধন', sort: 'createdAt', cell: (w) => <DateCell value={w.createdAt} /> },
];

export function WorkersPage() {
  const [f, setF] = useQueryStates({ trade: parseAsString });
  return (
    <RequirePermission permission="content.manage">
      <CrudPage
        title="কারিগর"
        noun="কারিগর"
        resource={workers}
        columns={columns}
        searchPlaceholder="নাম বা নম্বর"
        emptyIcon="wrench"
        filters={{ trade: f.trade ?? undefined }}
        filtersActive={!!f.trade}
        clearFilters={() => void setF({ trade: null })}
        filterNode={<FilterSelect label="কাজ" value={f.trade} onChange={(v) => void setF({ trade: v })} options={TRADES} />}
        sheet={{ schema: workerSchema, fields: workerFields, empty: workerEmpty, toForm: (w) => ({ name: w.name, phone: w.phone, trades: w.trades, address: w.address, hidden: w.hidden }), title: (w) => w?.name ?? 'কারিগর' }}
      />
    </RequirePermission>
  );
}
