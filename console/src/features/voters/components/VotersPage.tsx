'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { useRef, useState } from 'react';
import { useListParams } from '@/hooks/useListParams';
import { bn, bnNumber, formatDate, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Alert } from '@/components/ui/Misc';
import { TitleCell } from '@/components/admin/Cell';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { FilterSelect } from '@/components/admin/FilterSelect';
import { PageHeader } from '@/components/admin/PageHeader';
import { Toolbar } from '@/components/admin/Toolbar';
import { EmptyState } from '@/components/shared/States';
import { UNIONS } from '@/config/catalog';
import { RequirePermission } from '@/features/auth';
import { useImportVoters, useVoterImports, useVoterStats, voters } from '../api/voters.api';
import { CSV_COLUMNS, type Voter, type VoterImport } from '../schemas/voter.schema';

const GENDER = { male: 'পুরুষ', female: 'নারী', third: 'তৃতীয় লিঙ্গ' } as const;

function ImportReport({ r }: { r: VoterImport }) {
  return (
    <Alert tone={r.errors.length ? 'warning' : 'success'} title={`${r.file} · ${formatDate(r.at)}`}>
      <p>
        নতুন {bnNumber(r.imported)} · হালনাগাদ {bnNumber(r.updated)} · বাদ {bnNumber(r.skipped)}
      </p>
      {r.errors.length > 0 && (
        <ul className="mt-2 list-inside list-disc text-body-sm">
          {r.errors.slice(0, 10).map((e) => (
            <li key={e.row}>
              সারি {bn(e.row)}: {e.message}
            </li>
          ))}
        </ul>
      )}
    </Alert>
  );
}

function ImportPanel() {
  const input = useRef<HTMLInputElement>(null);
  const importer = useImportVoters();
  const imports = useVoterImports();
  const [file, setFile] = useState<File | null>(null);
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
      <h2 className="text-h3">তালিকা ইমপোর্ট</h2>
      <p className="text-body-sm text-ink-muted">
        CSV ফাইলের কলাম: <code className="text-caption">{CSV_COLUMNS.join(', ')}</code>। ভোটার নম্বর মিললে তথ্য হালনাগাদ হবে।
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <input ref={input} type="file" accept=".csv,text/csv" className="bb-sr" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <Button variant="secondary" iconLeft="upload" onClick={() => input.current?.click()}>
          {file ? file.name : 'CSV ফাইল বেছে নিন'}
        </Button>
        <Button iconLeft="check" disabled={!file} loading={importer.isPending} onClick={() => file && importer.mutate(file, { onSuccess: () => setFile(null) })}>
          ইমপোর্ট করুন
        </Button>
      </div>
      {importer.data && <ImportReport r={importer.data} />}
      {importer.error && <Alert tone="danger" title={importer.error.message} />}
      {imports.data && imports.data.length > 0 && (
        <details className="text-body-sm">
          <summary className="cursor-pointer text-label">আগের ইমপোর্ট ({bn(imports.data.length)})</summary>
          <ul className="mt-2 flex flex-col gap-1">
            {imports.data.map((i) => (
              <li key={i.id} className="flex flex-wrap justify-between gap-2 border-b border-line py-1.5">
                <span>
                  {i.file} — {i.by}
                </span>
                <span className="text-ink-muted">
                  +{bnNumber(i.imported)} / ~{bnNumber(i.updated)} · {timeAgo(i.at)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export function VotersPage() {
  const lp = useListParams();
  const [f, setF] = useQueryStates({ union: parseAsString });
  const stats = useVoterStats();
  const ready = (lp.search?.length ?? 0) >= 3;
  // The roll is never listed whole: a search of 3+ characters is required, and every search is audited.
  const list = voters.useList({ page: lp.page, search: lp.search, union: f.union ?? undefined }, { enabled: ready });
  const columns: Column<Voter>[] = [
    { key: 'name', header: 'নাম', primary: true, cell: (v) => <TitleCell title={v.name} sub={`পিতা: ${v.fatherName}`} /> },
    { key: 'no', header: 'ভোটার নং', cell: (v) => bn(v.voterNo) },
    { key: 'dob', header: 'জন্ম', cell: (v) => formatDate(v.dob) },
    { key: 'gender', header: 'লিঙ্গ', cell: (v) => GENDER[v.gender] },
    { key: 'place', header: 'গ্রাম, ইউনিয়ন', cell: (v) => `${v.village}, ${v.union}` },
  ];
  return (
    <RequirePermission permission="voters.manage">
      <PageHeader title="ভোটার তালিকা" meta={<span className="flex items-center gap-1.5 text-caption text-ink-muted"><Icon name="shield" size={16} />প্রতিটি খোঁজ অডিট লগে নাম ও সময়সহ সংরক্ষিত হয়</span>} />
      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-h3">ইউনিয়ন অনুযায়ী</h2>
            {stats.data && <span className="text-label">মোট {bnNumber(stats.data.total)} জন</span>}
          </div>
          {stats.isPending ? (
            <div className="h-48 animate-pulse rounded-md bg-surface-sunken" />
          ) : (
            <div className="bb-table-wrap">
              <table className="bb-table">
                <thead>
                  <tr>
                    <th>ইউনিয়ন</th>
                    <th className="is-num">পুরুষ</th>
                    <th className="is-num">নারী</th>
                    <th className="is-num">তৃতীয়</th>
                    <th className="is-num">মোট</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.data?.byUnion.map((u) => (
                    <tr key={u.union}>
                      <td>{u.union}</td>
                      <td className="is-num">{bnNumber(u.male)}</td>
                      <td className="is-num">{bnNumber(u.female)}</td>
                      <td className="is-num">{bnNumber(u.third)}</td>
                      <td className="is-num font-semibold">{bnNumber(u.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <ImportPanel />
      </div>
      <h2 className="text-h2 pt-2">খুঁজুন</h2>
      <Toolbar
        query={lp.q}
        onQuery={lp.setQ}
        placeholder="নাম বা ভোটার নম্বর (অন্তত ৩ অক্ষর)"
        filters={<FilterSelect label="ইউনিয়ন" value={f.union} onChange={(v) => { void setF({ union: v }); lp.resetPage(); }} options={UNIONS} />}
        count={ready ? list.data?.meta.total : undefined}
        countLabel="জন"
      />
      {ready ? (
        <DataTable label="ভোটার" rows={list.data?.items} columns={columns} isPending={list.isPending} error={list.error} onRetry={list.refetch} meta={list.data?.meta} onPage={lp.setPage} dimmed={list.isPlaceholderData} empty={<EmptyState icon="vote" title="কাউকে পাওয়া যায়নি" />} />
      ) : (
        <div className="bb-table-wrap">
          <EmptyState icon="search" title="নাম বা ভোটার নম্বর লিখুন" />
        </div>
      )}
    </RequirePermission>
  );
}
