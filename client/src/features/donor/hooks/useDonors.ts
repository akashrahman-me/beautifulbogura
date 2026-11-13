import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { donorApi } from '../api/donor.api';
import { donorKeys } from '../api/donor.keys';
import type { DonorListParams, UpdateDonationInput } from '../schemas/donor.schema';

export const useDonors = (params: DonorListParams) =>
  useInfiniteQuery({
    queryKey: donorKeys.list(params),
    queryFn: ({ pageParam, signal }) => donorApi.list({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // eligibility changes daily; keep it fresh
  });

export const useDonorStats = () => useQuery({ queryKey: donorKeys.stats(), queryFn: ({ signal }) => donorApi.stats(signal), staleTime: 30 * 1000 });

export const useRegisterDonor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: donorApi.register,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: donorKeys.all });
      toast.success('রক্তদাতা হিসেবে নিবন্ধন সম্পন্ন হয়েছে। ধন্যবাদ!');
    },
  });
};

export const useUpdateLastDonation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateDonationInput & { id: string }) => donorApi.updateLastDonation(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: donorKeys.all });
      toast.success('শেষ রক্তদানের তারিখ হালনাগাদ হয়েছে');
    },
  });
};
