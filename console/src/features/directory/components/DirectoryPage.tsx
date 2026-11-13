'use client';

import { parseAsBoolean, parseAsString, useQueryStates } from 'nuqs';
import { createResource } from '@/lib/resource';
import { bn, formatPhone } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { DateCell, PersonCell } from '@/components/admin/Cell';
import { CrudPage } from '@/components/admin/CrudPage';
import type { Column } from '@/components/admin/DataTable';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { DIRECTORY_TYPES, labelOf, RATABLE_TYPES } from '@/config/catalog';
import { RequirePermission } from '@/features/auth';
import { directoryEmpty, directoryFields, directorySchema, type DirectoryEntry, type DirectoryQuery } from '../schemas/directory.schema';

export const directory = createResource<DirectoryEntry, unknown, DirectoryQuery>('/admin/directory', 'তথ্য');

const columns: Column<DirectoryEntry>[] = [
  { key: 'name', header: 'নাম', primary: true, sort: 'name', cell: (e) => <PersonCell name={e.name} sub={e.role || labelOf(DIRECTORY_TYPES, e.type)} src={e.photo} tone="brand" /> },
  { key: 'type', header: 'তালিকা', cell: (e) => labelOf(DIRECTORY_TYPES, e.type) },
  { key: 'phone', header: 'ফোন', cell: (e) => (e.phone ? formatPhone(e.phone) : <span className="text-ink-subtle">—</span>) },
  {
    key: 'flags',
    header: 'অবস্থা',
    cell: (e) => (
      <span className="flex flex-wrap gap-1">
        {e.hidden ? <Badge tone="warning" icon="eye-off">লুকানো</Badge> : <Badge tone="success" dot icon={null}>প্রকাশিত</Badge>}
        {e.verified && <Badge tone="verified">যাচাইকৃত</Badge>}
        {RATABLE_TYPES.includes(e.type) && e.rating != null && (
          <Badge tone="neutral" icon="star">
            {bn(e.rating.toFixed(1))} ({bn(e.ratingCount)})
          </Badge>
        )}
      </span>
    ),
  },
  { key: 'updated', header: 'হালনাগাদ', sort: 'updatedAt', cell: (e) => <DateCell value={e.updatedAt} /> },
];

export function DirectoryPage() {
  const [f, setF] = useQueryStates({ type: parseAsString, verified: parseAsBoolean, hidden: parseAsBoolean });
  return (
    <RequirePermission permission="content.manage">
      <CrudPage
        title="তালিকা"
        noun="তথ্য"
        resource={directory}
        columns={columns}
        searchPlaceholder="নাম, পদবি, ঠিকানা বা নম্বর"
        emptyIcon="list"
        filters={{ type: f.type ?? undefined, verified: f.verified ?? undefined, hidden: f.hidden ?? undefined }}
        filtersActive={Boolean(f.type || f.verified || f.hidden)}
        clearFilters={() => void setF({ type: null, verified: null, hidden: null })}
        filterNode={
          <>
            <FilterSelect label="তালিকা" value={f.type} onChange={(v) => void setF({ type: v })} options={DIRECTORY_TYPES} allLabel="সব তালিকা" />
            <FilterSelect label="যাচাই" value={f.verified == null ? '' : f.verified ? 'yes' : 'no'} onChange={(v) => void setF({ verified: v == null ? null : v === 'yes' })} options={[{ value: 'yes', label: 'যাচাইকৃত' }, { value: 'no', label: 'যাচাই হয়নি' }]} />
            <FilterSelect label="দৃশ্যমান" value={f.hidden ? 'yes' : ''} onChange={(v) => void setF({ hidden: v ? true : null })} options={[{ value: 'yes', label: 'শুধু লুকানো' }]} />
          </>
        }
        sheet={{
          schema: directorySchema,
          fields: directoryFields,
          empty: { ...directoryEmpty, type: f.type ?? '' },
          toForm: (e) => ({ type: e.type, name: e.name, role: e.role, phone: e.phone, whatsapp: e.whatsapp, address: e.address, hours: e.hours, description: e.description, mapUrl: e.mapUrl, photo: e.photo, verified: e.verified, hidden: e.hidden }),
          title: (e) => e?.name ?? 'তথ্য',
        }}
      />
    </RequirePermission>
  );
}
