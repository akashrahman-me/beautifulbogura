import { keepPreviousData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { institutionApi } from '../api/institution.api';
import { institutionKeys } from '../api/institution.keys';
import type { ClaimInput, InstitutionListParams } from '../schemas/institution.schema';

export const useInstitutions = (params: InstitutionListParams) =>
  useInfiniteQuery({
    queryKey: institutionKeys.list(params),
    queryFn: ({ pageParam, signal }) => institutionApi.list({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
  });

export const useInstitution = (id: string) =>
  useQuery({ queryKey: institutionKeys.detail(id), queryFn: ({ signal }) => institutionApi.getById(id, signal), enabled: Boolean(id) });

export const useNotices = (institution?: string) =>
  useQuery({ queryKey: institutionKeys.notices(institution), queryFn: ({ signal }) => institutionApi.notices({ institution, limit: 6 }, signal) });

export const useAddInstitution = () =>
  useMutation({ mutationFn: institutionApi.add, onSuccess: () => toast.success('ধন্যবাদ! অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে।') });

export const useClaimInstitution = (id: string) =>
  useMutation({ mutationFn: (input: ClaimInput) => institutionApi.claim(id, input), onSuccess: () => toast.success('দাবি জমা হয়েছে। অ্যাডমিন যোগাযোগ করবেন।') });
