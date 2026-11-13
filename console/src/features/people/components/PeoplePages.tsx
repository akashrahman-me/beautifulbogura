'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { createResource } from '@/lib/resource';
import { bn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { DateCell, PersonCell } from '@/components/admin/Cell';
import { CrudPage } from '@/components/admin/CrudPage';
import type { Column } from '@/components/admin/DataTable';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { CADRES, labelOf, NOTABLE_FIELDS, UNIONS } from '@/config/catalog';
import { RequirePermission } from '@/features/auth';
import {
  achieverEmpty, achieverFields, achieverSchema, freedomFighterEmpty, freedomFighterFields, freedomFighterSchema, notableEmpty, notableFields, notableSchema,
  type Achiever, type AchieverQuery, type FreedomFighter, type FreedomFighterQuery, type NotablePerson, type NotableQuery,
} from '../schemas/people.schema';

export const freedomFighters = createResource<FreedomFighter, unknown, FreedomFighterQuery>('/admin/freedom-fighters', 'মুক্তিযোদ্ধার তথ্য');
export const notablePersons = createResource<NotablePerson, unknown, NotableQuery>('/admin/notable-persons', 'জীবনী');
export const achievers = createResource<Achiever, unknown, AchieverQuery>('/admin/achievers', 'কৃতি সন্তানের তথ্য');

export function FreedomFightersPage() {
  const [f, setF] = useQueryStates({ union: parseAsString });
  const columns: Column<FreedomFighter>[] = [
    { key: 'name', header: 'নাম', primary: true, sort: 'name', cell: (x) => <PersonCell name={x.name} sub={`পিতা: ${x.fatherName}`} src={x.photo} tone="gold" /> },
    { key: 'id', header: 'নম্বর', sort: 'idNo', cell: (x) => bn(x.idNo) },
    { key: 'place', header: 'গ্রাম, ইউনিয়ন', cell: (x) => `${x.village}, ${x.union}` },
    { key: 'sector', header: 'সেক্টর', cell: (x) => x.sector ?? '—' },
    { key: 'alive', header: 'অবস্থা', cell: (x) => (x.alive ? <Badge tone="success" dot icon={null}>জীবিত</Badge> : <Badge tone="neutral" icon={null}>প্রয়াত</Badge>) },
  ];
  return (
    <RequirePermission permission="content.manage">
      <CrudPage
        title="বীর মুক্তিযোদ্ধা"
        noun="মুক্তিযোদ্ধা"
        resource={freedomFighters}
        columns={columns}
        searchPlaceholder="নাম, পিতার নাম, নম্বর বা গ্রাম"
        emptyIcon="medal"
        filters={{ union: f.union ?? undefined }}
        filtersActive={!!f.union}
        clearFilters={() => void setF({ union: null })}
        filterNode={<FilterSelect label="ইউনিয়ন" value={f.union} onChange={(v) => void setF({ union: v })} options={UNIONS} />}
        sheet={{
          schema: freedomFighterSchema,
          fields: freedomFighterFields,
          empty: freedomFighterEmpty,
          toForm: (x) => ({ name: x.name, fatherName: x.fatherName, idNo: x.idNo, village: x.village, union: x.union, sector: x.sector ?? '', alive: x.alive, photo: x.photo }),
          title: (x) => x?.name ?? 'মুক্তিযোদ্ধা',
        }}
      />
    </RequirePermission>
  );
}

export function NotablePage() {
  const [f, setF] = useQueryStates({ field: parseAsString });
  const columns: Column<NotablePerson>[] = [
    { key: 'name', header: 'নাম', primary: true, sort: 'name', cell: (x) => <PersonCell name={x.name} sub={x.title} src={x.photo} tone="gold" /> },
    { key: 'field', header: 'ক্ষেত্র', cell: (x) => labelOf(NOTABLE_FIELDS, x.field) },
    { key: 'years', header: 'জীবনকাল', cell: (x) => (x.born ? `${bn(x.born)} – ${x.died ? bn(x.died) : 'বর্তমান'}` : '—') },
    { key: 'status', header: 'অবস্থা', cell: (x) => (x.published ? <Badge tone="success" dot icon={null}>প্রকাশিত</Badge> : <Badge tone="neutral" dot icon={null}>খসড়া</Badge>) },
    { key: 'updated', header: 'হালনাগাদ', sort: 'updatedAt', cell: (x) => <DateCell value={x.updatedAt} /> },
  ];
  return (
    <RequirePermission permission="content.manage">
      <CrudPage
        title="বিশিষ্ট ব্যক্তি"
        noun="জীবনী"
        createLabel="জীবনী লিখুন"
        resource={notablePersons}
        columns={columns}
        searchPlaceholder="নাম বা পরিচয়"
        emptyIcon="user"
        filters={{ field: f.field ?? undefined }}
        filtersActive={!!f.field}
        clearFilters={() => void setF({ field: null })}
        filterNode={<FilterSelect label="ক্ষেত্র" value={f.field} onChange={(v) => void setF({ field: v })} options={NOTABLE_FIELDS} />}
        sheet={{
          schema: notableSchema,
          fields: notableFields,
          empty: notableEmpty,
          width: 760,
          toForm: (x) => ({ name: x.name, title: x.title, field: x.field, born: x.born ?? '', died: x.died ?? '', photo: x.photo, excerpt: x.excerpt, body: x.body, published: x.published }),
          title: (x) => x?.name ?? 'জীবনী',
        }}
      />
    </RequirePermission>
  );
}

export function AchieversPage() {
  const [f, setF] = useQueryStates({ cadre: parseAsString });
  const columns: Column<Achiever>[] = [
    { key: 'name', header: 'নাম', primary: true, sort: 'name', cell: (x) => <PersonCell name={x.name} sub={x.post} src={x.photo} tone="info" /> },
    { key: 'cadre', header: 'ক্যাডার', cell: (x) => <Badge tone="info" icon="medal">{labelOf(CADRES, x.cadre)}</Badge> },
    { key: 'batch', header: 'ব্যাচ', cell: (x) => x.batch ?? '—' },
    { key: 'workplace', header: 'কর্মস্থল', cell: (x) => x.workplace },
    { key: 'home', header: 'বাড়ি', cell: (x) => [x.village, x.union].filter(Boolean).join(', ') || '—' },
  ];
  return (
    <RequirePermission permission="content.manage">
      <CrudPage
        title="কৃতি সন্তান"
        noun="কৃতি সন্তান"
        resource={achievers}
        columns={columns}
        searchPlaceholder="নাম, পদ বা কর্মস্থল"
        emptyIcon="medal"
        filters={{ cadre: f.cadre ?? undefined }}
        filtersActive={!!f.cadre}
        clearFilters={() => void setF({ cadre: null })}
        filterNode={<FilterSelect label="ক্যাডার" value={f.cadre} onChange={(v) => void setF({ cadre: v })} options={CADRES} />}
        sheet={{
          schema: achieverSchema,
          fields: achieverFields,
          empty: achieverEmpty,
          toForm: (x) => ({ name: x.name, cadre: x.cadre, batch: x.batch ?? '', post: x.post, workplace: x.workplace, village: x.village, union: x.union, photo: x.photo }),
          title: (x) => x?.name ?? 'কৃতি সন্তান',
        }}
      />
    </RequirePermission>
  );
}
