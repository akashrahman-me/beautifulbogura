import type { Metadata } from 'next';
import { VotersPage } from '@/features/voters';

export const metadata: Metadata = { title: 'ভোটার তালিকা' };

export default function Page() {
  return <VotersPage />;
}
