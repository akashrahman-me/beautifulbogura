import type { Metadata } from 'next';
import { DirectoryPage } from '@/features/directory';

export const metadata: Metadata = { title: 'তালিকা' };

export default function Page() {
  return <DirectoryPage />;
}
