'use client';

import Link from 'next/link';
import { can, type Permission } from '@/lib/permissions';
import { bnNumber, greeting, timeAgo } from '@/lib/utils';
import { useSession } from '@/stores/session.store';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Misc';
import { CategoryBars, TimeBars } from '@/components/admin/Charts';
import { PageHeader } from '@/components/admin/PageHeader';
import { Skeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { actionLabel } from '@/features/audit/schemas/audit.schema';
import { RequirePermission } from '@/features/auth';
import { useDashboard } from '../hooks/useDashboard';
import type { Dashboard } from '../schemas/dashboard.schema';

const ATTENTION_ICON: Record<Dashboard['attention'][number]['type'], IconName> = { review: 'inbox', report: 'flag', hidden: 'eye-off' };

function Kpi({ label, value, href, tone, permission }: { label: string; value: number; href?: string; tone?: 'emergency' | 'warning'; permission?: Permission }) {
  const role = useSession()?.role;
  const body = (
    <>
      <span className="bb-kpi-value" style={tone && value > 0 ? { color: `var(--${tone})` } : undefined}>
        {bnNumber(value)}
      </span>
      <span className="bb-kpi-label">{label}</span>
    </>
  );
  return href && (!permission || can(role, permission)) ? (
    <Link href={href} className="bb-kpi">
      {body}
    </Link>
  ) : (
    <div className="bb-kpi">{body}</div>
  );
}

function Card({ title, action, children }: { title: string; action?: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-h3">{title}</h2>
        {action && (
          <Link href={action.href} className="bb-linkbtn">
            {action.label}
            <Icon name="arrow-right" size={16} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function DashboardPage() {
  return (
    <RequirePermission permission="dashboard.view">
      <Dashboard />
    </RequirePermission>
  );
}

function Dashboard() {
  const user = useSession();
  const { data, isPending, error, refetch } = useDashboard();
  const hour = new Date().getHours();

  return (
    <>
      <PageHeader title={`${greeting(hour)}, ${user?.name.split(' ').slice(-1)[0] ?? ''}`} />
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isPending ? (
        <Skeleton uniqueKey="dash" viewBox="0 0 1000 420" height={420}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 252} y="0" rx="16" width="236" height="100" />
          ))}
          <rect x="0" y="124" rx="16" width="620" height="296" />
          <rect x="644" y="124" rx="16" width="356" height="296" />
        </Skeleton>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="যাচাইয়ের অপেক্ষায়" value={data.kpis.review} href="/review" tone="warning" permission="review.manage" />
            <Kpi label="খোলা রিপোর্ট" value={data.kpis.reports} href="/reports" tone="emergency" permission="reports.manage" />
            <Kpi label="আজকের নতুন পোস্ট" value={data.kpis.postsToday} href="/posts" permission="posts.manage" />
            <Kpi label="চালু পোস্ট" value={data.kpis.activePosts} href="/posts?status=active" permission="posts.manage" />
            <Kpi label="নতুন ব্যবহারকারী (৭ দিন)" value={data.kpis.newUsers7d} href="/users" permission="users.manage" />
            <Kpi label="নিষিদ্ধ ব্যবহারকারী" value={data.kpis.bannedUsers} href="/users?status=banned" permission="users.manage" />
            <Kpi label="রক্ত দিতে প্রস্তুত দাতা" value={data.kpis.donorsReady} href="/donors" permission="content.manage" />
            <Kpi label="মোট রক্তদাতা" value={data.kpis.donorsTotal} href="/donors" permission="content.manage" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <Card title="নতুন পোস্ট · শেষ ৩০ দিন">
              <TimeBars label="শেষ ৩০ দিনের নতুন পোস্ট" unit="টি পোস্ট" data={data.activity.map((d) => ({ date: d.date, value: d.posts }))} />
            </Card>
            <Card title="চালু পোস্ট · ধরন অনুযায়ী" action={can(user?.role, 'posts.manage') ? { href: '/posts', label: 'সব পোস্ট' } : undefined}>
              <CategoryBars data={data.postsByKind.map((k) => ({ key: k.kind, label: k.label, value: k.count }))} />
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card title="এখন যা দেখা দরকার">
              {data.attention.length === 0 ? (
                <EmptyState icon="check" title="সব কাজ শেষ" />
              ) : (
                <ul className="-mx-2 flex flex-col">
                  {data.attention.map((a) => (
                    <li key={`${a.type}-${a.id}`}>
                      <Link href={a.href} className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-surface-sunken">
                        <span className={`grid size-10 shrink-0 place-items-center rounded-md ${a.type === 'review' ? 'bg-warning-soft text-warning' : 'bg-emergency-soft text-emergency'}`}>
                          <Icon name={ATTENTION_ICON[a.type]} size={20} />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-label">{a.title}</span>
                          <span className="truncate text-caption text-ink-muted">{a.sub}</span>
                        </span>
                        <span className="shrink-0 text-caption text-ink-subtle">{timeAgo(a.at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="সাম্প্রতিক কার্যক্রম" action={can(user?.role, 'audit.view') ? { href: '/audit', label: 'অডিট লগ' } : undefined}>
              <ul className="flex flex-col gap-3">
                {data.recent.map((e) => (
                  <li key={e.id} className="flex items-start gap-3">
                    <Avatar name={e.actor.name} size="sm" tone="neutral" />
                    <p className="min-w-0 flex-1 text-body-sm">
                      <span className="font-semibold">{e.actor.name}</span> {e.resource.label} — {actionLabel(e.action)}
                      {e.reason && <span className="text-ink-muted"> · {e.reason}</span>}
                      <span className="block text-caption text-ink-subtle">{timeAgo(e.at)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
