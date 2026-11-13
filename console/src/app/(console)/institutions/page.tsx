import type { Metadata } from 'next';
import { InstitutionsPage } from '@/features/institutions';

export const metadata: Metadata = { title: 'শিক্ষা প্রতিষ্ঠান' };

export default function Page() {
  return <InstitutionsPage />;
}
