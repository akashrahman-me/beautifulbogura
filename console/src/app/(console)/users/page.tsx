import type { Metadata } from 'next';
import { UsersPage } from '@/features/users';

export const metadata: Metadata = { title: 'ব্যবহারকারী' };

export default function Page() {
  return <UsersPage />;
}
