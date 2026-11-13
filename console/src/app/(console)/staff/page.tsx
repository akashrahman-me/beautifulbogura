import type { Metadata } from 'next';
import { StaffPage } from '@/features/staff';

export const metadata: Metadata = { title: 'স্টাফ' };

export default function Page() {
  return <StaffPage />;
}
