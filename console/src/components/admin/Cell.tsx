import type { ReactNode } from 'react';
import { formatDate, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/Misc';

/** Avatar + name + one muted line — the usual first column. */
export function PersonCell({ name, sub, src, tone }: { name: ReactNode; sub?: ReactNode; src?: string | null; tone?: 'brand' | 'accent' | 'gold' | 'info' | 'neutral' }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar name={typeof name === 'string' ? name : ''} src={src} size="sm" tone={tone} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-semibold text-ink">{name}</span>
        {sub && <span className="truncate text-body-sm text-ink-muted">{sub}</span>}
      </span>
    </span>
  );
}

/** Title + muted second line, no avatar. */
export function TitleCell({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="font-semibold text-ink">{title}</span>
      {sub && <span className="text-body-sm text-ink-muted">{sub}</span>}
    </span>
  );
}

/** Date with the relative time as a tooltip-free second line. */
export function DateCell({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-ink-subtle">—</span>;
  return (
    <span className="flex flex-col whitespace-nowrap">
      <span>{formatDate(value)}</span>
      <span className="text-caption text-ink-subtle">{timeAgo(value)}</span>
    </span>
  );
}
