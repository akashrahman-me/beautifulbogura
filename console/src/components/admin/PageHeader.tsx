import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

/** Console page title row: optional back link, title, one-line description, actions on the right. */
export function PageHeader({ title, description, back, actions, meta }: { title: ReactNode; description?: ReactNode; back?: { href: string; label: string }; actions?: ReactNode; meta?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      {back && (
        <Link href={back.href} className="bb-linkbtn bb-linkbtn-muted -ml-1 self-start">
          <Icon name="arrow-left" size={18} />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-h1">{title}</h1>
          {description && <p className="text-body-sm max-w-3xl text-ink-muted">{description}</p>}
          {meta && <div className="flex flex-wrap gap-2 pt-1">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
