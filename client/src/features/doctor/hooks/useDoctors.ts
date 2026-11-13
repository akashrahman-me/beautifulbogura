import { keepPreviousData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { doctorApi } from '../api/doctor.api';
import { doctorKeys } from '../api/doctor.keys';
import type { DoctorListParams } from '../schemas/doctor.schema';

export const useDoctors = (params: DoctorListParams) =>
  useInfiniteQuery({
    queryKey: doctorKeys.list(params),
    queryFn: ({ pageParam, signal }) => doctorApi.list({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });

export const useDoctorStats = () =>
  useQuery({ queryKey: doctorKeys.stats(), queryFn: ({ signal }) => doctorApi.stats(signal), staleTime: 5 * 60 * 1000 });

export const useDoctor = (id: string) =>
  useQuery({ queryKey: doctorKeys.detail(id), queryFn: ({ signal }) => doctorApi.getById(id, signal), enabled: Boolean(id) });

export const useCreateDoctor = () =>
  useMutation({
    mutationFn: doctorApi.create,
    onSuccess: () => toast.success('ধন্যবাদ! অ্যাডমিন যাচাইয়ের পর ডাক্তারের তথ্য প্রকাশিত হবে।'),
  });
