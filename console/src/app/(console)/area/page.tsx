import type { Metadata } from 'next';
import { AreaPage } from '@/features/area';

export const metadata: Metadata = { title: 'উপজেলা পরিচিতি' };

export default function Page() {
  return <AreaPage />;
}
