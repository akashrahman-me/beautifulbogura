import type { Metadata } from 'next';
import { MatrimonyForm } from '@/features/matrimony';

export const metadata: Metadata = { title: 'বায়োডাটা দিন' };

export default function Page() {
  return <MatrimonyForm />;
}
