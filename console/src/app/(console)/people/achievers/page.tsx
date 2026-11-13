import type { Metadata } from 'next';
import { AchieversPage } from '@/features/people';

export const metadata: Metadata = { title: 'কৃতি সন্তান' };

export default function Page() {
  return <AchieversPage />;
}
