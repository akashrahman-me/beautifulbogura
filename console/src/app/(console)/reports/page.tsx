import type { Metadata } from 'next';
import { ReportsPage } from '@/features/reports';

export const metadata: Metadata = { title: 'রিপোর্ট' };

export default function Page() {
  return <ReportsPage />;
}
