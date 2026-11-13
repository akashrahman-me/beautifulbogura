import type { Metadata } from 'next';
import { AdministrationPage } from '@/features/area';

export const metadata: Metadata = { title: 'প্রশাসন' };

export default function Page() {
  return <AdministrationPage />;
}
