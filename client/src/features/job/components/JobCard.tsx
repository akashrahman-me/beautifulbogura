'use client';

import Link from 'next/link';
import { useNow } from '@/hooks/useNow';
import { bn, cn, daysUntil, formatDate, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Misc';
import { ContactActions } from '@/components/shared/Blocks';
import type { Job } from '../schemas/job.schema';

export function useJobDeadline(job: Job) {
  const now = useNow();
  const left = now ? daysUntil(job.deadline, now) : null;
  const expired = left != null && left < 0;
  return { left, expired, now };
}

export function DeadlineBadge({ job }: { job: Job }) {
  const { left, expired } = useJobDeadline(job);
  if (left == null) return null;
  if (expired) return <Badge tone="neutral" icon="clock">মেয়াদ শেষ</Badge>;
  return (
    <Badge tone={left <= 3 ? 'warning' : 'info'} icon="clock">
      {left === 0 ? 'আজ শেষ দিন' : `${bn(left)} দিন বাকি`}
    </Badge>
  );
}

export function JobCard({ job }: { job: Job }) {
  const { expired, now } = useJobDeadline(job);
  return (
    <article className={cn('bb-card bb-job', expired && 'is-expired')}>
      <div className="bb-job-head">
        <Avatar name={job.company} square tone="accent" />
        <div className="bb-job-co">
          <p className="bb-job-company">{job.company}</p>
          <p className="bb-job-loc">{job.address}{now && ` · ${timeAgo(job.createdAt, now)}`}</p>
        </div>
        <DeadlineBadge job={job} />
      </div>
      <h3 className="bb-card-title">
        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
      </h3>
      <dl className="bb-facts">
        <div>
          <dt>পদ</dt>
          <dd>{bn(job.vacancies)}টি</dd>
        </div>
        <div>
          <dt>বেতন</dt>
          <dd>{job.salary}</dd>
        </div>
        <div>
          <dt>শেষ তারিখ</dt>
          <dd>{formatDate(job.deadline, false)}</dd>
        </div>
      </dl>
      <p className="bb-card-text bb-clamp-2">{job.details}</p>
      <div className="bb-card-foot">
        <Button variant="secondary" size="sm" iconRight="arrow-right" href={`/jobs/${job.id}`}>
          বিস্তারিত
        </Button>
        {!expired && <ContactActions phone={job.phone} whatsapp={job.whatsapp} compact />}
      </div>
    </article>
  );
}
