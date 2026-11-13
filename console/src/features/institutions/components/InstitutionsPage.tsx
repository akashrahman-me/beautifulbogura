'use client';

import Link from 'next/link';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { bn, formatPhone } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { DateCell, PersonCell, TitleCell } from '@/components/admin/Cell';
import { CrudPage } from '@/components/admin/CrudPage';
import type { Column } from '@/components/admin/DataTable';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { INSTITUTION_TYPES, labelOf, UNIONS } from '@/config/catalog';
import { RequirePermission } from '@/features/auth';
import { institutionEmpty, institutionFields, institutionSchema, noticeEmpty, noticeFields, noticeSchema, type Institution, type Notice } from '../schemas/institution.schema';
import { institutions, notices } from './resources';

const instColumns: Column<Institution>[] = [
  { key: 'name', header: 'নাম', primary: true, sort: 'name', cell: (i) => <PersonCell name={i.name} sub={i.eiin ? `ইআইআইএন ${bn(i.eiin)}` : labelOf(INSTITUTION_TYPES, i.type)} src={i.photo} tone="info" /> },
  { key: 'type', header: 'ধরন', cell: (i) => labelOf(INSTITUTION_TYPES, i.type) },
  { key: 'union', header: 'ইউনিয়ন', cell: (i) => i.union || '—' },
  { key: 'phone', header: 'ফোন', cell: (i) => (i.phone ? formatPhone(i.phone) : '—') },
  {
    key: 'flags',
    header: 'অবস্থা',
    cell: (i) => (
      <span className="flex flex-wrap gap-1">
        {i.hidden ? <Badge tone="warning" icon="eye-off">লুকানো</Badge> : <Badge tone="success" dot icon={null}>প্রকাশিত</Badge>}
        {i.claimedBy && <Badge tone="verified" title={`দায়িত্বে: ${i.claimedBy}`}>দাবিকৃত</Badge>}
        {i.lat == null && <Badge tone="neutral" icon="map">ম্যাপে নেই</Badge>}
      </span>
    ),
  },
  { key: 'notices', header: 'নোটিশ', align: 'end', cell: (i) => (i.notices ? <Link className="bb-linkbtn" href={`/institutions?tab=notices&institution=${i.id}`}>{bn(i.notices)}</Link> : '০') },
];

const noticeColumns: Column<Notice>[] = [
  { key: 'title', header: 'শিরোনাম', primary: true, cell: (n) => <TitleCell title={<>{n.pinned && <Badge tone="featured" icon="pin" className="mr-2">পিন</Badge>}{n.title}</>} sub={n.institutionName} /> },
  { key: 'created', header: 'প্রকাশ', sort: 'createdAt', cell: (n) => <DateCell value={n.createdAt} /> },
];

export function InstitutionsPage() {
  const [f, setF] = useQueryStates({ tab: parseAsStringLiteral(['list', 'notices'] as const).withDefault('list'), type: parseAsString, union: parseAsString, institution: parseAsString, q: parseAsString, page: parseAsString, sort: parseAsString, edit: parseAsString });
  return (
    <RequirePermission permission="content.manage">
      <Tabs label="বিভাগ" value={f.tab} onChange={(v) => void setF({ tab: v === 'list' ? null : v, type: null, union: null, institution: null, q: null, page: null, sort: null, edit: null })} items={[{ value: 'list', label: 'প্রতিষ্ঠান', icon: 'school' }, { value: 'notices', label: 'নোটিশ', icon: 'bell' }]} />
      {f.tab === 'list' ? (
        <CrudPage
          key="list"
          title="শিক্ষা প্রতিষ্ঠান"
          noun="প্রতিষ্ঠান"
          resource={institutions}
          columns={instColumns}
          searchPlaceholder="নাম, ইআইআইএন বা এলাকা"
          emptyIcon="school"
          filters={{ type: f.type ?? undefined, union: f.union ?? undefined }}
          filtersActive={Boolean(f.type || f.union)}
          clearFilters={() => void setF({ type: null, union: null })}
          filterNode={
            <>
              <FilterSelect label="ধরন" value={f.type} onChange={(v) => void setF({ type: v })} options={INSTITUTION_TYPES} />
              <FilterSelect label="ইউনিয়ন" value={f.union} onChange={(v) => void setF({ union: v })} options={UNIONS} />
            </>
          }
          sheet={{
            schema: institutionSchema,
            fields: institutionFields,
            empty: institutionEmpty,
            width: 680,
            toForm: (i) => ({ name: i.name, type: i.type, eiin: i.eiin, founder: i.founder, established: i.established, union: i.union, phone: i.phone, address: i.address, website: i.website, about: i.about, photo: i.photo, lat: i.lat == null ? '' : String(i.lat), lng: i.lng == null ? '' : String(i.lng), hidden: i.hidden }),
            title: (i) => i?.name ?? 'প্রতিষ্ঠান',
            details: (i) => (i.claimedBy ? <p className="rounded-md bg-surface-sunken px-3 py-2 text-body-sm">দায়িত্বে আছেন: {i.claimedBy}। তিনি নিজে নোটিশ দিতে পারেন।</p> : null),
          }}
        />
      ) : (
        <CrudPage
          key="notices"
          title="নোটিশ"
          noun="নোটিশ"
          resource={notices}
          columns={noticeColumns}
          searchPlaceholder="শিরোনাম বা প্রতিষ্ঠান"
          emptyIcon="bell"
          filters={{ institution: f.institution ?? undefined }}
          filtersActive={!!f.institution}
          clearFilters={() => void setF({ institution: null })}
          sheet={{
            schema: noticeSchema,
            fields: noticeFields,
            empty: { ...noticeEmpty, institutionId: f.institution ?? '' },
            toForm: (n) => ({ institutionId: n.institutionId, title: n.title, body: n.body, link: n.link, pinned: n.pinned }),
            title: (n) => n?.title ?? 'নোটিশ',
          }}
        />
      )}
    </RequirePermission>
  );
}
