import type { Metadata } from 'next';
import { DashboardPage } from '@/features/dashboard';

export const metadata: Metadata = { title: 'ড্যাশবোর্ড' };

export default function Page() {
  return <DashboardPage />;
}
