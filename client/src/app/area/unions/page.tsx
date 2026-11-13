import type { Metadata } from 'next';
import { UnionsPage } from '@/features/area';

export const metadata: Metadata = { title: 'ইউনিয়নসমূহ' };

export default function Page() {
  return <UnionsPage />;
}
