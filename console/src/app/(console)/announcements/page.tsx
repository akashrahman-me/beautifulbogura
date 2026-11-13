import type { Metadata } from 'next';
import { AnnouncementsPage } from '@/features/announcements';

export const metadata: Metadata = { title: 'ঘোষণা' };

export default function Page() {
  return <AnnouncementsPage />;
}
