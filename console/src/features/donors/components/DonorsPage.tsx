'use client';

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { createResource } from '@/lib/resource';
import { bn, daysSince, formatPhone } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { DateCell, PersonCell } from '@/components/admin/Cell';
import { CrudPage } from '@/components/admin/CrudPage';
import type { Column } from '@/components/admin/DataTable';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { BLOOD_GROUPS, DONATION_GAP_DAYS } from '@/config/catalog';
import { RequirePermission } from '@/features/auth';
import { donorEmpty, donorFields, donorSchema, type Donor, type DonorQuery } from '../schemas/donor.schema';

export const donors = createResource<Donor, unknown, DonorQuery>('/admin/donors', 'রক্তদাতার তথ্য');

/** Ready = 120+ days since the last donation; words, not colour alone. */
function Eligibility({ last }: { last: string | null }) {
  if (!last) return <Badge tone="neutral" icon={null}>তথ্য নেই</Badge>;
  const d = daysSince(last);
  return d >= DONATION_GAP_DAYS ? <Badge tone="success" icon="check">প্রস্তুত · {bn(d)} দিন</Badge> : <Badge tone="warning" icon="clock">এখনো নয় · {bn(DONATION_GAP_DAYS - d)} দিন বাকি</Badge>;
}

const columns: Column<Donor>[] = [
  { key: 'name', header: 'নাম', primary: true, sort: 'name', cell: (d) => <PersonCell name={d.name} sub={d.address} tone="accent" /> },
  { key: 'group', header: 'গ্রুপ', sort: 'group', cell: (d) => <Badge tone="danger" icon="drop">{d.group}</Badge> },
  { key: 'phone', header: 'ফোন', cell: (d) => formatPhone(d.phone) },
  { key: 'status', header: 'রক্ত দিতে', cell: (d) => <span className="flex flex-wrap gap-1"><Eligibility last={d.lastDonation} />{d.hidden && <Badge tone="warning" icon="eye-off">লুকানো</Badge>}</span> },
  { key: 'created', header: 'নিবন্ধন', sort: 'createdAt', cell: (d) => <DateCell value={d.createdAt} /> },
];
const STATUS = ['ready', 'not-yet', 'unknown'] as const;

export function DonorsPage() {
  const [f, setF] = useQueryStates({ group: parseAsString, status: parseAsStringLiteral(STATUS) });
  return (
    <RequirePermission permission="content.manage">
      <CrudPage
        title="রক্তদাতা"
        noun="রক্তদাতা"
        resource={donors}
        columns={columns}
        searchPlaceholder="নাম, নম্বর বা এলাকা"
        emptyIcon="drop"
        filters={{ group: f.group ?? undefined, status: f.status ?? undefined }}
        filtersActive={Boolean(f.group || f.status)}
        clearFilters={() => void setF({ group: null, status: null })}
        filterNode={
          <>
            <FilterSelect label="গ্রুপ" value={f.group} onChange={(v) => void setF({ group: v })} options={BLOOD_GROUPS} />
            <FilterSelect label="রক্ত দিতে" value={f.status} onChange={(v) => void setF({ status: v })} options={[{ value: 'ready', label: 'প্রস্তুত' }, { value: 'not-yet', label: 'এখনো নয়' }, { value: 'unknown', label: 'তথ্য নেই' }]} />
          </>
        }
        sheet={{
          schema: donorSchema,
          fields: donorFields,
          empty: donorEmpty,
          toForm: (d) => ({ name: d.name, group: d.group, phone: d.phone, address: d.address, lastDonation: d.lastDonation?.slice(0, 10) ?? '', hidden: d.hidden }),
          title: (d) => d?.name ?? 'রক্তদাতা',
        }}
      />
    </RequirePermission>
  );
}
