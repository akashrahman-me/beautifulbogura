'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { can, roleLabel, type Permission } from '@/lib/permissions';
import { useSession, useSessionStatus } from '@/stores/session.store';
import type { AuthProvider, StaffRole } from '@/types/api';
import { authApi } from '../api/auth.api';

export { useSession, useSessionStatus };

/** Does the signed-in staff member have this permission? */
export const useCan = (p: Permission) => can(useSession()?.role, p);

export const useSignIn = () =>
  useMutation({ mutationFn: ({ provider, returnTo }: { provider: AuthProvider; returnTo: string }) => authApi.signIn(provider, returnTo) });

export function useSignOut() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.signOut,
    onSettled: () => {
      // Staff share machines: nothing from this session may be shown to the next person.
      qc.clear();
      router.replace('/login');
    },
  });
}

export function useDemoRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: StaffRole) => authApi.demoRole(role),
    onSuccess: (_d, role) => {
      // Refetch everything the new role can see (and drop what it cannot).
      void qc.resetQueries();
      toast.success(`এখন ${roleLabel(role)} হিসেবে দেখছেন`);
    },
  });
}
