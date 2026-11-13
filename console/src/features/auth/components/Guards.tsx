'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import type { Permission } from '@/lib/permissions';
import { Button } from '@/components/ui/Button';
import { Wordmark } from '@/components/ui/Misc';
import { EmptyState } from '@/components/shared/States';
import { TableSkeleton } from '@/components/admin/DataTable';
import { useCan, useSession, useSessionStatus, useSignOut } from '../hooks/useAuth';

/**
 * Wraps the whole signed-in console. Signed out → /login?next=…; signed in without a staff role →
 * a no-access screen. While the session is still being checked the page renders (pages show their
 * own skeleton through RequirePermission), so the route keeps a prerenderable shell and early API
 * calls simply wait on the single-flight token refresh. The API is the real guard.
 */
export function StaffGuard({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const status = useSessionStatus();
  const user = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const signOut = useSignOut();

  useEffect(() => {
    if (status === 'signed-out') router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);

  if (status === 'signed-out') return <>{fallback}</>;
  if (status === 'signed-in' && !user?.role) {
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <div className="flex max-w-md flex-col items-center gap-4">
          <Wordmark tagline="কনসোল" />
          <EmptyState icon="shield" title="এই অ্যাকাউন্টে কনসোলের অনুমতি নেই" action={<Button variant="secondary" iconLeft="logout" loading={signOut.isPending} onClick={() => signOut.mutate()}>অন্য অ্যাকাউন্ট দিয়ে ঢুকুন</Button>}>
            প্রশাসককে আপনার ইমেইল দিয়ে আমন্ত্রণ পাঠাতে বলুন।
          </EmptyState>
        </div>
      </main>
    );
  }
  return <>{children}</>;
}

/** Page-level gate for a permission the role lacks (reached by a typed URL). */
export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const allowed = useCan(permission);
  const status = useSessionStatus();
  if (status === 'unknown') return <TableSkeleton />;
  if (!allowed) return <EmptyState icon="shield" title="এই পাতা দেখার অনুমতি আপনার নেই" action={<Button href="/" variant="secondary">ড্যাশবোর্ডে যান</Button>} />;
  return <>{children}</>;
}

/** Render children only when the permission is held. */
export function Can({ permission, children }: { permission: Permission; children: ReactNode }) {
  return useCan(permission) ? <>{children}</> : null;
}
