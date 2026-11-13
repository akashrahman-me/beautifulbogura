import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

export type BadgeTone = 'neutral' | 'brand' | 'accent' | 'featured' | 'verified' | 'success' | 'warning' | 'danger' | 'info';

const DEFAULT_ICON: Partial<Record<BadgeTone, IconName>> = { featured: 'star', verified: 'verified' };

/** Status in words. `featured` and `verified` are admin-granted — render them only from API data. */
export function Badge({
  tone = 'neutral',
  icon,
  dot,
  size,
  children,
  className,
  title,
}: {
  /** Tooltip explaining what the badge means (e.g. what “যাচাইকৃত” checked). */
  title?: string;
  tone?: BadgeTone;
  icon?: IconName | null;
  dot?: boolean;
  size?: 'md' | 'lg';
  children: ReactNode;
  className?: string;
}) {
  const ic = icon === undefined ? DEFAULT_ICON[tone] : icon;
  return (
    <span className={cn('bb-badge', `bb-badge-${tone}`, size === 'lg' && 'bb-badge-lg', className)} title={title}>
      {ic ? <Icon name={ic} size={14} strokeWidth={2} /> : dot ? <span className="bb-badge-dot" aria-hidden /> : null}
      {children}
    </span>
  );
}
