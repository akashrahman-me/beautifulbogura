import type { Metadata } from 'next';
import { WorkersPage } from '@/features/workers';

export const metadata: Metadata = { title: 'কারিগর' };

export default function Page() {
  return <WorkersPage />;
}
