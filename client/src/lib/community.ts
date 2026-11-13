/**
 * Shared plumbing for anonymous community posts (jobs, buy & sell, to-let, car rent, tuition).
 * They all follow one contract: no accounts, a 4–6 digit PIN gates edit / delete / mark-done,
 * posts auto-expire, and anyone can report one.
 *
 *   GET    {base}?search&page&limit&…filters   → paginated list
 *   GET    {base}/:id                          → one post
 *   POST   {base}                              → create (body includes `pin`)
 *   PATCH  {base}/:id                          → update (body includes `pin`)
 *   POST   {base}/:id/manage  { pin, action }  → delete | mark-done
 *   POST   {base}/:id/report  { reason, note } → report
 */
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from './api-client';
import type { ListParams, Paginated, PinAction, ReportInput, Submission } from '@/types/api';

export const PAGE_SIZE = 12;

export function createKeys<P extends object>(name: string) {
  const keys = {
    all: [name] as const,
    lists: () => [...keys.all, 'list'] as const,
    list: (params: P) => [...keys.lists(), params] as const,
    details: () => [...keys.all, 'detail'] as const,
    detail: (id: string) => [...keys.details(), id] as const,
  };
  return keys;
}

export function createCommunityApi<T, C, P extends ListParams>(base: string) {
  return {
    list: (params: P, signal?: AbortSignal) =>
      api.getPaginated<T>(base, { limit: PAGE_SIZE, ...(params as unknown as Record<string, string | number | boolean | undefined>) }, signal),
    get: (id: string, signal?: AbortSignal) => api.get<T>(`${base}/${id}`, undefined, signal),
    create: (input: C) => api.post<Submission>(base, input),
    update: (id: string, input: Partial<C> & { pin: string }) => api.patch<T>(`${base}/${id}`, input),
    manage: (id: string, body: PinAction) => api.post<{ ok: true }>(`${base}/${id}/manage`, body),
    report: (id: string, body: ReportInput) => api.post<{ ok: true }>(`${base}/${id}/report`, body),
  };
}

type CommunityApi<T, C, P extends ListParams> = ReturnType<typeof createCommunityApi<T, C, P>>;
type Keys<P extends object> = ReturnType<typeof createKeys<P>>;

export function createCommunityHooks<T, C, P extends ListParams, CI = C>(
  postApi: CommunityApi<T, C, P>,
  keys: Keys<Omit<P, 'page'>>,
  labels: { created: string; doneLabel?: string },
  /** Custom create (e.g. upload photos first). Defaults to postApi.create. */
  createFn?: (input: CI) => Promise<Submission>,
) {
  return {
    /** Infinite list with “আরও দেখুন”. Filters live in the key; the page does not. */
    useList: (params: Omit<P, 'page'>) =>
      useInfiniteQuery({
        queryKey: keys.list(params),
        queryFn: ({ pageParam, signal }) => postApi.list({ ...params, page: pageParam } as P, signal),
        initialPageParam: 1,
        getNextPageParam: (last: Paginated<T>) =>
          last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
        placeholderData: keepPreviousData,
      }),

    useOne: (id: string) =>
      useQuery({
        queryKey: keys.detail(id),
        queryFn: ({ signal }) => postApi.get(id, signal),
        enabled: Boolean(id),
      }),

    useCreate: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: (input: CI) => (createFn ? createFn(input) : postApi.create(input as unknown as C)),
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: keys.lists() });
          toast.success(labels.created);
        },
      });
    },

    useManage: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...body }: PinAction & { id: string }) => postApi.manage(id, body),
        onSuccess: (_d, v) => {
          qc.invalidateQueries({ queryKey: keys.all });
          toast.success(v.action === 'delete' ? 'পোস্টটি মুছে ফেলা হয়েছে' : (labels.doneLabel ?? 'পোস্টটি হালনাগাদ হয়েছে'));
        },
      });
    },

    useReport: () =>
      useMutation({
        mutationFn: ({ id, ...body }: ReportInput & { id: string }) => postApi.report(id, body),
        onSuccess: () => toast.success('রিপোর্ট পাঠানো হয়েছে। অ্যাডমিন দেখে ব্যবস্থা নেবেন।'),
      }),
  };
}

/** Flatten infinite pages into one array. */
export const flatPages = <T>(data: { pages: Paginated<T>[] } | undefined) => data?.pages.flatMap((p) => p.items) ?? [];
export const totalOf = <T>(data: { pages: Paginated<T>[] } | undefined) => data?.pages[0]?.meta.total ?? 0;
