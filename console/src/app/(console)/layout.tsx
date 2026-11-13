import { Suspense } from 'react';
import { TableSkeleton } from '@/components/admin/DataTable';
import { AppShell, ShellSkeleton } from '@/components/layout/AppShell';
import { StaffGuard } from '@/features/auth';

/**
 * Every console page sits inside the staff guard and the shell. Pages read filters from the URL,
 * so their content streams inside a Suspense boundary while the shell prerenders.
 */
export default function ConsoleLayout({ children }: LayoutProps<'/'>) {
  return (
    <StaffGuard fallback={<ShellSkeleton />}>
      <AppShell>
        <Suspense fallback={<TableSkeleton />}>{children}</Suspense>
      </AppShell>
    </StaffGuard>
  );
}
