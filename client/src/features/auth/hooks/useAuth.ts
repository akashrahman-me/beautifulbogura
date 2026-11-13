import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSession, useSessionStatus } from '@/stores/session.store';
import type { ManageAction } from '@/types/api';
import { authApi } from '../api/auth.api';
import type { AuthProvider, PostKind } from '../schemas/auth.schema';

export { useSession, useSessionStatus };

export const meKeys = { all: ['me'] as const, posts: () => [...meKeys.all, 'posts'] as const };

export function useSignIn() {
  return useMutation({
    mutationFn: ({ provider, returnTo }: { provider: AuthProvider; returnTo: string }) => authApi.signIn(provider, returnTo),
  });
}

export function useSignOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.signOut,
    onSettled: () => {
      qc.removeQueries({ queryKey: meKeys.all });
      toast.success('সাইন আউট হয়েছে');
    },
  });
}

export function useMyPosts() {
  const signedIn = useSessionStatus() === 'signed-in';
  return useQuery({ queryKey: meKeys.posts(), queryFn: ({ signal }) => authApi.myPosts(signal), enabled: signedIn });
}

/** Delete / mark-done from the account page. Refreshes every list, since the post may show anywhere. */
export function useManageMyPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, id, ...body }: ManageAction & { kind: PostKind; id: string }) => authApi.managePost(kind, id, body),
    onSuccess: (_d, v) => {
      qc.invalidateQueries();
      toast.success(v.action === 'delete' ? 'পোস্টটি মুছে ফেলা হয়েছে' : 'পোস্টটি হালনাগাদ হয়েছে');
    },
  });
}
