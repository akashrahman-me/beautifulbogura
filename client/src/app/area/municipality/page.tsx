import type { Metadata } from 'next';
import { MunicipalityPage } from '@/features/area';

export const metadata: Metadata = { title: 'পৌরসভা' };

export default function Page() {
  return <MunicipalityPage />;
}
