/**
 * Generic admin resource: list / get / create / update / remove / restore / custom actions,
 * with query keys, cache invalidation and Bangla toasts. A content module is then just
 * schema + table columns + form.
 *
 *   GET    {base}?page&limit&search&sort&…filters → paginated list
 *   GET    {base}/:id                            → one item
 *   POST   {base}                                → create
 *   PATCH  {base}/:id                            → update
 *   DELETE {base}/:id   { reason?, note? }       → soft delete
 *   POST   {base}/:id/restore                    → undo a delete
 *   POST   {base}/:id/{action}  body             → module-specific (approve, feature, ban…)
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type Params } from './api-client';
import type { ListQuery, ReasonInput } from '@/types/api';

export function createResource<T extends { id: string }, Input = Partial<T>, Q extends ListQuery = ListQuery>(
  base: string,
  /** Bangla noun for toasts, e.g. “ডাক্তারের তথ্য”. */
  noun: string,
) {
  const keys = {
    all: ['admin', base] as const,
    lists: () => [...keys.all, 'list'] as const,
    list: (q: Q) => [...keys.lists(), q] as const,
    detail: (id: string) => [...keys.all, 'detail', id] as const,
  };

  const endpoints = {
    list: (q: Q, signal?: AbortSignal) => api.getPaginated<T>(base, { limit: 20, ...(q as unknown as Params) }, signal),
    get: (id: string, signal?: AbortSignal) => api.get<T>(`${base}/${id}`, undefined, signal),
    create: (input: Input) => api.post<T>(base, input),
    update: (id: string, input: Partial<Input>) => api.patch<T>(`${base}/${id}`, input),
    remove: (id: string, body?: ReasonInput) => api.delete(`${base}/${id}`, body),
    restore: (id: string) => api.post<T>(`${base}/${id}/restore`),
    action: <R = T>(id: string, action: string, body?: unknown) => api.post<R>(`${base}/${id}/${action}`, body),
  };

  const useInvalidate = () => {
    const qc = useQueryClient();
    return () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: ['admin', 'counts'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    };
  };

  return {
    keys,
    api: endpoints,

    useList: (q: Q, opts?: { enabled?: boolean }) =>
      useQuery({ queryKey: keys.list(q), queryFn: ({ signal }) => endpoints.list(q, signal), placeholderData: keepPreviousData, enabled: opts?.enabled ?? true }),

    useOne: (id: string | null) =>
      useQuery({ queryKey: keys.detail(id ?? ''), queryFn: ({ signal }) => endpoints.get(id!, signal), enabled: Boolean(id) }),

    /** Create when `id` is null, update otherwise. */
    useSave: () => {
      const invalidate = useInvalidate();
      return useMutation({
        mutationFn: ({ id, input }: { id: string | null; input: Input }) => (id ? endpoints.update(id, input) : endpoints.create(input)),
        onSuccess: (_d, v) => {
          invalidate();
          toast.success(v.id ? `${noun} হালনাগাদ হয়েছে` : `${noun} যুক্ত হয়েছে`);
        },
      });
    },

    /** Soft delete with an undo in the toast. */
    useRemove: () => {
      const invalidate = useInvalidate();
      return useMutation({
        mutationFn: ({ id, ...body }: { id: string } & Partial<ReasonInput>) => endpoints.remove(id, body.reason ? (body as ReasonInput) : undefined),
        onSuccess: (_d, v) => {
          invalidate();
          toast.success(`${noun} মুছে ফেলা হয়েছে`, {
            action: { label: 'ফিরিয়ে আনুন', onClick: () => void endpoints.restore(v.id).then(invalidate) },
          });
        },
      });
    },

    useRestore: () => {
      const invalidate = useInvalidate();
      return useMutation({
        mutationFn: (id: string) => endpoints.restore(id),
        onSuccess: () => {
          invalidate();
          toast.success(`${noun} ফিরিয়ে আনা হয়েছে`);
        },
      });
    },

    /** A named action, e.g. useAction('approve', 'অনুমোদন দেওয়া হয়েছে'). */
    useAction: <B = unknown>(action: string, done: string | ((body: B) => string)) => {
      const invalidate = useInvalidate();
      return useMutation({
        mutationFn: ({ id, body }: { id: string; body?: B }) => endpoints.action(id, action, body),
        onSuccess: (_d, v) => {
          invalidate();
          toast.success(typeof done === 'function' ? done(v.body as B) : done);
        },
      });
    },
  };
}

export type Resource<T extends { id: string }, I, Q extends ListQuery> = ReturnType<typeof createResource<T, I, Q>>;
