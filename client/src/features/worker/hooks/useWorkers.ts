import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workerApi } from '../api/worker.api';
import { workerKeys } from '../api/worker.keys';
import type { WorkerListParams } from '../schemas/worker.schema';

export const useWorkers = (params: WorkerListParams) =>
  useInfiniteQuery({
    queryKey: workerKeys.list(params),
    queryFn: ({ pageParam, signal }) => workerApi.list({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });

export const useRegisterWorker = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workerApi.register,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workerKeys.lists() });
      toast.success('নিবন্ধন সম্পন্ন হয়েছে');
    },
  });
};
