'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { createResource } from '@/lib/resource';
import { bn, formatPhone } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { DateCell, PersonCell } from '@/components/admin/Cell';
import { CrudPage } from '@/components/admin/CrudPage';
import type { Column } from '@/components/admin/DataTable';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { DEGREES, SPECIALTIES } from '@/config/catalog';
import { RequirePermission } from '@/features/auth';
import { doctorEmpty, doctorFields, doctorSchema, type Doctor, type DoctorQuery } from '../schemas/doctor.schema';

export const doctors = createResource<Doctor, unknown, DoctorQuery>('/admin/doctors', 'ডাক্তারের তথ্য');
const known = new Set(DEGREES.map((d) => d.value));

const columns: Column<Doctor>[] = [
  { key: 'name', header: 'নাম', primary: true, sort: 'name', cell: (d) => <PersonCell name={d.name} sub={d.degrees.join(', ')} src={d.photo} /> },
  { key: 'specialty', header: 'বিশেষজ্ঞতা', sort: 'specialty', cell: (d) => d.specialty },
  { key: 'chambers', header: 'চেম্বার', cell: (d) => <span title={d.chambers.map((c) => c.hospital).join(', ')}>{bn(d.chambers.length)}টি · {d.chambers[0]?.hospital}</span> },
  { key: 'phone', header: 'ফোন', cell: (d) => (d.phone ? formatPhone(d.phone) : '—') },
  { key: 'flags', header: 'অবস্থা', cell: (d) => <span className="flex flex-wrap gap-1">{d.hidden ? <Badge tone="warning" icon="eye-off">লুকানো</Badge> : <Badge tone="success" dot icon={null}>প্রকাশিত</Badge>}{d.verified && <Badge tone="verified">যাচাইকৃত</Badge>}</span> },
  { key: 'updated', header: 'হালনাগাদ', sort: 'updatedAt', cell: (d) => <DateCell value={d.updatedAt} /> },
];

export function DoctorsPage() {
  const [f, setF] = useQueryStates({ specialty: parseAsString });
  return (
    <RequirePermission permission="content.manage">
      <CrudPage
        title="ডাক্তার"
        noun="ডাক্তারের তথ্য"
        createLabel="ডাক্তার যুক্ত করুন"
        resource={doctors}
        columns={columns}
        searchPlaceholder="নাম, হাসপাতাল বা নম্বর"
        emptyIcon="stethoscope"
        filters={{ specialty: f.specialty ?? undefined }}
        filtersActive={!!f.specialty}
        clearFilters={() => void setF({ specialty: null })}
        filterNode={<FilterSelect label="বিশেষজ্ঞতা" value={f.specialty} onChange={(v) => void setF({ specialty: v })} options={SPECIALTIES} />}
        sheet={{
          schema: doctorSchema,
          fields: doctorFields,
          empty: doctorEmpty,
          width: 720,
          toForm: (d) => ({
            name: d.name,
            specialty: d.specialty,
            degrees: d.degrees.filter((x) => known.has(x)),
            degreesOther: d.degrees.filter((x) => !known.has(x)).join(', '),
            phone: d.phone,
            about: d.about,
            photo: d.photo,
            chambers: d.chambers.map((c) => ({ hospital: c.hospital, days: c.days.map(String), time: c.time, serial: c.serial, fee: c.fee == null ? '' : String(c.fee) })),
            verified: d.verified,
            hidden: d.hidden,
          }),
          title: (d) => d?.name ?? 'ডাক্তার',
        }}
      />
    </RequirePermission>
  );
}
