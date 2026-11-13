'use client';

import type { ReactNode } from 'react';
import { bnNumber } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { SearchField } from '@/components/ui/Interactive';

/** Search + filters above a table, with the result count and a clear-filters link. */
export function Toolbar({
  query,
  onQuery,
  placeholder,
  filters,
  count,
  countLabel = 'টি',
  onClear,
  actions,
}: {
  query?: string;
  onQuery?: (q: string) => void;
  placeholder?: string;
  filters?: ReactNode;
  count?: number;
  countLabel?: string;
  onClear?: () => void;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        {onQuery && (
          <div className="min-w-60 flex-1 lg:max-w-md">
            <SearchField value={query ?? ''} onChange={onQuery} placeholder={placeholder} />
          </div>
        )}
        {filters}
        {actions && <div className="ml-auto flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="flex min-h-6 items-center justify-between gap-3 text-body-sm text-ink-muted">
        <p aria-live="polite">{count == null ? ' ' : `${bnNumber(count)}${countLabel.startsWith('টি') ? '' : ' '}${countLabel}`}</p>
        {onClear && (
          <button type="button" className="bb-linkbtn" onClick={onClear}>
            <Icon name="x" size={16} />
            ফিল্টার মুছুন
          </button>
        )}
      </div>
    </div>
  );
}
