'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { api } from '@/lib/api-client';
import { applyApiErrors } from '@/lib/form';
import { formatDate, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Misc';
import { ErrorState } from '@/components/shared/States';
import { SpecForm, type FieldSpec } from './SpecForm';

/**
 * Edit one document (area profile, settings, site notice): GET then PUT the same path.
 * Unsaved changes warn before leaving the page; the save bar sticks to the bottom.
 */
export function DocEditor<D extends { updatedAt?: string; updatedBy?: string }, I, V extends FieldValues>({
  path,
  schema,
  fields,
  toForm,
  savedMessage = 'সংরক্ষণ করা হয়েছে',
}: {
  path: string;
  schema: z.ZodType<I, V>;
  fields: FieldSpec[];
  toForm: (doc: D) => V;
  savedMessage?: string;
}) {
  const qc = useQueryClient();
  const key = ['admin', 'doc', path];
  const doc = useQuery({ queryKey: key, queryFn: ({ signal }) => api.get<D>(path, undefined, signal) });
  const form = useForm<V, unknown, I>({ resolver: zodResolver(schema as never), values: doc.data ? toForm(doc.data) : undefined });
  const save = useMutation({
    mutationFn: (input: I) => api.put<D>(path, input),
    onSuccess: (d) => {
      qc.setQueryData(key, d);
      qc.invalidateQueries({ queryKey: ['admin', 'audit'] });
      toast.success(savedMessage);
    },
    onError: (e) => applyApiErrors(form, e),
  });
  const dirty = form.formState.isDirty;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (doc.error) return <ErrorState error={doc.error} onRetry={doc.refetch} />;
  if (doc.isPending) return <div className="h-96 animate-pulse rounded-lg bg-surface-sunken" aria-busy="true" />;
  return (
    <form noValidate onSubmit={form.handleSubmit((v) => save.mutate(v))} className="flex flex-col gap-5">
      <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
        <SpecForm form={form} fields={fields} />
      </div>
      {form.formState.errors.root && <Alert tone="danger" title={form.formState.errors.root.message} />}
      <div className="sticky bottom-4 z-[var(--z-sticky)] flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface-raised px-4 py-3 shadow-[var(--shadow-lg)]">
        <span className="mr-auto text-caption text-ink-muted">
          {dirty ? 'সংরক্ষণ না করা পরিবর্তন আছে' : doc.data.updatedAt ? `শেষ হালনাগাদ ${formatDate(doc.data.updatedAt)} (${timeAgo(doc.data.updatedAt)})${doc.data.updatedBy ? ` · ${doc.data.updatedBy}` : ''}` : ''}
        </span>
        <Button variant="ghost" disabled={!dirty} onClick={() => form.reset()}>
          বাদ দিন
        </Button>
        <Button type="submit" iconLeft="check" disabled={!dirty} loading={save.isPending}>
          সংরক্ষণ করুন
        </Button>
      </div>
    </form>
  );
}
