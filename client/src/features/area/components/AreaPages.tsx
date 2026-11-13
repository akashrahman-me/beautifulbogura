'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { bn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { Accordion } from '@/components/ui/Interactive';
import { Avatar } from '@/components/ui/Misc';
import { ContactActions, PageHeader, PhoneLink, SectionHeader, StatStrip } from '@/components/shared/Blocks';
import { Skeleton, StatStripSkeleton } from '@/components/shared/Skeleton';
import { ErrorState } from '@/components/shared/States';
import { useAdministration, useAreaProfile, useMunicipality, useUnions } from '../hooks/useArea';
import type { Contact } from '../schemas/area.schema';

const AREA_NAV = [
  { href: '/area', label: 'উপজেলা' },
  { href: '/area/municipality', label: 'পৌরসভা' },
  { href: '/area/unions', label: 'ইউনিয়ন' },
  { href: '/area/administration', label: 'প্রশাসন' },
];

function AreaShell({ title, description, current, children }: { title: string; description?: string; current: string; children: ReactNode }) {
  return (
    <div className="container-narrow flex flex-col gap-6">
      <PageHeader eyebrow="পরিচিতি" title={title} description={description} />
      <nav className="bb-tabs bb-tabs-underline -mt-2" aria-label="পরিচিতি">
        {AREA_NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`bb-tab ${n.href === current ? 'is-active' : ''}`} aria-current={n.href === current ? 'page' : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}

function TextSkeleton({ k, rows = 6 }: { k: string; rows?: number }) {
  return (
    <Skeleton uniqueKey={k} viewBox={`0 0 360 ${rows * 60}`} height={rows * 60}>
      {Array.from({ length: rows }, (_, i) => (
        <rect key={i} x="0" y={i * 60} rx="12" width="360" height="52" />
      ))}
    </Skeleton>
  );
}

function ContactRow({ c }: { c: Contact }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2">
      <span>
        <span className="block text-label">{c.name}</span>
        <span className="text-caption text-ink-muted">{c.role}</span>
      </span>
      <span className="flex items-center gap-2">
        <PhoneLink phone={c.phone} />
        <ContactActions phone={c.phone} compact />
      </span>
    </li>
  );
}

export function AreaProfilePage() {
  const { data, isPending, isError, error, refetch } = useAreaProfile();
  return (
    <AreaShell title="উপজেলা পরিচিতি" current="/area">
      {isPending ? (
        <>
          <StatStripSkeleton cells={4} />
          <TextSkeleton k="area-profile" />
        </>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <p className="text-body-lg">{data.summary}</p>
          <StatStrip items={data.stats.map((s) => ({ label: s.label, value: s.value }))} />
          <Accordion defaultOpen={0} items={data.sections.map((s) => ({ id: s.id, title: s.title, content: <p>{s.body}</p> }))} />
        </>
      )}
    </AreaShell>
  );
}

export function UnionsPage() {
  const { data, isPending, isError, error, refetch } = useUnions();
  return (
    <AreaShell title="ইউনিয়নসমূহ" current="/area/unions">
      {isPending ? (
        <TextSkeleton k="unions" rows={8} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <Accordion
          items={data.map((u) => ({
            id: u.id,
            icon: 'map' as const,
            title: `${bn(u.number)}. ${u.name} ইউনিয়ন`,
            meta: `${bn(u.villages.length)}টি গ্রাম`,
            content: (
              <div className="flex flex-col gap-4">
                <section>
                  <h3 className="text-h4">ইউনিয়ন পরিষদ</h3>
                  <ul className="divide-y divide-line">{u.contacts.map((c) => <ContactRow key={c.role} c={c} />)}</ul>
                </section>
                <section>
                  <h3 className="text-h4">গ্রাম</h3>
                  <p className="text-body-sm text-ink-muted">{u.villages.join(' · ')}</p>
                </section>
                <section>
                  <h3 className="text-h4">হাট-বাজার</h3>
                  <p className="text-body-sm text-ink-muted">{u.markets.join(' · ')}</p>
                </section>
                <section>
                  <h3 className="text-h4">সাবেক চেয়ারম্যান</h3>
                  <ul className="text-body-sm text-ink-muted">{u.formerChairmen.map((c) => <li key={c}>{c}</li>)}</ul>
                </section>
              </div>
            ),
          }))}
        />
      )}
    </AreaShell>
  );
}

export function AdministrationPage() {
  const { data, isPending, isError, error, refetch } = useAdministration();
  return (
    <AreaShell title="প্রশাসন" current="/area/administration">
      {isPending ? (
        <TextSkeleton k="admin" rows={5} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.officials.map((o) => (
              <article key={o.role} className="bb-card bb-dcard bb-dcard-profile">
                <div className="bb-dcard-head">
                  <Avatar name={o.name} src={o.photo} size="lg" tone="info" />
                  <div className="bb-dcard-id">
                    <h3 className="bb-card-title">{o.name}</h3>
                    <p className="bb-dcard-role">{o.role}</p>
                  </div>
                </div>
                <div className="bb-dcard-foot">
                  <PhoneLink phone={o.phone} />
                  <ContactActions phone={o.phone} compact copy />
                </div>
              </article>
            ))}
          </div>
          <section className="flex flex-col gap-3">
            <SectionHeader title="সাবেক ইউএনওগণ" as="h2" />
            <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
              {data.formerUnos.map((u) => (
                <li key={u.name} className="flex justify-between gap-3 px-4 py-3 text-body-sm">
                  <span className="text-label">{u.name}</span>
                  <span className="text-ink-muted">{u.term}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </AreaShell>
  );
}

export function MunicipalityPage() {
  const { data, isPending, isError, error, refetch } = useMunicipality();
  return (
    <AreaShell title="পৌরসভা" current="/area/municipality">
      {isPending ? (
        <>
          <StatStripSkeleton cells={3} />
          <TextSkeleton k="municipality" />
        </>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <p className="text-body-lg">{data.summary}</p>
          <StatStrip items={data.stats.map((s) => ({ label: s.label, value: s.value }))} />
          <section className="flex flex-col gap-3">
            <h2 className="text-h2">নাগরিক সেবা</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.services.map((s) => (
                <li key={s} className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-body-sm">
                  <Icon name="check" size={18} className="text-success" />
                  {s}
                </li>
              ))}
            </ul>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-h2">ওয়ার্ড কাউন্সিলর</h2>
            <ul className="divide-y divide-line rounded-lg border border-line bg-surface px-4">
              {data.wards.map((w) => (
                <ContactRow key={w.number} c={{ role: `${bn(w.number)} নং ওয়ার্ড`, name: w.councillor, phone: w.phone }} />
              ))}
            </ul>
          </section>
        </>
      )}
    </AreaShell>
  );
}
