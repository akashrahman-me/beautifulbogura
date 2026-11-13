import type { Metadata } from 'next';
import { DoctorsPage } from '@/features/doctors';

export const metadata: Metadata = { title: 'ডাক্তার' };

export default function Page() {
  return <DoctorsPage />;
}
