'use client';

import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api-client';
import { bn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Avatar, MetaList } from '@/components/ui/Misc';
import { ContactActions, PageHeader } from '@/components/shared/Blocks';
import { PostActions } from '@/components/shared/PostActions';
import { Skeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useJob, useManageJob, useReportJob } from '../hooks/useJobs';
import { DeadlineBadge, useJobDeadline } from './JobCard';
import type { Job } from '../schemas/job.schema';

export function JobDetailSkeleton() {
  return (
    <div className="container-narrow pt-16">
      <Skeleton uniqueKey="job-detail" viewBox="0 0 360 460" height={460}>
        <rect x="0" y="0" rx="6" width="260" height="30" />
        <rect x="0" y="54" rx="12" width="52" height="52" />
        <rect x="64" y="60" rx="4" width="170" height="14" />
        <rect x="64" y="84" rx="4" width="120" height="12" />
        <rect x="0" y="130" rx="16" width="360" height="90" />
        <rect x="0" y="240" rx="4" width="360" height="12" />
        <rect x="0" y="262" rx="4" width="330" height="12" />
        <rect x="0" y="284" rx="4" width="300" height="12" />
        <rect x="0" y="330" rx="12" width="170" height="48" />
        <rect x="186" y="330" rx="12" width="174" height="48" />
      </Skeleton>
    </div>
  );
}

function JobBody({ job }: { job: Job }) {
  const router = useRouter();
  const manage = useManageJob();
  const report = useReportJob();
  const { expired } = useJobDeadline(job);
  return (
    <div className="container-narrow flex flex-col gap-6">
      <PageHeader title={job.title} back={{ href: '/jobs', label: 'চাকরির খবর' }} />
      <div className="flex items-center gap-3">
        <Avatar name={job.company} square tone="accent" />
        <div className="flex-1">
          <p className="text-h4">{job.company}</p>
          <p className="text-body-sm text-ink-muted">{job.address}</p>
        </div>
        <DeadlineBadge job={job} />
      </div>
      <dl className="bb-facts rounded-lg border border-line bg-surface p-4">
        <div><dt>পদ</dt><dd>{bn(job.vacancies)}টি</dd></div>
        <div><dt>বেতন</dt><dd>{job.salary}</dd></div>
        <div><dt>শেষ তারিখ</dt><dd>{formatDate(job.deadline)}</dd></div>
        {job.education && <div><dt>শিক্ষাগত যোগ্যতা</dt><dd>{job.education}</dd></div>}
      </dl>
      <section className="flex flex-col gap-2">
        <h2 className="text-h2">কাজ ও অভিজ্ঞতা</h2>
        <p className="text-body-lg whitespace-pre-line">{job.details}</p>
      </section>
      <MetaList items={[{ icon: 'pin', text: job.address }, { icon: 'calendar', text: `প্রকাশ: ${formatDate(job.createdAt)}` }]} />
      {expired ? (
        <EmptyState icon="clock" title="আবেদনের সময় শেষ">এই পদে আর আবেদন নেওয়া হচ্ছে না।</EmptyState>
      ) : (
        <ContactActions phone={job.phone} whatsapp={job.whatsapp} copy />
      )}
      <div className="rounded-lg border border-line bg-surface px-4 pt-1 pb-3">
        <PostActions
          id={job.id}
          doneLabel="নিয়োগ সম্পন্ন হয়েছে"
          report={report}
          manage={{
            isPending: manage.isPending,
            mutate: (body, opts) => manage.mutate(body, { onSuccess: () => { opts.onSuccess(); router.push('/jobs'); }, onError: opts.onError }),
          }}
        />
      </div>
    </div>
  );
}

export function JobDetail({ id }: { id: string }) {
  const { data, isPending, isError, error, refetch } = useJob(id);
  if (isPending) return <JobDetailSkeleton />;
  if (isError) {
    return error instanceof ApiError && error.status === 404 ? (
      <EmptyState icon="briefcase" title="বিজ্ঞাপনটি পাওয়া যায়নি" action={<Button href="/jobs">চাকরির খবর</Button>}>বিজ্ঞাপনটি মুছে ফেলা হয়ে থাকতে পারে।</EmptyState>
    ) : (
      <ErrorState error={error} onRetry={refetch} />
    );
  }
  return <JobBody job={data} />;
}
