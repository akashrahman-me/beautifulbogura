'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactNode } from 'react';
import { useForm, type DefaultValues, type FieldValues } from 'react-hook-form';
import type { z } from 'zod';
import { applyApiErrors } from '@/lib/form';
import type { Resource } from '@/lib/resource';
import { uploadImages } from '@/lib/upload';
import type { ListQuery } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Misc';
import { ErrorState } from '@/components/shared/States';
import { ConfirmDialog } from './Dialogs';
import { Sheet } from './Sheet';
import { SpecForm, type FieldSpec } from './SpecForm';

export interface SheetConfig<T extends { id: string }, I, V extends FieldValues> {
  /** Validates form values and turns them into the API input. */
  schema: z.ZodType<I, V>;
  fields: FieldSpec[];
  /** Values for a new item. */
  empty: V;
  /** Values for editing an existing item. */
  toForm: (row: T) => V;
  title: (row: T | undefined) => string;
  /** Read-only facts shown above the form when editing (who submitted, when…). */
  details?: (row: T) => ReactNode;
  /** Extra actions in the footer for an existing item (approve, verify…). */
  footerExtra?: (row: T, close: () => void) => ReactNode;
  width?: number;
  canDelete?: boolean;
}

/** Create / edit sheet for one resource item. Photos (`type: 'image'` fields) are uploaded before saving. */
export function ResourceSheet<T extends { id: string }, I, V extends FieldValues, Q extends ListQuery>({
  resource,
  id,
  onClose,
  noun,
  config,
}: {
  resource: Resource<T, I, Q>;
  /** `'new'`, an id, or null when closed. */
  id: string | null;
  onClose: () => void;
  noun: string;
  config: SheetConfig<T, I, V>;
}) {
  const isNew = id === 'new';
  const one = resource.useOne(id && !isNew ? id : null);
  const save = resource.useSave();
  const remove = resource.useRemove();
  const [confirm, setConfirm] = useState(false);
  const row = isNew ? undefined : one.data;
  const form = useForm<V, unknown, I>({
    resolver: zodResolver(config.schema as never),
    values: (row ? config.toForm(row) : config.empty) as V,
    defaultValues: config.empty as DefaultValues<V>,
    resetOptions: { keepDirtyValues: false },
  });

  const submit = form.handleSubmit(async (input) => {
    // Upload any newly picked photos and put their URLs in place of the File objects.
    const out = { ...(input as Record<string, unknown>) };
    for (const f of config.fields.filter((x) => x.type === 'image')) {
      const v = out[f.name];
      if (Array.isArray(v)) out[f.name] = (await uploadImages(v as File[]))[0] ?? null;
    }
    save.mutate({ id: isNew ? null : id, input: out as I }, { onSuccess: onClose, onError: (e) => applyApiErrors(form, e) });
  });

  const loading = !isNew && one.isPending;
  return (
    <Sheet
      open={!!id}
      onOpenChange={(o) => !o && onClose()}
      title={isNew ? `নতুন ${noun}` : config.title(row)}
      width={config.width}
      dirty={form.formState.isDirty && !save.isPending}
      footer={
        !loading &&
        !one.isError && (
          <>
            {!isNew && config.canDelete !== false && (
              <Button variant="danger-ghost" iconLeft="trash" className="mr-auto" onClick={() => setConfirm(true)}>
                মুছে ফেলুন
              </Button>
            )}
            {row && config.footerExtra?.(row, onClose)}
            <Button variant="ghost" onClick={onClose}>
              বাতিল
            </Button>
            <Button iconLeft="check" loading={save.isPending || form.formState.isSubmitting} onClick={() => void submit()}>
              সংরক্ষণ করুন
            </Button>
          </>
        )
      }
    >
      {one.isError ? (
        <ErrorState error={one.error} onRetry={one.refetch} />
      ) : loading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-surface-sunken" />
          ))}
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="flex flex-col gap-5"
        >
          {row && config.details?.(row)}
          <SpecForm form={form} fields={config.fields} />
          {form.formState.errors.root && <Alert tone="danger" title={form.formState.errors.root.message} />}
          <button type="submit" hidden />
        </form>
      )}
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        tone="emergency"
        icon="trash"
        title={`${noun} মুছে ফেলবেন?`}
        description="মুছে ফেলার পর কিছুক্ষণ ‘ফিরিয়ে আনুন’ দিয়ে ফেরানো যাবে।"
        confirmLabel="হ্যাঁ, মুছে ফেলুন"
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(
            { id: id! },
            {
              onSuccess: () => {
                setConfirm(false);
                onClose();
              },
            },
          )
        }
      />
    </Sheet>
  );
}
