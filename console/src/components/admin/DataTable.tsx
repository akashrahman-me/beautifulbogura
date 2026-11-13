'use client';

import type { ReactNode } from 'react';
import { bn, bnNumber, cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorState } from '@/components/shared/States';
import type { PaginationMeta } from '@/types/api';

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Sort field sent to the API (`sort=field` / `sort=-field`). */
  sort?: string;
  align?: 'end';
  /** Shown as the card title on phones. One column should set it. */
  primary?: boolean;
  /** Left out of the phone card (e.g. a column already in the title). */
  hideOnCard?: boolean;
  className?: string;
}

/**
 * Server-driven table: the parent owns page, sort and selection (usually in the URL).
 * From md a real table; below md each row becomes a card with the primary column as its title.
 */
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  isPending,
  error,
  onRetry,
  empty,
  meta,
  onPage,
  sort,
  onSort,
  selected,
  onSelect,
  onRowClick,
  rowActions,
  dimmed,
  label,
}: {
  rows: T[] | undefined;
  columns: Column<T>[];
  isPending: boolean;
  error?: Error | null;
  onRetry?: () => void;
  empty: ReactNode;
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  sort?: string | null;
  onSort?: (sort: string | null) => void;
  /** Enables the checkbox column. */
  selected?: Set<string>;
  onSelect?: (ids: Set<string>) => void;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => ReactNode;
  /** Previous page still showing while the next loads. */
  dimmed?: boolean;
  /** Accessible table name. */
  label: string;
}) {
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isPending || !rows) return <TableSkeleton cols={columns.length} />;
  if (rows.length === 0) return <div className="bb-table-wrap">{empty}</div>;

  const selectable = !!selected && !!onSelect;
  const allOn = selectable && rows.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const next = new Set(selected);
    rows.forEach((r) => (allOn ? next.delete(r.id) : next.add(r.id)));
    onSelect!(next);
  };
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelect!(next);
  };
  const sortBy = (field: string) => onSort?.(sort === field ? `-${field}` : sort === `-${field}` ? null : field);
  const primary = columns.find((c) => c.primary) ?? columns[0];

  return (
    <div className={cn('bb-table-wrap', dimmed && 'opacity-60 transition-opacity')}>
      {/* Table from md */}
      <div className="bb-table-scroll hidden md:block">
        <table className="bb-table" aria-label={label}>
          <thead>
            <tr>
              {selectable && (
                <th className="is-check">
                  <input type="checkbox" className="size-5 accent-[var(--brand)]" checked={allOn} onChange={toggleAll} aria-label="এই পাতার সব বেছে নিন" />
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} className={cn(c.align === 'end' && 'is-num', c.className)} aria-sort={c.sort && sort?.replace('-', '') === c.sort ? (sort.startsWith('-') ? 'descending' : 'ascending') : undefined}>
                  {c.sort && onSort ? (
                    <button type="button" className="bb-sort" onClick={() => sortBy(c.sort!)}>
                      {c.header}
                      <Icon name={sort === c.sort ? 'chevron-up' : sort === `-${c.sort}` ? 'chevron-down' : 'sort'} size={14} />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
              {rowActions && (
                <th className="is-actions">
                  <span className="bb-sr">কাজ</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={cn(selected?.has(r.id) && 'is-selected', onRowClick && 'is-clickable')} onClick={onRowClick ? (e) => !(e.target as HTMLElement).closest('button,a,input,label') && onRowClick(r) : undefined}>
                {selectable && (
                  <td className="is-check">
                    <input type="checkbox" className="size-5 accent-[var(--brand)]" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label="বেছে নিন" />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key} className={cn(c.align === 'end' && 'is-num', c.className)}>
                    {c.cell(r)}
                  </td>
                ))}
                {rowActions && <td className="is-actions">{rowActions(r)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards below md */}
      <ul className="bb-cards md:hidden" aria-label={label}>
        {rows.map((r) => (
          <li key={r.id} className={cn('bb-rowcard', selected?.has(r.id) && 'bg-brand-soft')}>
            <div className="flex items-start gap-3">
              {selectable && <input type="checkbox" className="mt-1 size-5 accent-[var(--brand)]" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label="বেছে নিন" />}
              <button type="button" className="min-w-0 flex-1 text-left" onClick={onRowClick ? () => onRowClick(r) : undefined} disabled={!onRowClick}>
                {primary.cell(r)}
              </button>
            </div>
            <dl className="bb-dl text-body-sm">
              {columns
                .filter((c) => c !== primary && !c.hideOnCard)
                .map((c) => (
                  <div key={c.key} className="contents">
                    <dt>{c.header}</dt>
                    <dd>{c.cell(r)}</dd>
                  </div>
                ))}
            </dl>
            {rowActions && <div className="flex flex-wrap gap-2">{rowActions(r)}</div>}
          </li>
        ))}
      </ul>

      {meta && onPage && <Pagination meta={meta} onPage={onPage} />}
    </div>
  );
}

export function Pagination({ meta, onPage }: { meta: PaginationMeta; onPage: (page: number) => void }) {
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  return (
    <nav className="bb-table-foot" aria-label="পাতা">
      <span>
        {bnNumber(meta.total)}টির মধ্যে {bn(from)}–{bn(to)}
      </span>
      <span className="flex items-center gap-2">
        <button type="button" className="bb-btn bb-btn-secondary bb-btn-sm" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} aria-label="আগের পাতা">
          <Icon name="chevron-left" size={18} />
        </button>
        <span className="tabular-nums">
          {bn(meta.page)} / {bn(Math.max(1, meta.totalPages))}
        </span>
        <button type="button" className="bb-btn bb-btn-secondary bb-btn-sm" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)} aria-label="পরের পাতা">
          <Icon name="chevron-right" size={18} />
        </button>
      </span>
    </nav>
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bb-table-wrap" aria-busy="true" aria-label="লোড হচ্ছে">
      <Skeleton uniqueKey={`table-${rows}-${cols}`} viewBox={`0 0 1000 ${rows * 56 + 44}`} height={rows * 56 + 44}>
        <rect x="0" y="0" width="1000" height="44" />
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => <rect key={`${r}-${c}`} x={24 + c * (960 / cols)} y={44 + r * 56 + 20} rx="6" width={(960 / cols) * (c === 0 ? 0.8 : 0.55)} height="16" />),
        )}
      </Skeleton>
    </div>
  );
}

/** Dark bar for actions on the selected rows. */
export function BulkBar({ count, onClear, children }: { count: number; onClear: () => void; children: ReactNode }) {
  if (!count) return null;
  return (
    <div className="bb-bulkbar" role="region" aria-label="বেছে নেওয়া সারির কাজ">
      <span className="text-label">{bn(count)}টি বেছে নেওয়া</span>
      <div className="flex flex-wrap gap-2">{children}</div>
      <button type="button" className="bb-linkbtn ml-auto text-[var(--canvas)]" onClick={onClear}>
        <Icon name="x" size={16} />
        বাছাই মুছুন
      </button>
    </div>
  );
}
