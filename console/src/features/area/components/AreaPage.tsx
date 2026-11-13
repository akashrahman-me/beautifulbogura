'use client';

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { createResource } from '@/lib/resource';
import { bn, formatPhone } from '@/lib/utils';
import { Tabs } from '@/components/ui/Tabs';
import { DateCell, TitleCell } from '@/components/admin/Cell';
import { CrudPage } from '@/components/admin/CrudPage';
import type { Column } from '@/components/admin/DataTable';
import { DocEditor } from '@/components/admin/DocEditor';
import { PageHeader } from '@/components/admin/PageHeader';
import { RequirePermission } from '@/features/auth';
import {
  administrationFields, administrationSchema, municipalityFields, municipalitySchema, profileFields, profileSchema, unionEmpty, unionFields, unionSchema,
  type Administration, type AreaProfile, type Municipality, type Union, type UnionQuery,
} from '../schemas/area.schema';

export const unions = createResource<Union, unknown, UnionQuery>('/admin/area/unions', 'ইউনিয়নের তথ্য');
const TABS = ['profile', 'unions', 'administration', 'municipality'] as const;

const unionColumns: Column<Union>[] = [
  { key: 'name', header: 'ইউনিয়ন', primary: true, sort: 'number', cell: (u) => <TitleCell title={`${bn(u.number)}. ${u.name}`} sub={`${bn(u.villages.length)}টি গ্রাম`} /> },
  { key: 'chair', header: 'চেয়ারম্যান', cell: (u) => { const c = u.contacts.find((x) => x.role.includes('চেয়ারম্যান')) ?? u.contacts[0]; return c ? <TitleCell title={c.name} sub={c.phone ? formatPhone(c.phone) : undefined} /> : '—'; } },
  { key: 'markets', header: 'হাট-বাজার', cell: (u) => u.markets.join(', ') || '—' },
  { key: 'updated', header: 'হালনাগাদ', cell: (u) => <DateCell value={u.updatedAt} /> },
];

export function AreaPage() {
  const [f, setF] = useQueryStates({ tab: parseAsStringLiteral(TABS).withDefault('profile'), q: parseAsString, page: parseAsString, edit: parseAsString });
  return (
    <RequirePermission permission="content.manage">
      {f.tab !== 'unions' && <PageHeader title="উপজেলা পরিচিতি" />}
      <Tabs
        label="অংশ"
        value={f.tab}
        onChange={(v) => void setF({ tab: v === 'profile' ? null : v, q: null, page: null, edit: null })}
        items={[
          { value: 'profile', label: 'পরিচিতি', icon: 'landmark' },
          { value: 'unions', label: 'ইউনিয়ন', icon: 'map' },
          { value: 'administration', label: 'প্রশাসন', icon: 'office' },
          { value: 'municipality', label: 'পৌরসভা', icon: 'home' },
        ]}
      />
      {f.tab === 'profile' && (
        <DocEditor
          path="/admin/area/profile"
          schema={profileSchema}
          fields={profileFields}
          toForm={(d: AreaProfile) => ({ name: d.name, summary: d.summary, stats: d.stats, sections: d.sections })}
          savedMessage="উপজেলা পরিচিতি হালনাগাদ হয়েছে"
        />
      )}
      {f.tab === 'administration' && (
        <DocEditor
          path="/admin/area/administration"
          schema={administrationSchema}
          fields={administrationFields}
          toForm={(d: Administration) => ({ officials: d.officials.map(({ role, name, phone }) => ({ role, name, phone })), formerUnos: d.formerUnos })}
          savedMessage="প্রশাসনের তথ্য হালনাগাদ হয়েছে"
        />
      )}
      {f.tab === 'municipality' && (
        <DocEditor
          path="/admin/area/municipality"
          schema={municipalitySchema}
          fields={municipalityFields}
          toForm={(d: Municipality) => ({ name: d.name, summary: d.summary, stats: d.stats, services: d.services.join('\n'), wards: d.wards.map((w) => ({ number: String(w.number), councillor: w.councillor, phone: w.phone })) })}
          savedMessage="পৌরসভার তথ্য হালনাগাদ হয়েছে"
        />
      )}
      {f.tab === 'unions' && (
        <CrudPage
          title="ইউনিয়ন"
          noun="ইউনিয়ন"
          resource={unions}
          columns={unionColumns}
          searchPlaceholder="ইউনিয়ন, চেয়ারম্যান বা গ্রাম"
          emptyIcon="map"
          sheet={{
            schema: unionSchema,
            fields: unionFields,
            empty: unionEmpty,
            width: 680,
            toForm: (u) => ({ name: u.name, number: String(u.number), contacts: u.contacts, villages: u.villages.join(', '), markets: u.markets.join('\n'), formerChairmen: u.formerChairmen.join('\n') }),
            title: (u) => u?.name ?? 'ইউনিয়ন',
          }}
        />
      )}
    </RequirePermission>
  );
}
