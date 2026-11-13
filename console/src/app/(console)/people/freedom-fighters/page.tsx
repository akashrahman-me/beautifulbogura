import type { Metadata } from 'next';
import { FreedomFightersPage } from '@/features/people';

export const metadata: Metadata = { title: 'বীর মুক্তিযোদ্ধা' };

export default function Page() {
  return <FreedomFightersPage />;
}
