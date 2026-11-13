'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useState, type ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useListParams } from '@/hooks/useListParams';
import type { Resource } from '@/lib/resource';
import type { ListQuery } from '@/types/api';
import { Button, IconButton } from '@/components/ui/Button';
import type { IconName } from '@/components/ui/Icon';
import { EmptyState } from '@/components/shared/States';
import { BulkBar, DataTable, type Column } from './DataTable';
import { ConfirmDialog } from './Dialogs';
import { PageHeader } from './PageHeader';
import { ResourceSheet, type SheetConfig } from './ResourceSheet';
import { Toolbar } from './Toolbar';

/**
 * A whole content-management page: title, search + filters, server table, create / edit sheet
 * (addressable as `?edit=new` / `?edit=<id>`), delete with undo and bulk delete.
 */
export function CrudPage<T extends { id: string }, I, V extends FieldValues, Q extends ListQuery>({
  title,
  description,
  noun,
  resource,
  columns,
  filters,
  filterNode,
  filtersActive,
  clearFilters,
  searchPlaceholder,
  emptyIcon = 'search',
  sheet,
  createLabel,
  headerActions,
  rowActions,
}: {
  title: string;
  description?: ReactNode;
  /** Bangla noun for one item (“ডাক্তারের তথ্য”). */
  noun: string;
  resource: Resource<T, I, Q>;
  columns: Column<T>[];
  /** Module filters merged into the list query. */
  filters?: Partial<Q>;
  filterNode?: ReactNode;
  filtersActive?: boolean;
  clearFilters?: () => void;
  searchPlaceholder: string;
  emptyIcon?: IconName;
  sheet: SheetConfig<T, I, V>;
  createLabel?: string;
  headerActions?: ReactNode;
  rowActions?: (row: T) => ReactNode;
}) {
  const lp = useListParams();
  const [edit, setEdit] = useQueryState('edit', parseAsString);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDelete, setBulkDelete] = useState(false);
  const query = { page: lp.page, search: lp.search, sort: lp.sort ?? undefined, ...filters } as Q;
  const list = resource.useList(query);
  const remove = resource.useRemove();
  const filtered = Boolean(lp.q || filtersActive);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            {headerActions}
            {createLabel !== '' && (
              <Button iconLeft="plus" onClick={() => void setEdit('new')}>
                {createLabel ?? `${noun} যুক্ত করুন`}
              </Button>
            )}
          </>
        }
      />
      <Toolbar
        query={lp.q}
        onQuery={lp.setQ}
        placeholder={searchPlaceholder}
        filters={filterNode}
        count={list.data?.meta.total}
        countLabel="টি"
        onClear={
          filtered
            ? () => {
                lp.setQ('');
                clearFilters?.();
              }
            : undefined
        }
      />
      <DataTable
        label={title}
        rows={list.data?.items}
        columns={columns}
        isPending={list.isPending}
        error={list.error}
        onRetry={list.refetch}
        meta={list.data?.meta}
        onPage={lp.setPage}
        sort={lp.sort}
        onSort={lp.setSort}
        selected={selected}
        onSelect={setSelected}
        dimmed={list.isPlaceholderData}
        onRowClick={(r) => void setEdit(r.id)}
        empty={<EmptyState icon={emptyIcon} title={filtered ? 'কিছু পাওয়া যায়নি' : `এখনো কোনো ${noun} নেই`} action={!filtered && createLabel !== '' ? <Button iconLeft="plus" onClick={() => void setEdit('new')}>{createLabel ?? `${noun} যুক্ত করুন`}</Button> : undefined} />}
        rowActions={(r) => (
          <span className="inline-flex gap-1">
            {rowActions?.(r)}
            <IconButton icon="edit" label="সম্পাদনা" size="sm" onClick={() => void setEdit(r.id)} />
          </span>
        )}
      />
      <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
        <Button size="sm" variant="emergency" iconLeft="trash" onClick={() => setBulkDelete(true)}>
          মুছে ফেলুন
        </Button>
      </BulkBar>
      <ResourceSheet resource={resource} id={edit} onClose={() => void setEdit(null)} noun={noun} config={sheet} />
      <ConfirmDialog
        open={bulkDelete}
        onOpenChange={setBulkDelete}
        tone="emergency"
        icon="trash"
        title={`বেছে নেওয়া ${noun} মুছে ফেলবেন?`}
        description="প্রতিটির জন্য কিছুক্ষণ ‘ফিরিয়ে আনুন’ দেখা যাবে।"
        confirmLabel="হ্যাঁ, মুছে ফেলুন"
        pending={remove.isPending}
        onConfirm={async () => {
          await Promise.all([...selected].map((id) => remove.mutateAsync({ id })));
          setSelected(new Set());
          setBulkDelete(false);
        }}
      />
    </>
  );
}
