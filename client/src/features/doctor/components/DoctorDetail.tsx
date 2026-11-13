'use client';

import { ApiError } from '@/lib/api-client';
import { formatPhone, money, telHref } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar, MetaList } from '@/components/ui/Misc';
import { ContactActions, PageHeader } from '@/components/shared/Blocks';
import { Skeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useDoctor } from '../hooks/useDoctors';
import { chamberDays } from './DoctorCard';

export function DoctorDetailSkeleton() {
  return (
    <div className="container-narrow pt-16">
      <Skeleton uniqueKey="doctor-detail" viewBox="0 0 360 420" height={420}>
        <circle cx="44" cy="44" r="44" />
        <rect x="104" y="14" rx="4" width="120" height="16" />
        <rect x="104" y="40" rx="6" width="220" height="24" />
        <rect x="104" y="72" rx="4" width="150" height="12" />
        <rect x="0" y="120" rx="16" width="360" height="160" />
        <rect x="0" y="300" rx="12" width="170" height="48" />
        <rect x="186" y="300" rx="12" width="174" height="48" />
      </Skeleton>
    </div>
  );
}

export function DoctorDetail({ id }: { id: string }) {
  const { data: d, isPending, isError, error, refetch } = useDoctor(id);
  if (isPending) return <DoctorDetailSkeleton />;
  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <EmptyState icon="stethoscope" title="ডাক্তারের তথ্য পাওয়া যায়নি" action={<Button href="/doctors">তালিকায় ফিরে যান</Button>}>
          তথ্যটি সরিয়ে নেওয়া হয়ে থাকতে পারে।
        </EmptyState>
      );
    }
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="container-narrow flex flex-col gap-6">
      <PageHeader title={d.name} back={{ href: '/doctors', label: 'ডাক্তারদের তালিকা' }} />
      <div className="flex items-start gap-4">
        <Avatar name={d.name} src={d.photo} size="lg" />
        <div className="flex flex-col gap-2">
          <div className="bb-badges">
            <Badge tone="brand" icon="stethoscope">{d.specialty} বিশেষজ্ঞ</Badge>
            {d.sittingToday && <Badge tone="success" dot>আজ বসছেন</Badge>}
          </div>
          <p className="text-body text-ink-muted">{d.degrees.join(', ')}</p>
          {d.about && <p className="text-body-sm">{d.about}</p>}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">চেম্বার ও সময়</h2>
        {d.chambers.map((c) => (
          <div key={c.hospital} className="bb-card">
            <h3 className="text-h4">{c.hospital}</h3>
            <MetaList items={[{ icon: 'calendar', text: chamberDays(c) }, { icon: 'clock', text: c.time }, c.fee != null && { icon: 'tag', text: `ফি ${money(c.fee)}` }]} />
            {c.serial && (
              <div className="bb-dcard-foot">
                <span className="text-body-sm text-ink-muted">সিরিয়াল: <a className="bb-phone" href={telHref(c.serial)}>{formatPhone(c.serial)}</a></span>
                <Button size="sm" iconLeft="phone" href={telHref(c.serial)}>সিরিয়াল নিন</Button>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">যোগাযোগ</h2>
        <ContactActions phone={d.phone} copy />
      </section>
    </div>
  );
}
