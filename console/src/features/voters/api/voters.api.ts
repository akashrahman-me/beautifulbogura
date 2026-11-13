import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { createResource } from '@/lib/resource';
import { bn } from '@/lib/utils';
import type { Voter, VoterImport, VoterQuery, VoterStats } from '../schemas/voter.schema';

export const voters = createResource<Voter, never, VoterQuery>('/admin/voters', 'ভোটার');

export const useVoterStats = () => useQuery({ queryKey: ['admin', 'voters', 'stats'], queryFn: ({ signal }) => api.get<VoterStats>('/admin/voters/stats', undefined, signal) });
export const useVoterImports = () => useQuery({ queryKey: ['admin', 'voters', 'imports'], queryFn: ({ signal }) => api.get<VoterImport[]>('/admin/voters/imports', undefined, signal) });

/** Upload a CSV. The API validates every row, upserts by voter number and returns a report. */
export function useImportVoters() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append('file', file);
      return api.post<VoterImport>('/admin/voters/import', body);
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['admin', 'voters'] });
      qc.invalidateQueries({ queryKey: ['admin', '/admin/voters'] });
      toast.success(`${bn(r.imported)} জন নতুন, ${bn(r.updated)} জন হালনাগাদ`);
    },
  });
}
